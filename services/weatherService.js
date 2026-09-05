const DEMO_DISCLAIMER = 'Demo Mode — Weather information shown here is sample data. Connect a weather API for live information.';
const WEATHER_API_KEY = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_WEATHER_API_KEY : '';
const WEATHER_API_URL = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_WEATHER_API_URL : '';

const demoForecast = [
    { date: 'Today', condition: 'Partly cloudy', icon: '🌤️', min: 21, max: 28, rain: 32, humidity: 78, wind: 12 },
    { date: 'Tomorrow', condition: 'Light rain', icon: '🌧️', min: 20, max: 26, rain: 60, humidity: 84, wind: 15 },
    { date: 'Wed', condition: 'Sunny', icon: '☀️', min: 21, max: 29, rain: 18, humidity: 69, wind: 10 },
    { date: 'Thu', condition: 'Sunny', icon: '☀️', min: 22, max: 30, rain: 12, humidity: 65, wind: 11 },
    { date: 'Fri', condition: 'Showers', icon: '🌦️', min: 21, max: 27, rain: 45, humidity: 80, wind: 17 }
];

function demoWeather(location) {
    return {
        mode: 'demo',
        disclaimer: DEMO_DISCLAIMER,
        location,
        current: { temperature: 28, condition: 'Partly cloudy', icon: '🌤️', feelsLike: 30, humidity: 78, wind: 12, rain: 32, sunrise: '06:02', sunset: '18:28' },
        forecast: demoForecast,
        history: { averageTemperature: '27°C', rainfallTrend: 'Moderate', humidityTrend: 'Stable', rainyDays: 4, values: [42, 58, 48, 68, 54, 72, 61] }
    };
}

function normalizeLiveWeather(data, location) {
    if (!data || !data.current || !Array.isArray(data.forecast)) throw new Error('MISSING_WEATHER_DATA');
    return { ...data, mode: 'live', location, disclaimer: '' };
}

export async function getWeather(location) {
    const safeLocation = { village: location?.village || 'Demo Farm', district: location?.district || 'Guntur', state: location?.state || 'Andhra Pradesh', latitude: location?.latitude, longitude: location?.longitude };
    if (!WEATHER_API_KEY || !WEATHER_API_URL) return demoWeather(safeLocation);

    try {
        const url = new URL(WEATHER_API_URL, window.location.origin);
        url.searchParams.set('location', [safeLocation.village, safeLocation.district, safeLocation.state].filter(Boolean).join(', '));
        if (safeLocation.latitude) url.searchParams.set('latitude', safeLocation.latitude);
        if (safeLocation.longitude) url.searchParams.set('longitude', safeLocation.longitude);
        const response = await fetch(url, { headers: { Authorization: 'Bearer ' + WEATHER_API_KEY } });
        if (!response.ok) throw new Error('WEATHER_API_' + response.status);
        return normalizeLiveWeather(await response.json(), safeLocation);
    } catch (error) {
        return { ...demoWeather(safeLocation), fallbackReason: error.message || 'NETWORK_FAILURE' };
    }
}

export const weatherDisclaimer = DEMO_DISCLAIMER;
