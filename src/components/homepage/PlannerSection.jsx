import { useCallback, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import '../../styles/homepage/planner.css';
import { extractContact } from '../../utils/plannerHandoff.js';

const PLANNER_TITLE = 'Tell me about your dream trip';
const QUICK_REPLIES = [
  'Beach and chill',
  'Safari + Zanzibar',
  'Honeymoon trip',
  'Family friendly',
];
const THINKING_MESSAGES = [
  'Plotting a route',
  'Checking the pace',
  'Balancing beach and safari',
  'Shaping the draft',
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
      setHandoffError('Share your email in the chat first so we can reply.');
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
      const rawReply = data.reply || "Hmm, I lost my train of thought. Could you say that again?";
      const ready = HANDOFF_TOKEN_REGEX.test(rawReply);
      const cleaned = stripToken(rawReply) || "Asante! I've sent this draft to the team — they'll be in touch within a day.";
      const updated = [...next, { role: 'assistant', content: cleaned }];
      setHistory(updated);
      if (ready) submitHandoff(updated);
    } catch (err) {
      setHistory((h) => [...h, { role: 'assistant', content: "Pole sana — I couldn't reach the planner just now. Try again in a moment, or message the team directly via the WhatsApp button." }]);
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
          <span className="section-eyebrow planner__eyebrow"><span className="planner__pulse"></span> AI Trip Planner</span>
          <h2 className="section-title planner__title" aria-label={PLANNER_TITLE}>
            <span className="planner__typing" aria-hidden="true">{typedTitle}</span>
            <span className={`planner__cursor${titleTyping ? ' planner__cursor--typing' : ''}`} aria-hidden="true"></span>
          </h2>
          <p className="planner__lead">Chat with our AI planner — built on years of routes the team has walked. It'll ask the right questions, sketch a day-by-day itinerary, and send it straight to the team when you're ready.</p>
          <ul className="planner__bullets">
            <li><span className="planner__bullet-icon">✦</span> <span><strong>Asks about you</strong> — pace, budget, water vs. wildlife, kids in tow, special dates.</span></li>
            <li><span className="planner__bullet-icon">✦</span> <span><strong>Builds a draft</strong> — nights per place, recommended hotels, excursion pacing.</span></li>
            <li><span className="planner__bullet-icon">✦</span> <span><strong>Sends it to the team</strong> — confirm in the chat and we'll email a copy and reply within a day.</span></li>
          </ul>
          <div className="planner__suggestions">
            <span className="planner__suggestions-label">Try:</span>
            <button className="planner__suggest" onClick={() => send("We're a couple, 8 nights in October. We want a mix of beach, dhow sailing, and one big experience. Mid-range hotels.")}>Couple, 8 nights, beach + dhow</button>
            <button className="planner__suggest" onClick={() => send('Family of four with kids 9 and 12. Two weeks in July. We want a few days of safari then unwind on a beach. Budget around $4k pp.')}>Family with kids, safari + beach</button>
            <button className="planner__suggest" onClick={() => send('Solo traveler, 5 nights in February. Love spice markets, history, snorkeling. Boutique hotel under $200/night.')}>Solo, history + snorkel</button>
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
              <span><span className="planner__online"></span> Powered by Claude · usually replies instantly</span>
            </div>
            <button
              className="planner__reset"
              title="Start over"
              onClick={startOver}
            >↻</button>
          </header>
          <div className="planner__log" ref={logRef} role="log" aria-live="polite">
            <div className="planner__msg planner__msg--bot planner__msg--welcome">
              <div className="planner__bubble">
                <p>Karibu! 👋 I'm the Destination Paradise planner — let's sketch your trip together.</p>
                <p>To start, what kind of pace are you after? <em>Beach &amp; chill, mainland safari, deep cultural dive,</em> or a mix?</p>
                {history.length === 0 && !sending && (
                  <div className="planner__quick-replies" aria-label="Quick replies">
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
                Sending your draft to the team…
              </div>
            )}
            {handoffState === 'updating' && (
              <div className="planner__status planner__status--sending" role="status">
                <span className="planner__status-dot"></span>
                Sending your update to the team…
              </div>
            )}
            {handoffState === 'sent' && (
              <div className="planner__status planner__status--sent" role="status">
                <strong>Asante! ✓ Your draft is with the team.</strong>
                <span>You'll get an email copy and a reply within a day. Need to change something? Just type below — I'll send the team an update. Or start a new plan:</span>
                <button type="button" className="planner__status-action" onClick={startOver}>Start a new plan</button>
              </div>
            )}
            {handoffState === 'updated' && (
              <div className="planner__status planner__status--sent" role="status">
                <strong>✓ Update {updateCount} sent to the team.</strong>
                <span>They'll see the revised plan. Type below to make another change, or start fresh:</span>
                <button type="button" className="planner__status-action" onClick={startOver}>Start a new plan</button>
              </div>
            )}
            {handoffState === 'error' && (
              <div className="planner__status planner__status--error" role="status">
                <strong>Pole sana — that didn't go through.</strong>
                <span>{handoffError || 'Please try again, or message us on WhatsApp.'}</span>
                <button type="button" className="planner__status-action" onClick={retryHandoff}>Try again</button>
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
                  ? 'Type an update here…'
                  : 'Tell me your dream trip…'
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
            <button className="planner__send" type="submit" aria-label="Send" disabled={isInputBusy || !input.trim()}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </form>
          <footer className="planner__foot">
            <span className="planner__foot-note">Itineraries are drafts. A human reviews and prices everything before you book.</span>
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
                ? 'Sent to team ✓'
                : 'Send to team'}
            </button>
          </footer>
        </div>
      </div>
    </section>
  );
}
