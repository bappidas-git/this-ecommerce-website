// Payment service — single swap point for a real gateway.
//
// Today this calls the mock json-server endpoint `/payments/simulate` and
// returns `{ ok, transactionId }`. When swapping to Stripe / HyperPay / Telr,
// replace ONLY this file (and add a tokenization step before processPayment if
// the provider requires it). The CheckoutContext + order placement flow stays
// the same.

import http from '../http.js';
import { unwrap } from '../queryString.js';

const ENDPOINT = '/payments/simulate';

function maskCardNumber(raw = '') {
  const digits = String(raw).replace(/\D+/g, '');
  if (!digits) return '';
  return digits.slice(-4).padStart(digits.length, '•');
}

function makeSimulatedFallback(payload) {
  const id = `sim_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
  return {
    ok: true,
    transactionId: id,
    method: payload?.method || 'card',
    status: payload?.method === 'bankTransfer' ? 'pending' : 'authorised',
  };
}

export const paymentService = {
  /**
   * Process a payment payload.
   *
   * Card example payload:
   *   { method: 'card', cardNumber, cardName, expiry, cvv, last4, brand, amount, currency }
   * COD:   { method: 'cod', amount, currency }
   * Bank:  { method: 'bankTransfer', amount, currency }
   */
  processPayment: async (payload = {}) => {
    try {
      const result = await http.post(ENDPOINT, payload).then(unwrap);
      if (result && typeof result === 'object') return result;
      return makeSimulatedFallback(payload);
    } catch (err) {
      // The mock endpoint may not be wired up yet — fall back to a simulated
      // success so the checkout flow stays usable in dev.
      if (err?.status === 404) return makeSimulatedFallback(payload);
      throw err;
    }
  },

  maskCardNumber,
};

export default paymentService;
