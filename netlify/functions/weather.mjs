import { handleWeatherRequest } from './_weather_proxy.mjs';

export default async (request) => handleWeatherRequest(request, 'forecast');

export const config = { path: '/api/weather' };
