import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useTranslation } from 'react-i18next';
import '../../styles/homepage/planner.css';
import { extractContact } from '../../utils/plannerHandoff.js';

const HANDOFF_TOKEN = '[[PLANNER_HANDOFF_READY]]';
const HANDOFF_TOKEN_REGEX = /\[\[\s*PLANNER_HANDOFF_READY\s*\]\]/g;

const stripToken = (text = '') => text.replace(HANDOFF_TOKEN_REGEX, '').trim();

export default function PlannerSection({ initialPrompt }) {
  const { t } = useTranslation('home');
  const plannerTitle = t('planner.title');
  const quickReplies = useMemo(() => t('planner.quick_replies', { returnObjects: true }), [t]);
  const thinkingMessages = useMemo(() => t('planner.thinking_messages', { returnObjects: true }), [t]);
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
  const [typedTitle, setTypedTitle] = useState(plannerTitle);
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
      setThinkingIndex((index) => (index + 1) % thinkingMessages.length);
    }, 1800);

    return () => window.clearInterval(intervalId);
  }, [sending, thinkingMessages.length]);

  useEffect(() => {
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      setTypedTitle(plannerTitle);
      setTitleTyping(false);
      return undefined;
    }

    let timeoutId;
    let index = 0;
    setTypedTitle('');
    setTitleTyping(true);

    const typeNext = () => {
      index += 1;
      setTypedTitle(plannerTitle.slice(0, index));

      if (index >= plannerTitle.length) {
        setTitleTyping(false);
        return;
      }

      const char = plannerTitle[index - 1];
      const nextChar = plannerTitle[index];
      const pause = char === ' ' || nextChar === ' ' ? 94 : 42 + ((index % 5) * 13);
      timeoutId = window.setTimeout(typeNext, pause);
    };

    timeoutId = window.setTimeout(typeNext, 360);
    return () => window.clearTimeout(timeoutId);
  }, [plannerTitle]);

  const submitHandoff = useCallback(async (finalHistory) => {
    if (handoffInflightRef.current) return;
    handoffInflightRef.current = true;

    const contact = extractContact(finalHistory);
    if (!contact.email) {
      handoffInflightRef.current = false;
      setHandoffState('error');
      setHandoffError(t('planner.fallbacks.missing_email'));
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
  }, [t]);

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
      const rawReply = data.reply || t('planner.fallbacks.reply_blank');
      const ready = HANDOFF_TOKEN_REGEX.test(rawReply);
      const cleaned = stripToken(rawReply) || t('planner.fallbacks.reply_after_token');
      const updated = [...next, { role: 'assistant', content: cleaned }];
      setHistory(updated);
      if (ready) submitHandoff(updated);
    } catch (err) {
      setHistory((h) => [...h, { role: 'assistant', content: t('planner.fallbacks.network_error') }]);
    } finally {
      setSending(false);
      if (inputRef.current) inputRef.current.focus();
    }
  }, [history, sending, submitHandoff, t]);

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
          <span className="section-eyebrow planner__eyebrow"><span className="planner__pulse"></span> {t('planner.eyebrow')}</span>
          <h2 className="section-title planner__title" aria-label={plannerTitle}>
            <span className="planner__typing" aria-hidden="true">{typedTitle}</span>
            <span className={`planner__cursor${titleTyping ? ' planner__cursor--typing' : ''}`} aria-hidden="true"></span>
          </h2>
          <p className="planner__lead">{t('planner.lead')}</p>
          <ul className="planner__bullets">
            <li><span className="planner__bullet-icon">✦</span> <span><strong>{t('planner.bullets.asks_strong')}</strong>{t('planner.bullets.asks_text')}</span></li>
            <li><span className="planner__bullet-icon">✦</span> <span><strong>{t('planner.bullets.builds_strong')}</strong>{t('planner.bullets.builds_text')}</span></li>
            <li><span className="planner__bullet-icon">✦</span> <span><strong>{t('planner.bullets.sends_strong')}</strong>{t('planner.bullets.sends_text')}</span></li>
          </ul>
          <div className="planner__suggestions">
            <span className="planner__suggestions-label">{t('planner.suggestions.label')}</span>
            <button className="planner__suggest" onClick={() => send(t('planner.suggestions.couple_prompt'))}>{t('planner.suggestions.couple_button')}</button>
            <button className="planner__suggest" onClick={() => send(t('planner.suggestions.family_prompt'))}>{t('planner.suggestions.family_button')}</button>
            <button className="planner__suggest" onClick={() => send(t('planner.suggestions.solo_prompt'))}>{t('planner.suggestions.solo_button')}</button>
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
              <strong>{t('planner.header.name')}</strong>
              <span><span className="planner__online"></span> {t('planner.header.subtitle')}</span>
            </div>
            <button
              className="planner__reset"
              title={t('planner.header.reset_title')}
              onClick={startOver}
            >↻</button>
          </header>
          <div className="planner__log" ref={logRef} role="log" aria-live="polite">
            <div className="planner__msg planner__msg--bot planner__msg--welcome">
              <div className="planner__bubble">
                <p>{t('planner.welcome.p1')}</p>
                <p>{t('planner.welcome.p2_prefix')}<em>{t('planner.welcome.p2_em')}</em>{t('planner.welcome.p2_suffix')}</p>
                {history.length === 0 && !sending && (
                  <div className="planner__quick-replies" aria-label={t('planner.welcome.quick_replies_aria')}>
                    {quickReplies.map((reply) => (
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
                  <span className="planner__thinking-text">{thinkingMessages[thinkingIndex]}</span>
                  <span className="planner__dot"></span>
                  <span className="planner__dot"></span>
                  <span className="planner__dot"></span>
                </div>
              </div>
            )}
            {handoffState === 'sending' && (
              <div className="planner__status planner__status--sending" role="status">
                <span className="planner__status-dot"></span>
                {t('planner.status.sending')}
              </div>
            )}
            {handoffState === 'updating' && (
              <div className="planner__status planner__status--sending" role="status">
                <span className="planner__status-dot"></span>
                {t('planner.status.updating')}
              </div>
            )}
            {handoffState === 'sent' && (
              <div className="planner__status planner__status--sent" role="status">
                <strong>{t('planner.status.sent_title')}</strong>
                <span>{t('planner.status.sent_text')}</span>
                <button type="button" className="planner__status-action" onClick={startOver}>{t('planner.status.start_new_plan')}</button>
              </div>
            )}
            {handoffState === 'updated' && (
              <div className="planner__status planner__status--sent" role="status">
                <strong>{t('planner.status.updated_title', { count: updateCount })}</strong>
                <span>{t('planner.status.updated_text')}</span>
                <button type="button" className="planner__status-action" onClick={startOver}>{t('planner.status.start_new_plan')}</button>
              </div>
            )}
            {handoffState === 'error' && (
              <div className="planner__status planner__status--error" role="status">
                <strong>{t('planner.status.error_title')}</strong>
                <span>{handoffError || t('planner.status.error_text_default')}</span>
                <button type="button" className="planner__status-action" onClick={retryHandoff}>{t('planner.status.try_again')}</button>
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
                  ? t('planner.form.placeholder_done')
                  : t('planner.form.placeholder_idle')
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
            <button className="planner__send" type="submit" aria-label={t('planner.form.send_aria')} disabled={isInputBusy || !input.trim()}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </form>
          <footer className="planner__foot">
            <span className="planner__foot-note">{t('planner.foot.note')}</span>
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
                ? t('planner.foot.handoff_done')
                : t('planner.foot.handoff_idle')}
            </button>
          </footer>
        </div>
      </div>
    </section>
  );
}
