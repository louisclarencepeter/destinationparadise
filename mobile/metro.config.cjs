const { getDefaultConfig } = require('expo/metro-config');
const https = require('node:https');
const { websiteUrl, mobileBackendUrl } = require('./src/config/endpoint-origins.json');

const config = getDefaultConfig(__dirname);
// Browser preview routes to the same two fixed backends used by the native app.
const apiRoutes = new Map([
  ['/api/planner', { method: 'POST', origin: websiteUrl }],
  ['/api/planner-send', { method: 'POST', origin: websiteUrl }],
  ['/api/planner-report', { method: 'POST', origin: mobileBackendUrl }],
  ['/api/weather', { method: 'GET', origin: mobileBackendUrl }],
  ['/api/marine', { method: 'GET', origin: mobileBackendUrl }],
]);
const enhance = config.server.enhanceMiddleware;
config.server.enhanceMiddleware = (middleware, server) => {
  const next = enhance ? enhance(middleware, server) : middleware;
  return (request, response, nextHandler) => {
    const route = apiRoutes.get(request.url);
    if (!route) return next(request, response, nextHandler);
    const { method, origin } = route;
    if (request.method !== method) { response.writeHead(405, { Allow: method }); response.end('Method not allowed'); return; }
    // Fixed origins and exact paths: this cannot be used as an open proxy.
    const upstream = https.request(`${origin}${request.url}`, {
      method, headers: { 'Content-Type': 'application/json', ...(method === 'POST' && request.headers['content-length'] ? { 'Content-Length': request.headers['content-length'] } : {}) },
    }, (result) => {
      response.writeHead(result.statusCode || 502, { 'Content-Type': result.headers['content-type'] || 'application/json', 'Cache-Control': 'no-store' });
      result.pipe(response);
    });
    upstream.setTimeout(50_000, () => upstream.destroy(new Error('Upstream timed out')));
    upstream.on('error', () => {
      if (!response.headersSent) response.writeHead(502, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ error: 'The service could not be reached. Please try again.' }));
    });
    request.on('aborted', () => upstream.destroy());
    request.pipe(upstream);
  };
};
module.exports = config;
