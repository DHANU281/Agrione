import { getAssistantResponseText } from '../i18n/index.js';

const DEMO_MESSAGE = 'This assistant currently uses prototype responses. Connect a production AI backend for live AI responses.';
const SAFETY = 'AI Assistant provides preliminary information for educational and planning purposes. It is not a substitute for advice from a qualified agricultural expert.';
const DISEASE_SAFETY = 'Confirm diagnosis and treatment with a qualified agricultural expert and follow the product label.';
const AI_API_KEY = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_AI_API_KEY : '';
const AI_API_URL = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_AI_API_URL : '';
const responses = [
    { terms: ['spot', 'disease', 'leaf', 'crop health'], text: 'Leaf spots can have several possible causes. Upload a clear leaf image in AgriOne\'s Disease Detection module for a prototype AI-assisted assessment. Do not treat this as a diagnosis.' + '\n\n' + DISEASE_SAFETY, action: ['📷 Upload Crop Image', '#disease'], category: 'Crop Health', disease: true },
    { terms: ['rain', 'weather', 'activity'], text: 'Weather information is currently in Demo Mode. Check Farm Weather before planning irrigation, spraying or field work. Local field conditions should guide your final decision.', action: ['Open Farm Weather', '#farm-weather'], category: 'Weather' },
    { terms: ['price', 'market', 'sell', 'highest'], text: 'Market information is currently prototype/demo data. Open Market Intelligence to compare sample prices and estimate earnings. Sample prices are not live verified prices.', action: ['Open Market Intelligence', '#market-intelligence'], category: 'Market' },
    { terms: ['equipment', 'tractor', 'rent'], text: 'You can browse prototype equipment providers and submit a rental request in Farm Services. Provider listings, availability and rates are demo data.', action: ['Open Equipment Rental', '#farm-services'], category: 'Equipment' },
    { terms: ['soil', 'test', 'npk'], text: 'Open Farm Services to choose a prototype soil testing service and submit a request. No automatic fertilizer prescription is generated.', action: ['Open Soil Testing', '#farm-services'], category: 'Soil' },
    { terms: ['storage', 'warehouse', 'cold'], text: 'Open Farm Services to compare prototype storage listings and submit a storage request. Capacities and prices are demo data.', action: ['Open Crop Storage', '#farm-services'], category: 'Storage' },
    { terms: ['buyer', 'marketplace', 'selling'], text: 'Open the Marketplace to view prototype buyer listings and create a crop listing. Buyer information is not verified in this student prototype.', action: ['Open Marketplace', '#farmer-marketplace'], category: 'Selling Crops' }
];
const telugu = { spot: 'మీ పంట ఆకులపై మచ్చలు కనిపిస్తే, ముందుగా స్పష్టమైన ఆకు ఫోటోను Disease Detection లో upload చేయండి. ఇది ప్రాథమిక prototype సూచన మాత్రమే. నిపుణుడిని సంప్రదించండి.', weather: 'వాతావరణ సమాచారం ప్రస్తుతం Demo Mode లో ఉంది. Farm Weather చూడండి. తుది నిర్ణయానికి మీ పొల పరిస్థితులను కూడా పరిశీలించండి.', market: 'మార్కెట్ సమాచారం ప్రస్తుతం prototype/demo data. Market Intelligence లో నమూనా ధరలను పోల్చండి. ఇవి నిజమైన live ధరలు కావు.' };
function demoResponse(message, language) {
    const lower = message.toLowerCase();
    if (language === 'te') {
        const key = lower.includes('spot') || lower.includes('మచ్చ') ? 'spot' : lower.includes('rain') || lower.includes('వర్ష') ? 'weather' : lower.includes('price') || lower.includes('market') || lower.includes('ధర') ? 'market' : null;
        if (key) return { text: telugu[key] + '\n\n' + SAFETY, category: key === 'spot' ? 'Crop Health' : key === 'weather' ? 'Weather' : 'Market', action: key === 'spot' ? ['📷 Upload Crop Image', '#disease'] : key === 'weather' ? ['Open Farm Weather', '#farm-weather'] : ['Open Market Intelligence', '#market-intelligence'], mode: 'demo' };
    }
    const match = responses.find((item) => item.terms.some((term) => lower.includes(term)));
    const category = match?.category || 'General Farming';
    return { text: getAssistantResponseText(language, category) || match?.text || 'Start with the basics: check your crop, soil and local weather conditions. Ask a specific question and I will offer a short prototype guide.', category, action: match?.action, mode: 'demo', disease: match?.disease };
}
export async function getAssistantResponse(message, farmerContext = {}) {
    if (!message || !message.trim()) throw new Error('EMPTY_MESSAGE');
    if (AI_API_KEY && AI_API_URL) {
        try { const response = await fetch(AI_API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + AI_API_KEY }, body: JSON.stringify({ message, farmerContext }) }); if (!response.ok) throw new Error('AI_API_' + response.status); return { ...(await response.json()), mode: 'live' }; } catch { return { ...demoResponse(message, farmerContext.language), mode: 'demo', fallback: true }; }
    }
    return { ...demoResponse(message, farmerContext.language), disclaimer: SAFETY, mode: 'demo' };
}
export { DEMO_MESSAGE, SAFETY };
