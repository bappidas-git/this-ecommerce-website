const FALLBACK_MESSAGE = 'Something went wrong. Please try again.';

function getApiErrorMessage(error) {
  if (!error) return null;
  const fromResponse =
    error.response && error.response.data && typeof error.response.data.message === 'string'
      ? error.response.data.message
      : null;
  const candidate =
    (typeof error.message === 'string' && error.message) || fromResponse || null;
  if (typeof candidate === 'string' && candidate.trim()) return candidate;
  return FALLBACK_MESSAGE;
}

export default function useApiError(error) {
  return getApiErrorMessage(error);
}

export { FALLBACK_MESSAGE, getApiErrorMessage };
