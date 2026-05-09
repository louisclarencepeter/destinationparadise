import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { EXCURSIONS } from '../data/excursionsData.js';
import { destinationParadisePackages } from '../data/destinationParadisePackages.js';
import { destinationParadiseSafariPricing } from '../data/safariPricing.js';
import '../styles/homepage.css';
import '../styles/excursions.css';
import '../styles/booking.css';

const SERVICE_TYPES = [
  { value: 'package', label: 'Package', text: 'Safari + Zanzibar, honeymoon, family, culture, marine, or luxury route.' },
  { value: 'excursion', label: 'Excursion', text: 'Island day trips, dhow sailing, Stone Town, spice farms, snorkeling, and nature.' },
  { value: 'safari', label: 'Safari', text: 'Mainland wildlife routes, fly-in safaris, migration, southern parks, and custom circuits.' },
  { value: 'custom', label: 'Custom plan', text: 'Not sure yet? Tell us the shape and we will build a route around you.' },
];

const PAYMENT_OPTIONS = [
  { value: 'secure-link', label: 'Send secure online payment link', text: 'Best after we confirm availability and the final price.' },
  { value: 'deposit', label: 'I want to pay a deposit online', text: 'We will confirm the deposit amount and send a payment link.' },
  { value: 'full', label: 'I want to pay the full amount online', text: 'For confirmed trips where you want to settle everything by card/link.' },
  { value: 'later', label: 'Quote first, payment later', text: 'We will price the trip first and discuss payment after.' },
];

const DEFAULT_FORM = {
  serviceType: 'package',
  product: '',
  name: '',
  email: '',
  phone: '',
  whatsapp: '',
  startDate: '',
  endDate: '',
  guests: '2',
  budget: '',
  accommodationLevel: 'Mid-range',
  paymentPreference: 'secure-link',
  message: '',
};

const encodeForm = (data) =>
  Object.keys(data)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
    .join('&');

const money = (value) => `$${Number(value).toLocaleString()}`;

function priceLabel(item) {
  if (!item) return 'Final price after availability check';
  if (item.type === 'package') {
    const to = item.raw.pricing.to ? ` - ${money(item.raw.pricing.to)}` : '';
    return `From ${money(item.raw.pricing.from)}${to} ${item.raw.pricing.unit || 'per person'}`;
  }
  if (item.type === 'safari') {
    return `From ${money(item.raw.recommendedPublicPrice.lowSeason)} pp`;
  }
  if (item.type === 'excursion' && typeof item.raw.price === 'number') {
    return `From ${money(item.raw.price)} ${item.raw.priceSub || 'per person'}`;
  }
  return 'Final price after availability check';
}

function useBookingProducts() {
  return useMemo(() => {
    const packages = destinationParadisePackages.map((item) => ({
      type: 'package',
      value: `package:${item.slug}`,
      label: item.title,
      category: item.category,
      raw: item,
    }));

    const excursions = EXCURSIONS.map((item) => ({
      type: 'excursion',
      value: `excursion:${item.id}`,
      label: item.title,
      category: item.category,
      raw: item,
    }));

    const safaris = destinationParadiseSafariPricing.map((item) => ({
      type: 'safari',
      value: `safari:${item.slug}`,
      label: item.title,
      category: item.positioning,
      raw: item,
    }));

    return { packages, excursions, safaris, all: [...packages, ...excursions, ...safaris] };
  }, []);
}

export default function Booking() {
  const [searchParams] = useSearchParams();
  const products = useBookingProducts();
  const [form, setForm] = useState(DEFAULT_FORM);
  const [status, setStatus] = useState('idle');
  const layoutRef = useRef(null);
  const summarySlotRef = useRef(null);
  const summaryRef = useRef(null);
  const [summaryFloat, setSummaryFloat] = useState({ mode: 'normal', left: 0, width: 0 });

  useEffect(() => {
    document.title = 'Booking Request · Destination Paradise';
  }, []);

  useEffect(() => {
    const type = searchParams.get('type');
    const item = searchParams.get('item') || searchParams.get('product');
    if (!type && !item) return;

    const matched = products.all.find((product) => (
      (type ? product.type === type : true) &&
      (product.raw.slug === item || product.raw.id === item || product.value === item)
    ));

    if (matched) {
      setForm((current) => ({
        ...current,
        serviceType: matched.type,
        product: matched.value,
      }));
    } else if (type || item) {
      const title = searchParams.get('title');
      setForm((current) => ({
        ...current,
        serviceType: SERVICE_TYPES.some((service) => service.value === type) ? type : 'custom',
        message: title ? `I am interested in ${title}. ${current.message}`.trim() : current.message,
      }));
    }
  }, [products.all, searchParams]);

  const selectedProduct = products.all.find((item) => item.value === form.product);
  const visibleProducts = form.serviceType === 'custom'
    ? []
    : products.all.filter((item) => item.type === form.serviceType);
  const selectedService = SERVICE_TYPES.find((item) => item.value === form.serviceType);
  const isExcursionRequest = form.serviceType === 'excursion';
  const showDateRange = !isExcursionRequest;
  const showTravelPreferences = !isExcursionRequest;
  const dateSummary = showDateRange
    ? `${form.startDate || 'Flexible'}${form.endDate ? ` to ${form.endDate}` : ''}`
    : form.startDate || 'Flexible';
  const messagePlaceholder = isExcursionRequest
    ? 'Preferred pickup area, hotel name, private/shared preference, kids ages, dietary needs, or timing notes.'
    : "Hotels you like, pace, special occasion, kids' ages, dietary needs, flight details, or what you want to avoid.";

  useEffect(() => {
    let frame = 0;

    const updateSummaryFloat = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const layout = layoutRef.current;
        const slot = summarySlotRef.current;
        const summary = summaryRef.current;

        if (!layout || !slot || !summary || window.innerWidth < 820) {
          setSummaryFloat((current) => (current.mode !== 'normal' ? { mode: 'normal', left: 0, width: 0 } : current));
          return;
        }

        const rootStyles = window.getComputedStyle(document.documentElement);
        const navHeight = Number.parseFloat(rootStyles.getPropertyValue('--nav-height')) || 66;
        const topOffset = navHeight + 20;
        const layoutRect = layout.getBoundingClientRect();
        const slotRect = slot.getBoundingClientRect();
        const summaryHeight = summary.offsetHeight;
        const shouldFloat = layoutRect.top <= topOffset && layoutRect.bottom > topOffset + summaryHeight;
        const shouldParkAtBottom = layoutRect.top <= topOffset && layoutRect.bottom <= topOffset + summaryHeight;

        setSummaryFloat((current) => {
          const next = {
            mode: shouldFloat ? 'floating' : shouldParkAtBottom ? 'bottom' : 'normal',
            left: shouldFloat ? slotRect.left : 0,
            width: shouldFloat ? slotRect.width : 0,
          };

          if (
            current.mode === next.mode &&
            Math.abs(current.left - next.left) < 0.5 &&
            Math.abs(current.width - next.width) < 0.5
          ) {
            return current;
          }

          return next;
        });
      });
    };

    updateSummaryFloat();
    window.addEventListener('scroll', updateSummaryFloat, { passive: true });
    window.addEventListener('resize', updateSummaryFloat);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', updateSummaryFloat);
      window.removeEventListener('resize', updateSummaryFloat);
    };
  }, [form, selectedProduct]);

  const update = (key) => (event) => {
    const value = event.target.value;
    setStatus('idle');
    setForm((current) => ({
      ...current,
      [key]: value,
      ...(key === 'serviceType'
        ? {
          product: '',
          endDate: value === 'excursion' ? '' : current.endDate,
          budget: value === 'excursion' ? '' : current.budget,
        }
        : {}),
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
    if (status === 'sending' || status === 'sent') return;
    setStatus('sending');

    const payload = {
      ...form,
      endDate: showDateRange ? form.endDate : '',
      budget: showTravelPreferences ? form.budget : '',
      accommodationLevel: showTravelPreferences ? form.accommodationLevel : '',
      productLabel: selectedProduct?.label || 'Not selected',
      estimatedPrice: priceLabel(selectedProduct),
    };

    try {
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encodeForm({ 'form-name': 'booking-request', ...payload }),
      });
      if (!response.ok) throw new Error('booking-request-failed');
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  };

  return (
    <main className="booking-page">
      <section className="booking-hero">
        <div className="booking-hero__bg"><img src="/assets/images/home/mizingani-waterfront.jpg" alt="" /></div>
        <div className="booking-hero__inner">
          <span className="booking-hero__eyebrow">Booking request</span>
          <h1>One form <em>for every trip.</em></h1>
          <p>Packages, excursions, safaris, custom routes, and online payment requests all start here. Tell us the shape, and our team will confirm availability, timing, and the final price.</p>
          <div className="booking-hero__actions">
            <a className="btn btn--lg" href="#booking-form">Start request</a>
            <Link className="btn btn--ghost btn--lg" to="/trip-planner">Plan with AI</Link>
          </div>
          <div className="booking-hero__stats" aria-label="Booking trust signals">
            <div><strong>500+</strong><span>Trips planned</span></div>
            <div><strong>1,200+</strong><span>Happy guests</span></div>
            <div><strong>24h</strong><span>Request confirmed</span></div>
          </div>
        </div>
      </section>

      <section className="booking-flow" aria-label="Booking process">
        <article>
          <span>01</span>
          <h2>Send the request</h2>
          <p>Choose a package, excursion, safari, or custom route and share your dates.</p>
        </article>
        <article>
          <span>02</span>
          <h2>We confirm it</h2>
          <p>Our team checks availability, transfers, guides, routes, and final pricing.</p>
        </article>
        <article>
          <span>03</span>
          <h2>Pay securely</h2>
          <p>When everything is approved, we send a secure online payment link.</p>
        </article>
      </section>

      <section className="booking-shell" id="booking-form">
        <div className="booking-intro">
          <span className="section-eyebrow">Tell us what to build</span>
          <h2 className="section-title">Request availability, quote, and payment link.</h2>
          <p className="section-lead">We do not collect card details on this page. If you choose online payment, we will send a secure payment link after the route and price are confirmed.</p>
        </div>

        <div className="booking-layout" ref={layoutRef}>
          <form className="booking-form" name="booking-request" method="POST" data-netlify="true" netlify-honeypot="bot-field" onSubmit={submit}>
            <input type="hidden" name="form-name" value="booking-request" />
            <p hidden><label>Do not fill this out: <input name="bot-field" onChange={() => {}} /></label></p>

            <fieldset className="booking-fieldset">
              <legend>What are you booking?</legend>
              <div className="booking-choice-grid">
                {SERVICE_TYPES.map((item) => (
                  <label className={`booking-choice${form.serviceType === item.value ? ' is-selected' : ''}`} key={item.value}>
                    <input type="radio" name="serviceType" value={item.value} checked={form.serviceType === item.value} onChange={update('serviceType')} />
                    <span>{item.label}</span>
                    <small>{item.text}</small>
                  </label>
                ))}
              </div>
            </fieldset>

            {form.serviceType !== 'custom' && (
              <label className="booking-field">
                <span>Specific product</span>
                <select name="product" value={form.product} onChange={update('product')}>
                  <option value="">Choose from {form.serviceType}s or leave flexible</option>
                  {visibleProducts.map((item) => (
                    <option value={item.value} key={item.value}>{item.label}</option>
                  ))}
                </select>
              </label>
            )}

            <div className="booking-row">
              <label className="booking-field">
                <span>Name</span>
                <input type="text" name="name" value={form.name} onChange={update('name')} required />
              </label>
              <label className="booking-field">
                <span>Email</span>
                <input type="email" name="email" value={form.email} onChange={update('email')} required />
              </label>
            </div>

            <div className="booking-row">
              <label className="booking-field">
                <span>Phone</span>
                <input type="tel" name="phone" value={form.phone} onChange={update('phone')} placeholder="+255 / +49 / +1 ..." />
              </label>
              <label className="booking-field">
                <span>WhatsApp</span>
                <input type="tel" name="whatsapp" value={form.whatsapp} onChange={update('whatsapp')} placeholder="If different from phone" />
              </label>
            </div>

            <div className={`booking-row${showDateRange ? ' booking-row--thirds' : ''}`}>
              <label className="booking-field">
                <span>{showDateRange ? 'Start date' : 'Date'}</span>
                <input type="date" name="startDate" value={form.startDate} onChange={update('startDate')} />
              </label>
              {showDateRange && (
                <label className="booking-field">
                  <span>End date</span>
                  <input type="date" name="endDate" value={form.endDate} onChange={update('endDate')} />
                </label>
              )}
              <label className="booking-field">
                <span>Guests</span>
                <select name="guests" value={form.guests} onChange={update('guests')}>
                  <option>1</option>
                  <option>2</option>
                  <option>3</option>
                  <option>4</option>
                  <option>5</option>
                  <option>6+</option>
                  <option>10+</option>
                </select>
              </label>
            </div>

            {showTravelPreferences && (
              <div className="booking-row">
                <label className="booking-field">
                  <span>Budget range</span>
                  <select name="budget" value={form.budget} onChange={update('budget')}>
                    <option value="">Not sure yet</option>
                    <option>Under $1,000 pp</option>
                    <option>$1,000 - $2,500 pp</option>
                    <option>$2,500 - $5,000 pp</option>
                    <option>$5,000 - $8,000 pp</option>
                    <option>$8,000+ pp</option>
                  </select>
                </label>
                <label className="booking-field">
                  <span>Comfort level</span>
                  <select name="accommodationLevel" value={form.accommodationLevel} onChange={update('accommodationLevel')}>
                    <option>Budget</option>
                    <option>Mid-range</option>
                    <option>Luxury</option>
                    <option>Ultra luxury</option>
                    <option>Flexible</option>
                  </select>
                </label>
              </div>
            )}

            <fieldset className="booking-fieldset">
              <legend>Online payment</legend>
              <div className="booking-payment-grid">
                {PAYMENT_OPTIONS.map((item) => (
                  <label className={`booking-payment${form.paymentPreference === item.value ? ' is-selected' : ''}`} key={item.value}>
                    <input type="radio" name="paymentPreference" value={item.value} checked={form.paymentPreference === item.value} onChange={update('paymentPreference')} />
                    <span>{item.label}</span>
                    <small>{item.text}</small>
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="booking-field">
              <span>Anything we should know?</span>
              <textarea name="message" value={form.message} onChange={update('message')} rows={6} placeholder={messagePlaceholder} />
            </label>

            {status === 'sent' && (
              <p className="booking-status booking-status--ok">Asante. We received your request and will come back with availability, a quote, and the payment next step.</p>
            )}
            {status === 'error' && (
              <p className="booking-status booking-status--err">That did not go through. Please try again or message us on WhatsApp.</p>
            )}

            <button className="btn btn--lg booking-submit" type="submit" disabled={status === 'sending' || status === 'sent'}>
              {status === 'sending' ? 'Sending request...' : status === 'sent' ? 'Request sent' : 'Send booking request'}
            </button>
          </form>

          <aside className="booking-summary-slot" ref={summarySlotRef}>
            <div
              className={`booking-summary${summaryFloat.mode === 'floating' ? ' booking-summary--floating' : ''}${summaryFloat.mode === 'bottom' ? ' booking-summary--bottom' : ''}`}
              ref={summaryRef}
              style={summaryFloat.mode === 'floating' ? { left: summaryFloat.left, width: summaryFloat.width } : undefined}
            >
              <div className="booking-summary__card">
                <span className="section-eyebrow">Your request</span>
                <h3>{selectedProduct?.label || selectedService?.label || 'Custom plan'}</h3>
                <p>{selectedProduct?.category || 'Flexible route'}</p>
                <div className="booking-summary__price">{priceLabel(selectedProduct)}</div>
                <dl>
                  <div><dt>Guests</dt><dd>{form.guests || 'Flexible'}</dd></div>
                  <div><dt>{showDateRange ? 'Dates' : 'Date'}</dt><dd>{dateSummary}</dd></div>
                  {showTravelPreferences && <div><dt>Comfort</dt><dd>{form.accommodationLevel}</dd></div>}
                  <div><dt>Payment</dt><dd>{PAYMENT_OPTIONS.find((item) => item.value === form.paymentPreference)?.label}</dd></div>
                </dl>
              </div>

              <div className="booking-summary__card booking-summary__card--dark">
                <span>How payment works</span>
                <ol>
                  <li>We confirm availability and the final price.</li>
                  <li>You approve the route, date, and terms.</li>
                  <li>We send a secure online payment link for deposit or full balance.</li>
                </ol>
                <p>No card details are entered or stored on this website.</p>
              </div>

              <div className="booking-summary__mini">
                <strong>Prefer to plan first?</strong>
                <Link to="/trip-planner">Open the AI planner →</Link>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="exc-cta">
        <div className="exc-cta__bg"><img src="/assets/images/excursions/stone-town-old-fort.jpg" alt="" /></div>
        <div className="exc-cta__inner">
          <h2>Need help before you send it?</h2>
          <p>Open the planner if you want to shape the route first, or explore the full map to choose the right beach, safari circuit, and island days.</p>
          <div className="exc-cta__btns">
            <Link className="btn btn--lg btn--accent" to="/trip-planner">Plan with AI</Link>
            <Link className="btn btn--ghost-light btn--lg" to="/explore">Explore the map</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
