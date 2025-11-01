export function extractErrorMessage(err: unknown, fallback = 'Unknown error'): string {
  if (!err) return fallback;
  if (typeof err === 'string') return err;
  if (typeof err === 'object' && err !== null) {
    const e = err as { message?: unknown };
    if (e.message && typeof e.message === 'string') return e.message;
    try {
      return String((e.message ?? err));
    } catch (e) {
      try { // eslint-disable-next-line no-console
        if (process.env.NODE_ENV !== 'production') console.debug('[utils] extractErrorMessage stringify failed', e);
      } catch { void 0; }
      return fallback;
    }
  }
  return String(err);
}
