import endpoints from './endpoint-origins.json';

// Also consumed by Metro's fixed-route development proxy.
export const WEBSITE_ORIGIN = endpoints.websiteUrl;
export const MOBILE_BACKEND_URL = endpoints.mobileBackendUrl;
