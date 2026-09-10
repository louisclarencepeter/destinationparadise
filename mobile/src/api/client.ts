export class ApiError extends Error {
  constructor(message: string, public readonly status = 0, public readonly code = 'REQUEST_FAILED') {
    super(message);
    this.name = 'ApiError';
  }
}

export interface RequestOptions {
  signal?: AbortSignal;
  /** Tests can inject a fetch implementation without importing a native runtime. */
  fetchImpl?: typeof globalThis.fetch;
  timeoutMs?: number;
}

export function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}

export function abortError(): Error {
  const error = new Error('Request cancelled.');
  error.name = 'AbortError';
  return error;
}

export async function requestJson<T>(url: string, init: RequestInit = {}, options: RequestOptions = {}): Promise<T> {
  if (options.signal?.aborted) throw abortError();
  const controller = new AbortController();
  let timedOut = false;
  const abort = () => controller.abort();
  options.signal?.addEventListener('abort', abort, { once: true });
  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, options.timeoutMs ?? 30_000);
  try {
    const response = await (options.fetchImpl ?? globalThis.fetch)(url, { ...init, signal: controller.signal });
    const data = await response.json().catch(() => null);
    if (options.signal?.aborted) throw abortError();
    if (timedOut) throw new ApiError('The connection took too long. Please try again.', 0, 'TIMEOUT');
    if (!response.ok) {
      const message = data && (typeof data.error === 'string' ? data.error : typeof data.reply === 'string' ? data.reply : null);
      throw new ApiError(message || `The service could not complete this request (${response.status}). Please try again.`, response.status);
    }
    if (data === null) throw new ApiError('The service returned an unreadable response. Please try again.', response.status, 'INVALID_RESPONSE');
    return data as T;
  } catch (error) {
    if (options.signal?.aborted) throw abortError();
    if (timedOut) throw new ApiError('The connection took too long. Please try again.', 0, 'TIMEOUT');
    if (isAbortError(error) || error instanceof ApiError) throw error;
    throw new ApiError('Could not connect. Check your internet connection and try again.', 0, 'NETWORK_ERROR');
  } finally {
    clearTimeout(timeout);
    options.signal?.removeEventListener('abort', abort);
  }
}

export function utf8Bytes(text: string): number {
  let bytes = 0;
  for (const character of text) {
    const code = character.codePointAt(0)!;
    bytes += code <= 0x7f ? 1 : code <= 0x7ff ? 2 : code <= 0xffff ? 3 : 4;
  }
  return bytes;
}
