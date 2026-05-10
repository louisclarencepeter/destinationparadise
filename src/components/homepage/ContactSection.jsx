import { useEffect, useRef, useState } from 'react';
import '../../styles/homepage/contact.css';
import { CONTACT_INFO } from '../../constants/contactInfo.js';
import { ArrowIcon } from './Icons.jsx';
import { clearPlannerHandoff, isPlannerHandoffMessage, PLANNER_HANDOFF_EVENT, readPlannerHandoff } from '../../utils/plannerHandoff.js';

const encodeForm = (data) =>
  Object.keys(data)
    .map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(data[k]))
    .join('&');

async function postNetlifyForm(formName, fields) {
  return fetch('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: encodeForm({ 'form-name': formName, ...fields }),
  });
}

export default function ContactSection() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [plannerHandoff, setPlannerHandoff] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const messageRef = useRef(null);
  const update = (k) => (e) => {
    setStatus('idle');
    setForm((s) => ({ ...s, [k]: e.target.value }));
  };

  useEffect(() => {
    const applyPlannerHandoff = (handoff = readPlannerHandoff(), focusMessage = false) => {
      if (!handoff) return;

      setPlannerHandoff(handoff);
      setStatus('idle');
      setForm((current) => ({
        ...current,
        subject: !current.subject.trim() || current.subject === handoff.subject ? handoff.subject : current.subject,
        message: !current.message.trim() || isPlannerHandoffMessage(current.message) ? handoff.message : current.message,
      }));

      if (focusMessage) {
        window.setTimeout(() => messageRef.current?.focus(), 120);
      }
    };

    if (window.location.hash === '#contact') {
      applyPlannerHandoff();
    }

    const onPlannerHandoff = (event) => applyPlannerHandoff(event.detail, true);
    const onHashChange = () => {
      if (window.location.hash === '#contact') applyPlannerHandoff();
    };

    window.addEventListener(PLANNER_HANDOFF_EVENT, onPlannerHandoff);
    window.addEventListener('hashchange', onHashChange);

    return () => {
      window.removeEventListener(PLANNER_HANDOFF_EVENT, onPlannerHandoff);
      window.removeEventListener('hashchange', onHashChange);
    };
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (status === 'sending' || status === 'sent') return;
    setStatus('sending');
    try {
      const res = await postNetlifyForm('contact', {
        ...form,
        source: plannerHandoff ? 'planner' : 'contact',
        plannerDraft: plannerHandoff?.transcript || '',
      });
      if (!res.ok) throw new Error('http');
      setStatus('sent');
      setForm({ name: '', email: '', subject: '', message: '' });
      clearPlannerHandoff();
      setPlannerHandoff(null);
    } catch {
      setStatus('error');
    }
  };

  return (
    <section className="contact reveal" id="contact">
      <header className="contact__head">
        <span className="section-eyebrow">Get in touch</span>
        <h2 className="section-title">Send us an email</h2>
        <p className="section-lead">Tell us whether you want a complete package, a few Zanzibar excursions, a mainland safari, or a custom mix. Send group size, rough dates, budget, and pace — we'll come back within a day with ideas, availability, and a real price.</p>
      </header>

      <div className="contact__grid">
        <aside className="contact__details">
          <div className="contact__detail">
            <span className="contact__detail-label">
              <svg className="contact__detail-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              Email
            </span>
            <a className="contact__detail-value" href={`mailto:${CONTACT_INFO.email}`}>{CONTACT_INFO.email}</a>
          </div>
          <div className="contact__detail">
            <span className="contact__detail-label">
              <svg className="contact__detail-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              Phone
            </span>
            <a className="contact__detail-value" href={`tel:${CONTACT_INFO.phones[0]}`}>+255 768 779 517</a>
            <a className="contact__detail-value" href={`tel:${CONTACT_INFO.phones[1]}`}>+255 748 352 657</a>
          </div>
          <div className="contact__detail">
            <span className="contact__detail-label">
              <svg className="contact__detail-icon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.272-.099-.47-.148-.669.15-.198.296-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.372-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413" />
              </svg>
              WhatsApp
            </span>
            <a className="contact__detail-value" href={CONTACT_INFO.whatsappUrl} target="_blank" rel="noreferrer">Message us on WhatsApp</a>
          </div>
          <div className="contact__detail">
            <span className="contact__detail-label">
              <svg className="contact__detail-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              Find us
            </span>
            <span className="contact__detail-value">{CONTACT_INFO.location}</span>
          </div>
          <div className="contact__detail">
            <span className="contact__detail-label">
              <svg className="contact__detail-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              Hours
            </span>
            <span className="contact__detail-value">{CONTACT_INFO.hours}</span>
          </div>
        </aside>

        <form
          className="contact__form"
          name="contact"
          method="POST"
          data-netlify="true"
          netlify-honeypot="bot-field"
          onSubmit={onSubmit}
        >
          <input type="hidden" name="form-name" value="contact" />
          <input type="hidden" name="source" value={plannerHandoff ? 'planner' : 'contact'} />
          <textarea name="plannerDraft" value={plannerHandoff?.transcript || ''} readOnly hidden />
          <p hidden><label>Don't fill this out: <input name="bot-field" onChange={() => {}} /></label></p>

          <div className="contact__row">
            <label className="contact__field">
              <span>Your name</span>
              <input type="text" name="name" required value={form.name} onChange={update('name')} />
            </label>
            <label className="contact__field">
              <span>Email</span>
              <input type="email" name="email" required value={form.email} onChange={update('email')} />
            </label>
          </div>
          <label className="contact__field">
            <span>Subject</span>
            <input type="text" name="subject" placeholder="Trip dates, group size, anything specific" value={form.subject} onChange={update('subject')} />
          </label>
          <label className="contact__field">
            <span>Message</span>
            <textarea ref={messageRef} name="message" rows={5} required value={form.message} onChange={update('message')} />
          </label>

          {status === 'sent' && (
            <p className="contact__status contact__status--ok">✓ Asante — we got it. We'll come back to you within a day.</p>
          )}
          {status === 'error' && (
            <p className="contact__status contact__status--err">Pole sana — that didn't go through. Email us directly at {CONTACT_INFO.email} or try again.</p>
          )}

          <button
            type="submit"
            className="btn contact__submit"
            disabled={status === 'sending' || status === 'sent'}
          >
            {status === 'sending' ? 'Sending…' : status === 'sent' ? 'Sent' : 'Send message'}
            <ArrowIcon size={16} />
          </button>
        </form>
      </div>
    </section>
  );
}
