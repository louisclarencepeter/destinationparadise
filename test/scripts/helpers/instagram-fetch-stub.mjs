// Replaces global fetch so the exit-code tests can spawn the real
// instagram-story script end-to-end without touching the network.
// Load with `node --import` and select behavior via INSTAGRAM_FETCH_STUB_MODE.
const mode = process.env.INSTAGRAM_FETCH_STUB_MODE;

const payloads = {
  // Verbatim from the scheduled runs that failed from 2026-09-15 onwards.
  'revoked-token': [400, {
    error: {
      message: 'Error validating access token: The session has been invalidated because the user changed their password or Facebook has changed the session for security reasons.',
      type: 'OAuthException',
      code: 190,
      error_subcode: 460,
    },
  }],
  'rate-limited': [400, { error: { message: 'Application request limit reached', code: 4 } }],
};

if (!(mode in payloads)) {
  throw new Error(`Unknown INSTAGRAM_FETCH_STUB_MODE: ${mode}`);
}

globalThis.fetch = async () => {
  const [status, payload] = payloads[mode];
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => payload,
  };
};
