// Select a provider for new attempts; existing attempts always keep the provider
// stored in Postgres even after deployment settings change.
import * as dpo from './_dpo.mjs';
import * as pesapal from './_pesapal.mjs';

export const configuredPaymentProvider = () => (process.env.STORE_PAYMENT_PROVIDER || 'dpo').trim();

export function paymentAdapter(provider, environment) {
  if (provider === 'dpo') return {
    provider, environment: environment || 'live', enabled: dpo.dpoEnabled(),
    createCheckout: dpo.createCheckout,
    verifyPayment: dpo.verifyPayment,
    acknowledgePayment: dpo.acknowledgePayment,
  };
  if (provider === 'pesapal') {
    const selectedEnvironment = environment || pesapal.pesapalEnvironment();
    return {
      provider, environment: selectedEnvironment,
      enabled: pesapal.pesapalEnabled({ environment: selectedEnvironment }),
      verifyEnabled: pesapal.pesapalEnabled({ checkout: false, environment: selectedEnvironment }),
      createCheckout: (order, options) => pesapal.createCheckout(order, { ...options, environment: selectedEnvironment }),
      verifyPayment: (order, options) => pesapal.verifyPayment(order, { ...options, environment: selectedEnvironment }),
      acknowledgePayment: null,
    };
  }
  return null;
}

export function configuredPaymentMode() {
  const provider = configuredPaymentProvider();
  return paymentAdapter(provider)?.enabled ? provider : null;
}
