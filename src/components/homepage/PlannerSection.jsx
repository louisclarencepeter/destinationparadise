import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import '../../styles/homepage/planner.css';
import { ArrowIcon } from './Icons.jsx';

const PLANNER_TITLE = 'Tell me about your dream trip';

const renderInlineFormatting = (text) => {
  const parts = [];
  const pattern = /(\*\*([^*\n]+)\*\*|\*([^*\n]+)\*)/g;
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[2]) {
      parts.push(<strong key={`strong-${match.index}`}>{match[2]}</strong>);
    } else {
      parts.push(<em key={`em-${match.index}`}>{match[3]}</em>);
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
};

const renderFormattedText = (text) =>
  (text || '')
    .split(/\n\n+/)
    .map((paragraph, paragraphIndex) => (
      <p key={paragraphIndex}>
        {paragraph.split('\n').map((line, lineIndex) => (
          <Fragment key={lineIndex}>
            {lineIndex > 0 && <br />}
            {renderInlineFormatting(line)}
          </Fragment>
        ))}
      </p>
    ));

export default function PlannerSection({ initialPrompt }) {
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [typedTitle, setTypedTitle] = useState(PLANNER_TITLE);
  const [titleTyping, setTitleTyping] = useState(false);
  const logRef = useRef(null);
  const inputRef = useRef(null);
  const handledPromptRef = useRef(null);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [history, sending]);

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
      const reply = data.reply || "Hmm, I lost my train of thought. Could you say that again?";
      setHistory((h) => [...h, { role: 'assistant', content: reply }]);
    } catch (err) {
      setHistory((h) => [...h, { role: 'assistant', content: "Pole sana — I couldn't reach the planner just now. Try again in a moment, or message the team directly via the WhatsApp button." }]);
    } finally {
      setSending(false);
      if (inputRef.current) inputRef.current.focus();
    }
  }, [history, sending]);

  useEffect(() => {
    if (!initialPrompt || handledPromptRef.current === initialPrompt.id || sending) return;
    handledPromptRef.current = initialPrompt.id;
    send(initialPrompt.text);
  }, [initialPrompt, sending, send]);

  return (
    <section className="planner reveal" id="planner">
      <div className="planner__wrap">
        <div className="planner__intro">
          <span className="section-eyebrow planner__eyebrow"><span className="planner__pulse"></span> AI Trip Planner</span>
          <h2 className="section-title planner__title" aria-label={PLANNER_TITLE}>
            <span className="planner__typing" aria-hidden="true">{typedTitle}</span>
            <span className={`planner__cursor${titleTyping ? ' planner__cursor--typing' : ''}`} aria-hidden="true"></span>
          </h2>
          <p className="planner__lead">Chat with our AI planner — built on years of routes the team has walked. It'll ask the right questions and sketch a day-by-day itinerary you can hand to us to book.</p>
          <ul className="planner__bullets">
            <li><span className="planner__bullet-icon">✦</span> <span><strong>Asks about you</strong> — pace, budget, water vs. wildlife, kids in tow, special dates.</span></li>
            <li><span className="planner__bullet-icon">✦</span> <span><strong>Builds a draft</strong> — nights per place, recommended hotels, excursion pacing.</span></li>
            <li><span className="planner__bullet-icon">✦</span> <span><strong>Hands it to a human</strong> — our team reviews, prices, and confirms with real availability.</span></li>
          </ul>
          <div className="planner__suggestions">
            <span className="planner__suggestions-label">Try:</span>
            <button className="planner__suggest" onClick={() => send("We're a couple, 8 nights in October. We want a mix of beach, dhow sailing, and one big experience. Mid-range hotels.")}>Couple, 8 nights, beach + dhow</button>
            <button className="planner__suggest" onClick={() => send('Family of four with kids 9 and 12. Two weeks in July. We want a few days of safari then unwind on a beach. Budget around $4k pp.')}>Family with kids, safari + beach</button>
            <button className="planner__suggest" onClick={() => send('Solo traveler, 5 nights in February. Love spice markets, history, snorkeling. Boutique hotel under $200/night.')}>Solo, history + snorkel</button>
          </div>
        </div>

        <div className="planner__chat" key={resetKey}>
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
              onClick={() => { setHistory([]); setResetKey((k) => k + 1); }}
            >↻</button>
          </header>
          <div className="planner__log" ref={logRef} role="log" aria-live="polite">
            <div className="planner__msg planner__msg--bot">
              <div className="planner__bubble">
                <p>Karibu! 👋 I'm the Destination Paradise planner — let's sketch your trip together.</p>
                <p>To start, what kind of pace are you after? <em>Beach &amp; chill, mainland safari, deep cultural dive,</em> or a mix?</p>
              </div>
            </div>
            {history.map((m, i) => (
              <div key={i} className={`planner__msg planner__msg--${m.role === 'user' ? 'user' : 'bot'}`}>
                <div className="planner__bubble">{renderFormattedText(m.content)}</div>
              </div>
            ))}
            {sending && (
              <div className="planner__msg planner__msg--bot planner__msg--typing">
                <div className="planner__bubble">
                  <span className="planner__dot"></span>
                  <span className="planner__dot"></span>
                  <span className="planner__dot"></span>
                </div>
              </div>
            )}
          </div>
          <form
            className="planner__form"
            onSubmit={(e) => { e.preventDefault(); send(input.trim()); }}
          >
            <textarea
              ref={inputRef}
              className="planner__input"
              rows={1}
              placeholder="Tell me what you're dreaming of…"
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
              required
            />
            <button className="planner__send" type="submit" aria-label="Send" disabled={sending || !input.trim()}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </form>
          <footer className="planner__foot">
            <span>Itineraries are drafts. A human reviews and prices everything before you book.</span>
            <a className="planner__handoff" href="#contact">Send draft to the team →</a>
          </footer>
        </div>
      </div>
    </section>
  );
}
