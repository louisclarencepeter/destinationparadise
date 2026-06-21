import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../../styles/homepage/newsletter.css';

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

export default function NewsletterSection() {
  const { t } = useTranslation('home');
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (pending || done) return;
    setPending(true);
    setError(false);
    try {
      const res = await postNetlifyForm('newsletter', { email });
      if (!res.ok) throw new Error('newsletter-submit-failed');
      setDone(true);
      setEmail('');
    } catch {
      setError(true);
    } finally {
      setPending(false);
    }
  };

  return (
    <section className="newsletter" id="newsletter">
      <div>
        <span className="newsletter__eyebrow reveal" style={{ '--reveal-index': 0 }}>{t('newsletter.eyebrow')}</span>
        <h3 className="newsletter__title reveal" style={{ '--reveal-index': 1 }}>{t('newsletter.title')}</h3>
        <p className="newsletter__desc reveal" style={{ '--reveal-index': 2 }}>{t('newsletter.description')}</p>
      </div>
      <form
        className="newsletter__form"
        name="newsletter"
        method="POST"
        data-netlify="true"
        onSubmit={onSubmit}
      >
        <input type="hidden" name="form-name" value="newsletter" />
        <input
          id="newsletter-email"
          className="newsletter__input"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={done ? t('newsletter.email_placeholder_done') : t('newsletter.email_placeholder')}
          required={!done}
          disabled={done}
          aria-label={t('newsletter.email_aria')}
          autoComplete="email"
        />
        <button type="submit" className="newsletter__submit" disabled={pending || done}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path d="M4 4h16v16H4z" /><path d="M4 6l8 7 8-7" />
          </svg>
          <span>{done ? t('newsletter.submit_done') : pending ? t('newsletter.submit_pending') : t('newsletter.submit')}</span>
        </button>
      </form>
      {error && (
        <p className="newsletter__note newsletter__note--error" role="status">
          {t('newsletter.error')}
        </p>
      )}
    </section>
  );
}
