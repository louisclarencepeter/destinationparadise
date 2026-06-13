import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { CONTACT_INFO } from '../constants/contactInfo.js';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { objectFromTranslation } from '../utils/translationValues.js';
import '../styles/homepage.css';
import '../styles/policy.css';

function PolicySection({ title, items }) {
  return (
    <section className="policy-section">
      <h2>{title}</h2>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

export default function Policy({ section = 'privacy' }) {
  const { t } = useTranslation('policy');
  const policies = objectFromTranslation(t('policies', { returnObjects: true }), {});
  const policy = policies?.[section] || policies?.privacy;
  const actions = objectFromTranslation(t('contact.actions', { returnObjects: true }), {});
  const meta = objectFromTranslation(t('meta', { returnObjects: true }), {});
  const contact = objectFromTranslation(t('contact', { returnObjects: true }), {});

  const pageTitle = useMemo(
    () => t('page_title', { title: policy.title }),
    [policy.title, t],
  );

  usePageMeta(pageTitle, policy.intro);

  return (
    <main className="policy-page">
      <section className="policy-hero">
        <div className="policy-hero__inner">
          <span className="section-eyebrow">{policy.eyebrow}</span>
          <h1>{policy.title}</h1>
          <p>{policy.intro}</p>
          <dl className="policy-meta" aria-label={meta.aria_label}>
            <div>
              <dt>{meta.last_updated}</dt>
              <dd>{meta.last_updated_value}</dd>
            </div>
            <div>
              <dt>{meta.contact}</dt>
              <dd><a href={`mailto:${CONTACT_INFO.email}`}>{CONTACT_INFO.email}</a></dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="policy-content" aria-label={policy.title}>
        {policy.sections.map((item) => (
          <PolicySection key={item.title} title={item.title} items={item.items} />
        ))}

        <section className="policy-section policy-section--contact">
          <h2>{contact.title}</h2>
          <p>
            {contact.copy_prefix}{' '}
            <a href={`mailto:${CONTACT_INFO.email}`}>{CONTACT_INFO.email}</a>
            {' '}{contact.copy_suffix}
          </p>
          <div className="policy-actions">
            <a className="btn" href={`mailto:${CONTACT_INFO.email}`}>{actions.email}</a>
            <Link className="btn btn--ghost" to="/trip-planner">{actions.plan}</Link>
          </div>
        </section>
      </section>
    </main>
  );
}
