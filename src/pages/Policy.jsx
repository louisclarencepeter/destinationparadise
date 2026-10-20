import { useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { CONTACT_INFO } from '../constants/contactInfo.js';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { useRevealOnScroll } from '../hooks/useRevealOnScroll.js';
import { objectFromTranslation } from '../utils/translationValues.js';
import '../styles/homepage.css';
import '../styles/policy.css';

function PolicySection({ id, title, items = [], tables = [], link }) {
  // Reveal order runs heading → bullets → tables → link, so --reveal-index keeps
  // counting past the list rather than restarting per block.
  let revealIndex = 0;
  return (
    <section className="policy-section" id={id}>
      <h2 className="reveal" style={{ '--reveal-index': revealIndex++ }}>{title}</h2>
      {items.length > 0 && (
        <ul>
          {items.map((item) => (
            <li className="reveal" style={{ '--reveal-index': revealIndex++ }} key={item}>{item}</li>
          ))}
        </ul>
      )}
      {tables.map((table) => (
        <figure className={`policy-table reveal${table.wrap ? ' policy-table--wrap' : ''}`} style={{ '--reveal-index': revealIndex++ }} key={table.caption}>
          <figcaption>{table.caption}</figcaption>
          <div
            className="policy-table__scroll"
            {...(table.wrap ? { tabIndex: 0, role: 'region', 'aria-label': table.caption } : {})}
          >
            <table>
              <thead>
                <tr>{table.columns.map((column) => <th key={column} scope="col">{column}</th>)}</tr>
              </thead>
              <tbody>
                {table.rows.map((row) => (
                  <tr key={row[0]}>
                    {row.map((cell, i) => {
                      const content = typeof cell === 'object' && cell !== null
                        ? <a href={cell.href}>{cell.label}</a>
                        : cell;
                      return i === 0
                        ? <th key={i} scope="row">{content}</th>
                        : <td key={i}>{content}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </figure>
      ))}
      {link && (
        <div className="policy-actions reveal" style={{ '--reveal-index': revealIndex++ }}>
          <Link className="btn btn--ghost" to={link.to}>{link.label}</Link>
        </div>
      )}
    </section>
  );
}

export default function Policy({ section = 'privacy' }) {
  const { t, i18n, ready } = useTranslation('policy');
  const pageRef = useRef(null);
  useRevealOnScroll(
    pageRef,
    '.reveal:not(.is-visible)',
    ready ? `${i18n.resolvedLanguage}-${section}` : 'loading',
  );
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
    <main className="policy-page" ref={pageRef}>
      <section className="policy-hero">
        <div className="policy-hero__inner">
          <span className="section-eyebrow reveal">{policy.eyebrow}</span>
          <h1 className="reveal" style={{ '--reveal-index': 1 }}>{policy.title}</h1>
          <p className="reveal" style={{ '--reveal-index': 2 }}>{policy.intro}</p>
          <dl className="policy-meta reveal" style={{ '--reveal-index': 3 }} aria-label={meta.aria_label}>
            <div>
              <dt>{meta.last_updated}</dt>
              <dd>{policy.last_updated_value || meta.last_updated_value}</dd>
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
          <PolicySection
            key={item.title}
            id={item.id}
            title={item.title}
            items={item.items}
            tables={item.tables}
            link={item.link}
          />
        ))}

        <section className="policy-section policy-section--contact">
          <h2 className="reveal" style={{ '--reveal-index': 0 }}>{contact.title}</h2>
          <p className="reveal" style={{ '--reveal-index': 1 }}>
            {contact.copy_prefix}{' '}
            <a href={`mailto:${CONTACT_INFO.email}`}>{CONTACT_INFO.email}</a>
            {' '}{contact.copy_suffix}
          </p>
          <div className="policy-actions reveal" style={{ '--reveal-index': 2 }}>
            <a className="btn" href={`mailto:${CONTACT_INFO.email}`}>{actions.email}</a>
            <Link className="btn btn--ghost" to="/trip-planner">{actions.plan}</Link>
          </div>
        </section>
      </section>
    </main>
  );
}
