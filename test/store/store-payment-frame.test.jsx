import { Children, isValidElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import StorePaymentFrame from '../../src/components/store/StorePaymentFrame.jsx';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

const hookMode = vi.hoisted(() => ({ inspectHandlers: false }));
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useId: (...args) => hookMode.inspectHandlers ? 'payment-frame-test' : actual.useId(...args),
    useState: (initial) => hookMode.inspectHandlers
      ? [typeof initial === 'function' ? initial() : initial, vi.fn()]
      : actual.useState(initial),
  };
});

const paymentUrls = [
  'https://cybqa.pesapal.com/pesapaliframe/PesapalIframe3/Index/?OrderTrackingId=sandbox-order',
  'https://pay.pesapal.com/iframe/PesapalIframe3/Index/?OrderTrackingId=live-order',
];

function renderFrame(paymentUrl, props = {}) {
  return renderToStaticMarkup(<StorePaymentFrame paymentUrl={paymentUrl} onCheckStatus={vi.fn()} {...props} />);
}

function findElement(element, predicate) {
  if (!isValidElement(element)) return undefined;
  if (predicate(element)) return element;
  for (const child of Children.toArray(element.props.children)) {
    const found = findElement(child, predicate);
    if (found) return found;
  }
  return undefined;
}

afterEach(() => {
  hookMode.inspectHandlers = false;
  vi.unstubAllGlobals();
});

describe('embedded Pesapal payment frame', () => {
  it.each(paymentUrls)('renders an accessible, referrer-free frame for %s', (paymentUrl) => {
    const markup = renderFrame(paymentUrl);
    const iframe = markup.match(/<iframe\b[^>]*>/)?.[0];
    expect(iframe).toBeDefined();
    expect(iframe).toContain(`src="${paymentUrl}"`);
    expect(iframe).toContain('title="payment.iframe_title"');
    expect(iframe).toMatch(/\breferrerpolicy="no-referrer"/i);
    const descriptionId = iframe.match(/aria-describedby="([^"]+)"/)?.[1];
    expect(descriptionId).toBeTruthy();
    expect(markup).toContain(`id="${descriptionId}"`);
  });

  it.each([
    'https://secure.3gdirectpay.com/payv2.php?ID=historical-dpo',
    'https://pay.pesapal.com.evil.example/checkout',
    'https://evil.example/checkout',
    'http://cybqa.pesapal.com/checkout',
    'https://user:password@pay.pesapal.com/checkout',
    'https://pay.pesapal.com:444/checkout',
    'javascript:alert(1)',
  ])('does not expose a frame or payment link for rejected URL %s', (paymentUrl) => {
    const markup = renderFrame(paymentUrl);
    expect(markup).not.toMatch(/<(?:iframe|a)\b/);
    expect(markup).toContain('role="alert"');
    expect(markup).toContain('payment.unavailable');
  });

  it('offers an explicit same-tab fallback without redirecting or querying payment during render', () => {
    const assign = vi.fn();
    const replace = vi.fn();
    const fetch = vi.fn();
    const onCheckStatus = vi.fn();
    vi.stubGlobal('window', { location: { assign, replace } });
    vi.stubGlobal('fetch', fetch);
    const markup = renderFrame(paymentUrls[0], { onCheckStatus });
    const fallback = markup.match(/<a\b[^>]*>/)?.[0];
    expect(fallback).toContain(`href="${paymentUrls[0]}"`);
    expect(fallback).toContain('rel="noreferrer"');
    expect(fallback).toMatch(/\breferrerpolicy="no-referrer"/i);
    const target = fallback.match(/\btarget="([^"]+)"/)?.[1];
    expect([undefined, '_self']).toContain(target);
    expect(assign).not.toHaveBeenCalled();
    expect(replace).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
    expect(onCheckStatus).not.toHaveBeenCalled();
  });

  it('can hide the external fallback while retaining embedded checkout and status controls', () => {
    const markup = renderFrame(paymentUrls[0], { showExternalLink: false });
    expect(markup).toMatch(/<iframe\b/);
    expect(markup).not.toMatch(/<a\b/);
    expect(markup).toContain('payment.check_status');
  });

  it.each([false, true])('only disables the status button while checking=%s', (checking) => {
    const markup = renderFrame(paymentUrls[0], { checking });
    const label = checking ? 'payment.checking' : 'payment.check_status';
    const button = [...markup.matchAll(/<button\b[^>]*>[\s\S]*?<\/button>/g)]
      .map(([html]) => html).find((html) => html.includes(label));
    expect(button).toBeDefined();
    expect(button).toContain(`aria-busy="${checking}"`);
    expect(/\bdisabled(?:="")?/.test(button)).toBe(checking);
  });

  it('does not check or confirm payment on iframe load or reload; checking needs the explicit button', () => {
    // Static HTML cannot exercise event props. Stub hooks only for this event
    // test, inspect the returned React tree, and leave all rendering tests on
    // the real React server renderer without installing a DOM environment.
    hookMode.inspectHandlers = true;
    const onCheckStatus = vi.fn();
    const tree = StorePaymentFrame({ paymentUrl: paymentUrls[0], onCheckStatus });
    const iframe = findElement(tree, (element) => element.type === 'iframe');
    const reload = findElement(tree, (element) => element.type === 'button' && element.props.children === 'payment.reload');
    const check = findElement(tree, (element) => element.type === 'button' && element.props.children === 'payment.check_status');
    expect(iframe).toBeDefined();
    expect(reload).toBeDefined();
    expect(check).toBeDefined();
    iframe.props.onLoad();
    reload.props.onClick();
    expect(onCheckStatus).not.toHaveBeenCalled();
    check.props.onClick();
    expect(onCheckStatus).toHaveBeenCalledOnce();
  });
});
