// Replaces global fetch so the exit-code tests can spawn the real
// threads-auto-commenter script end-to-end without touching the network.
// Load with `node --import` and select behavior via THREADS_FETCH_STUB_MODE.
const mode = process.env.THREADS_FETCH_STUB_MODE;

const payloads = {
  'transient-401': [401, { error: { message: 'Invalid OAuth access token - Cannot parse access token', code: 190 } }],
  'transient-500': [500, { error: { message: 'Application does not have permission for this action', code: 10 } }],
  'bad-request': [400, { error: { message: 'Unsupported request.', code: 100 } }],
  'wrong-user': [200, { id: '1', username: 'someone-else' }],
};

if (!(mode in payloads) && mode !== 'network-error' && mode !== 'body-read-error') {
  throw new Error(`Unknown THREADS_FETCH_STUB_MODE: ${mode}`);
}

globalThis.fetch = async () => {
  if (mode === 'network-error') throw new TypeError('fetch failed');
  if (mode === 'body-read-error') {
    return {
      ok: true,
      status: 200,
      text: async () => {
        throw new TypeError('terminated');
      },
    };
  }
  const [status, payload] = payloads[mode];
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(payload),
  };
};
