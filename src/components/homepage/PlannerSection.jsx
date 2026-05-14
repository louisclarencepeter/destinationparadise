import { useCallback, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import '../../styles/homepage/planner.css';
import { extractContact } from '../../utils/plannerHandoff.js';

const PLANNER_TITLE = 'Opowiedz mi o swojej wymarzonej podróży';
const QUICK_REPLIES = [
  'Plaża i spokój',
  'Safari + Zanzibar',
  'Podróż poślubna',
  'Rodzinnie',
];
const THINKING_MESSAGES = [
  'Układam trasę',
  'Sprawdzam tempo',
  'Równoważę plażę i safari',
  'Szkicuję plan',
];
const HANDOFF_TOKEN = '[[PLANNER_HANDOFF_READY]]';
const HANDOFF_TOKEN_REGEX = /\[\[\s*PLANNER_HANDOFF_READY\s*\]\]/g;

const stripToken = (text = '') => text.replace(HANDOFF_TOKEN_REGEX, '').trim();

export default function PlannerSection({ initialPrompt }) {
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('plannerHistory');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [typedTitle, setTypedTitle] = useState(PLANNER_TITLE);
  const [titleTyping, setTitleTyping] = useState(false);
  const [thinkingIndex, setThinkingIndex] = useState(0);
  const [handoffState, setHandoffState] = useState('idle'); // idle | sending | sent | error | updated
  const [handoffError, setHandoffError] = useState('');
  const [updateCount, setUpdateCount] = useState(0);
  const logRef = useRef(null);
  const inputRef = useRef(null);
  const handledPromptRef = useRef(null);
  const handoffInflightRef = useRef(false);
  const handoffSentCountRef = useRef(0);

  useEffect(() => {
    localStorage.setItem('plannerHistory', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [history, sending, handoffState]);

  useEffect(() => {
    if (!sending) {
      setThinkingIndex(0);
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setThinkingIndex((index) => (index + 1) % THINKING_MESSAGES.length);
    }, 1800);

    return () => window.clearInterval(intervalId);
  }, [sending]);

  useEffect(() => {
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      setTypedTitle(PLANNER_TITLE);
      setTitleTyping(false);
      return undefined;
    }

    let timeoutId;
    let index = 0;
    setTypedTitle('');
    setTitleTyping(true);

    const typeNext = () => {
      index += 1;
      setTypedTitle(PLANNER_TITLE.slice(0, index));

      if (index >= PLANNER_TITLE.length) {
        setTitleTyping(false);
        return;
      }

      const char = PLANNER_TITLE[index - 1];
      const nextChar = PLANNER_TITLE[index];
      const pause = char === ' ' || nextChar === ' ' ? 94 : 42 + ((index % 5) * 13);
      timeoutId = window.setTimeout(typeNext, pause);
    };

    timeoutId = window.setTimeout(typeNext, 360);
    return () => window.clearTimeout(timeoutId);
  }, []);

  const submitHandoff = useCallback(async (finalHistory) => {
    if (handoffInflightRef.current) return;
    handoffInflightRef.current = true;

    const contact = extractContact(finalHistory);
    if (!contact.email) {
      handoffInflightRef.current = false;
      setHandoffState('error');
      setHandoffError('Najpierw podaj email w czacie, żebyśmy mogli odpowiedzieć.');
      return;
    }

    const updateIndex = handoffSentCountRef.current;
    setHandoffState(updateIndex > 0 ? 'updating' : 'sending');
    setHandoffError('');

    try {
      const res = await fetch('/api/planner-send', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ history: finalHistory, contact, updateCount: updateIndex }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'send-failed');
      }
      handoffSentCountRef.current = updateIndex + 1;
      if (updateIndex > 0) {
        setUpdateCount(updateIndex);
        setHandoffState('updated');
      } else {
        setHandoffState('sent');
      }
    } catch (err) {
      setHandoffState('error');
      setHandoffError(err.message === 'send-failed' ? '' : (err.message || ''));
    } finally {
      handoffInflightRef.current = false;
    }
  }, []);

  const send = useCallback(async (text) => {
    if (!text || sending) return;
    const next = [...history, { role: 'user', content: text }];
    setHistory(next);
    setInput('');
    setSending(true);
    if (inputRef.current) inputRef.current.style.height = 'auto';
    try {
      const res = await fetch('/api/planner', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ history: next }),
      });
      const data = await res.json();
      const rawReply = data.reply || 'Hmm, zgubiłem wątek. Możesz napisać to jeszcze raz?';
      const ready = HANDOFF_TOKEN_REGEX.test(rawReply);
      const cleaned = stripToken(rawReply) || 'Asante! Wysłałem szkic do zespołu. Odezwą się w ciągu dnia.';
      const updated = [...next, { role: 'assistant', content: cleaned }];
      setHistory(updated);
      if (ready) submitHandoff(updated);
    } catch (err) {
      setHistory((h) => [...h, { role: 'assistant', content: 'Pole sana — nie mogę teraz połączyć się z planerem. Spróbuj za chwilę albo napisz do zespołu przez WhatsApp.' }]);
    } finally {
      setSending(false);
      if (inputRef.current) inputRef.current.focus();
    }
  }, [history, sending, submitHandoff]);

  useEffect(() => {
    if (!initialPrompt || handledPromptRef.current === initialPrompt.id || sending) return;
    handledPromptRef.current = initialPrompt.id;
    send(initialPrompt.text);
  }, [initialPrompt, sending, send]);

  const startOver = () => {
    setHistory([]);
    localStorage.removeItem('plannerHistory');
    setResetKey((k) => k + 1);
    setHandoffState('idle');
    setHandoffError('');
    setUpdateCount(0);
    handoffInflightRef.current = false;
    handoffSentCountRef.current = 0;
  };

  const retryHandoff = () => {
    handoffInflightRef.current = false;
    submitHandoff(history);
  };

  const isInputBusy = sending || handoffState === 'sending' || handoffState === 'updating';

  return (
    <section className="planner reveal" id="planner">
      <div className="planner__wrap">
        <div className="planner__intro">
          <span className="section-eyebrow planner__eyebrow"><span className="planner__pulse"></span> Planer podróży AI</span>
          <h2 className="section-title planner__title" aria-label={PLANNER_TITLE}>
            <span className="planner__typing" aria-hidden="true">{typedTitle}</span>
            <span className={`planner__cursor${titleTyping ? ' planner__cursor--typing' : ''}`} aria-hidden="true"></span>
          </h2>
          <p className="planner__lead">Porozmawiaj z naszym planerem AI, opartym na trasach, które zespół zna z praktyki. Zada właściwe pytania, naszkicuje plan dzień po dniu i wyśle go do zespołu, gdy będziesz gotowy.</p>
          <ul className="planner__bullets">
            <li><span className="planner__bullet-icon">✦</span> <span><strong>Pyta o Ciebie</strong> — tempo, budżet, ocean czy dzika przyroda, dzieci, specjalne daty.</span></li>
            <li><span className="planner__bullet-icon">✦</span> <span><strong>Buduje szkic</strong> — noce w każdym miejscu, rekomendowane hotele i rytm wycieczek.</span></li>
            <li><span className="planner__bullet-icon">✦</span> <span><strong>Wysyła do zespołu</strong> — potwierdź w czacie, a wyślemy kopię emailem i odpowiemy w ciągu dnia.</span></li>
          </ul>
          <div className="planner__suggestions">
            <span className="planner__suggestions-label">Spróbuj:</span>
            <button className="planner__suggest" onClick={() => send('Jesteśmy parą, 8 nocy w październiku. Chcemy połączyć plażę, rejs dhow i jedno większe przeżycie. Hotele w średnim standardzie.')}>Para, 8 nocy, plaża + dhow</button>
            <button className="planner__suggest" onClick={() => send('Rodzina czteroosobowa, dzieci 9 i 12 lat. Dwa tygodnie w lipcu. Chcemy kilka dni safari, potem odpoczynek na plaży. Budżet około $4k za osobę.')}>Rodzina z dziećmi, safari + plaża</button>
            <button className="planner__suggest" onClick={() => send('Podróżuję solo, 5 nocy w lutym. Lubię targi przypraw, historię i snorkeling. Hotel butikowy poniżej $200 za noc.')}>Solo, historia + snorkeling</button>
          </div>
        </div>

        <div className="planner__chat" id="planner-chat" key={resetKey}>
          <header className="planner__header">
            <div className="planner__avatar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
              </svg>
            </div>
            <div className="planner__header-text">
              <strong>Paradise Planner</strong>
              <span><span className="planner__online"></span> Zasilany przez Claude · zwykle odpowiada od razu</span>
            </div>
            <button
              className="planner__reset"
              title="Zacznij od nowa"
              onClick={startOver}
            >↻</button>
          </header>
          <div className="planner__log" ref={logRef} role="log" aria-live="polite">
            <div className="planner__msg planner__msg--bot planner__msg--welcome">
              <div className="planner__bubble">
                <p>Karibu! Jestem planerem Destination Paradise. Naszkicujmy razem Twoją podróż.</p>
                <p>Na początek: jakiego tempa szukasz? <em>Plaża i luz, safari na kontynencie, mocne zanurzenie w kulturze</em> czy miks?</p>
                {history.length === 0 && !sending && (
                  <div className="planner__quick-replies" aria-label="Szybkie odpowiedzi">
                    {QUICK_REPLIES.map((reply) => (
                      <button key={reply} type="button" onClick={() => send(reply)}>
                        {reply}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {history.map((m, i) => (
              <div key={i} className={`planner__msg planner__msg--${m.role === 'user' ? 'user' : 'bot'}`}>
                <div className="planner__bubble"><ReactMarkdown>{m.content}</ReactMarkdown></div>
              </div>
            ))}
            {sending && (
              <div className="planner__msg planner__msg--bot planner__msg--typing">
                <div className="planner__bubble">
                  <span className="planner__thinking-text">{THINKING_MESSAGES[thinkingIndex]}</span>
                  <span className="planner__dot"></span>
                  <span className="planner__dot"></span>
                  <span className="planner__dot"></span>
                </div>
              </div>
            )}
            {handoffState === 'sending' && (
              <div className="planner__status planner__status--sending" role="status">
                <span className="planner__status-dot"></span>
                Wysyłamy szkic do zespołu…
              </div>
            )}
            {handoffState === 'updating' && (
              <div className="planner__status planner__status--sending" role="status">
                <span className="planner__status-dot"></span>
                Wysyłamy aktualizację do zespołu…
              </div>
            )}
            {handoffState === 'sent' && (
              <div className="planner__status planner__status--sent" role="status">
                <strong>Asante! ✓ Twój szkic jest już u zespołu.</strong>
                <span>Dostaniesz kopię emailem i odpowiedź w ciągu dnia. Chcesz coś zmienić? Napisz poniżej, a wyślę aktualizację. Możesz też zacząć nowy plan:</span>
                <button type="button" className="planner__status-action" onClick={startOver}>Zacznij nowy plan</button>
              </div>
            )}
            {handoffState === 'updated' && (
              <div className="planner__status planner__status--sent" role="status">
                <strong>✓ Aktualizacja {updateCount} wysłana do zespołu.</strong>
                <span>Zobaczą poprawiony plan. Napisz poniżej, aby dodać kolejną zmianę, albo zacznij od nowa:</span>
                <button type="button" className="planner__status-action" onClick={startOver}>Zacznij nowy plan</button>
              </div>
            )}
            {handoffState === 'error' && (
              <div className="planner__status planner__status--error" role="status">
                <strong>Pole sana — nie udało się wysłać.</strong>
                <span>{handoffError || 'Spróbuj ponownie albo napisz do nas na WhatsApp.'}</span>
                <button type="button" className="planner__status-action" onClick={retryHandoff}>Spróbuj ponownie</button>
              </div>
            )}
          </div>
          <form
            className={`planner__form${input.trim() ? ' planner__form--active' : ''}`}
            onSubmit={(e) => { e.preventDefault(); send(input.trim()); }}
          >
            <textarea
              ref={inputRef}
              className="planner__input"
              rows={1}
              placeholder={
                handoffState === 'sent' || handoffState === 'updated'
                  ? 'Wpisz tutaj aktualizację…'
                  : 'Opowiedz o wymarzonej podróży…'
              }
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 140) + 'px';
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send(input.trim());
                }
              }}
              disabled={isInputBusy}
              required={!isInputBusy}
            />
            <button className="planner__send" type="submit" aria-label="Wyślij" disabled={isInputBusy || !input.trim()}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </form>
          <footer className="planner__foot">
            <span className="planner__foot-note">Plany są szkicami. Przed rezerwacją człowiek sprawdza i wycenia wszystko dokładnie.</span>
            <button
              type="button"
              className="planner__handoff"
              onClick={() => submitHandoff(history)}
              disabled={
                isInputBusy ||
                handoffState === 'sent' ||
                history.filter((m) => m.role === 'user').length < 1
              }
            >
              {handoffState === 'sent' || handoffState === 'updated'
                ? 'Wysłano do zespołu ✓'
                : 'Wyślij do zespołu'}
            </button>
          </footer>
        </div>
      </div>
    </section>
  );
}
