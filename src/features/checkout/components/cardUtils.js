// Lightweight client-side card helpers — used by the simulated card form.
// Real validation happens at the gateway. We only do enough to give
// instant feedback and a brand badge.

export const BRAND_LABELS = Object.freeze({
  visa: 'Visa',
  mastercard: 'Mastercard',
  amex: 'Amex',
  discover: 'Discover',
});

export function detectBrand(rawNumber) {
  const digits = String(rawNumber || '').replace(/\D+/g, '');
  if (!digits) return null;
  if (/^4/.test(digits)) return 'visa';
  if (/^(5[1-5]|2[2-7])/.test(digits)) return 'mastercard';
  if (/^3[47]/.test(digits)) return 'amex';
  if (/^6(?:011|5)/.test(digits)) return 'discover';
  return null;
}

// Standard Luhn checksum.
export function luhnCheck(rawNumber) {
  const digits = String(rawNumber || '').replace(/\D+/g, '');
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let n = Number(digits[i]);
    if (Number.isNaN(n)) return false;
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

// Accepts "MM/YY" (and tolerates raw "MMYY"). Returns true if expiry is the
// current month or later, false otherwise.
export function isExpiryValid(value) {
  const cleaned = String(value || '').replace(/\D+/g, '');
  if (cleaned.length !== 4) return false;
  const mm = Number(cleaned.slice(0, 2));
  const yy = Number(cleaned.slice(2, 4));
  if (!mm || mm < 1 || mm > 12) return false;
  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;
  if (yy < currentYear) return false;
  if (yy === currentYear && mm < currentMonth) return false;
  return true;
}

export function lastFourOf(rawNumber) {
  const digits = String(rawNumber || '').replace(/\D+/g, '');
  return digits.slice(-4);
}
