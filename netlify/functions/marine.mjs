import { handleWeatherRequest } from './_weather_proxy.mjs';

export default async (request) => handleWeatherRequest(request, 'marine');

export const config = { path: '/api/marine' };
