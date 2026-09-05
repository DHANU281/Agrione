const demoMarketData = [
    { crop: 'Paddy', price: 31, unit: 'kg', market: 'Kurnool Market', location: 'Kurnool', distance: 118, trend: '+7.4%', lastUpdated: 'Today, 09:30' },
    { crop: 'Tomato', price: 42, unit: 'kg', market: 'Bengaluru Market', location: 'Bengaluru', distance: 145, trend: '+3.1%', lastUpdated: 'Today, 09:30' },
    { crop: 'Chilli', price: 96, unit: 'kg', market: 'Guntur Market', location: 'Guntur', distance: 18, trend: '+4.8%', lastUpdated: 'Today, 09:30' },
    { crop: 'Maize', price: 25, unit: 'kg', market: 'Nagpur Market', location: 'Nagpur', distance: 520, trend: '-1.2%', lastUpdated: 'Today, 09:30' },
    { crop: 'Groundnut', price: 46, unit: 'kg', market: 'Anantapur Market', location: 'Anantapur', distance: 210, trend: '+6.5%', lastUpdated: 'Today, 09:30' }
];
const demoMarkets = [
    { market: 'Guntur Market', crop: 'Chilli', price: 96, distance: 18, trend: '+4.8%', lastUpdated: 'Today, 09:30' },
    { market: 'Tenali Market', crop: 'Chilli', price: 93, distance: 35, trend: '+2.2%', lastUpdated: 'Today, 09:30' },
    { market: 'Vijayawada Market', crop: 'Chilli', price: 91, distance: 42, trend: '+1.7%', lastUpdated: 'Today, 09:30' },
    { market: 'Kurnool Market', crop: 'Paddy', price: 31, distance: 118, trend: '+7.4%', lastUpdated: 'Today, 09:30' }
];
const trendValues = { '7 Days': [34, 40, 37, 46, 43, 51, 56], '30 Days': [28, 33, 31, 42, 39, 49, 56], '3 Months': [22, 30, 27, 39, 36, 48, 56] };
const MARKET_API_KEY = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_MARKET_API_KEY : '';
const MARKET_API_URL = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_MARKET_API_URL : '';
const clone = (value) => JSON.parse(JSON.stringify(value));
async function liveOrDemo(path, fallback) {
    if (!MARKET_API_KEY || !MARKET_API_URL) return fallback;
    try {
        const response = await fetch(new URL(path, MARKET_API_URL), { headers: { Authorization: 'Bearer ' + MARKET_API_KEY } });
        if (!response.ok) throw new Error('MARKET_API_' + response.status);
        return { mode: 'live', ...(await response.json()) };
    } catch (error) {
        return { ...fallback, fallbackReason: error.message || 'NETWORK_FAILURE' };
    }
}
export async function getMarketPrices() { return liveOrDemo('prices', { mode: 'demo', data: clone(demoMarketData), disclaimer: 'Market prices and insights shown here are prototype data and are not live verified prices.' }); }
export async function getMarketTrend(range = '7 Days') { return liveOrDemo('trend?range=' + encodeURIComponent(range), { mode: 'demo', range, values: trendValues[range] || trendValues['7 Days'], disclaimer: 'Prototype Price Trend' }); }
export async function getMarketComparison() { return liveOrDemo('comparison', { mode: 'demo', data: clone(demoMarkets), disclaimer: 'Prices shown are sample prototype data. Connect a verified live market-data source for real prices.' }); }
