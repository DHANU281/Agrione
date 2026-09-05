import { analyzeCropImage, getDiseaseReports, saveDiseaseReport } from './services/diseaseDetectionService.js';
import { firebaseStatus, signIn, signUp, signOutUser, resetPassword, observeAuth, saveFarmerCollection, getFarmerProfile, saveFarmerProfile, getCurrentUser } from './services/firebaseService.js';
import { getWeather, weatherDisclaimer } from './services/weatherService.js';
import { getNearbyServices, serviceCategories } from './services/nearbyServicesService.js';
import { getMarketPrices, getMarketTrend, getMarketComparison } from './services/marketService.js';
import { getEquipment } from './services/equipmentService.js';
import { getSoilServices } from './services/soilService.js';
import { getStorage } from './services/storageService.js';
import { getAssistantResponse, DEMO_MESSAGE, SAFETY } from './services/aiAssistantService.js';
import { languageOptions, getLanguage, setLanguage, t, speechLanguage, applyTranslations, getAssistantQuestions } from './i18n/index.js';
import { createNotification } from './services/notificationService.js';
document.addEventListener('DOMContentLoaded', () => {
    const imageInput = document.getElementById('cropImage');
    const previewBox = document.getElementById('previewBox');
    const previewImage = document.getElementById('previewImage');
    const marketImageInput = document.getElementById('marketCropImage');
    const marketPreviewBox = document.getElementById('marketPreviewBox');
    const marketPreviewImage = document.getElementById('marketPreviewImage');
    const marketSuccessMessage = document.getElementById('marketSuccessMessage');
    const detectButton = document.getElementById('detectBtn');
    const resultContent = document.getElementById('resultContent');
    const cropResult = document.getElementById('cropResult');
    const diseaseName = document.getElementById('diseaseName');
    const confidenceValue = document.getElementById('confidenceValue');
    const symptomsValue = document.getElementById('symptomsValue');
    const treatmentValue = document.getElementById('treatmentValue');
    const preventionValue = document.getElementById('preventionValue');
    const demoOrderForm = document.getElementById('demoOrderForm');
    const orderMessage = document.getElementById('orderMessage');
    const dashboardSellForm = document.getElementById('dashboardSellForm');
    const farmerSellForm = document.getElementById('farmerSellForm');
    const authOverlay = document.getElementById('authOverlay');
    const profileButton = document.getElementById('profileButton');
    const closeAuthButton = document.getElementById('closeAuthButton');
    const authViews = document.querySelectorAll('.auth-view');
    const notificationButton = document.getElementById('notificationButton');
    const notificationPanel = document.getElementById('notificationPanel');
    const globalSearch = document.getElementById('globalSearch');
    const searchResults = document.getElementById('searchResults');
    const diseaseDropZone = document.getElementById('diseaseDropZone');
    const removeImageButton = document.getElementById('removeImageButton');
    const analysisLoading = document.getElementById('analysisLoading');
    const diseaseError = document.getElementById('diseaseError');
    const diseaseReportList = document.getElementById('diseaseReportList');
    const modeIndicators = document.querySelectorAll('.firebase-mode-indicator');
    modeIndicators.forEach((indicator) => { indicator.textContent = firebaseStatus.configured ? 'Firebase connected' : 'Demo Mode — Firebase backend is not connected'; });
    const offlineIndicator = document.getElementById('offlineIndicator');
    const updateOnlineState = () => offlineIndicator?.classList.toggle('hidden', navigator.onLine);
    window.addEventListener('online', updateOnlineState); window.addEventListener('offline', updateOnlineState); updateOnlineState();
    if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('../sw.js').catch(() => {});
    let installPrompt;
    window.addEventListener('beforeinstallprompt', (event) => { event.preventDefault(); installPrompt = event; document.getElementById('installAppButton')?.classList.remove('hidden'); });
    document.getElementById('installAppButton')?.addEventListener('click', async () => { if (!installPrompt) return; installPrompt.prompt(); await installPrompt.userChoice; installPrompt = null; document.getElementById('installAppButton').classList.add('hidden'); });
    const languageSelector = document.getElementById('languageSelector');
    const settingsLanguage = document.getElementById('settingsLanguage');
    const languageOptionsMarkup = languageOptions.map((language) => '<option value="' + language.code + '">' + language.nativeName + '</option>').join('');
    if (languageSelector) { languageSelector.innerHTML = languageOptionsMarkup; languageSelector.value = getLanguage(); }
    if (settingsLanguage) { settingsLanguage.innerHTML = languageOptionsMarkup; settingsLanguage.value = getLanguage(); }
    document.getElementById('settingsLanguageList').innerHTML = languageOptions.map((language) => '<button type="button" data-settings-language="' + language.code + '"><strong>' + language.nativeName + '</strong><small>' + language.code.toUpperCase() + '</small></button>').join('');
    const translationMap = { '#languageLabel': 'nav.language', '#loginButton': 'auth.login', '#profileView [data-auth-view="login"]': 'auth.login', '#logoutButton': 'auth.logout', '.dashboard-title-wrap h2': 'dashboard.welcome', '#weather-panel h3': 'dashboard.weather', '#market-panel h3': 'dashboard.market', '.ai-hero h2': 'assistant.title', '.ai-hero .section-subtitle': 'assistant.hero', '#clearAssistantChat': 'assistant.clear', '#newAssistantChat': 'assistant.new', '#assistantChatForm button[type="submit"]': 'assistant.send' };
    const markTranslations = () => Object.entries(translationMap).forEach(([selector, key]) => { const element = document.querySelector(selector); if (element) { element.dataset.i18n = key; } });
    markTranslations();
    document.getElementById('heroTagline').dataset.i18n = 'brand.tagline';
    document.querySelectorAll('.nav-links a').forEach((element, index) => { const keys = ['nav.home', 'nav.dashboard', 'nav.disease', 'nav.market', 'nav.intelligence', 'nav.services', 'nav.ai', 'nav.marketplace', 'nav.services', 'nav.about']; if (keys[index]) element.dataset.i18n = keys[index]; });
    applyTranslations();
    const changeAppLanguage = async (language) => { setLanguage(language); if (settingsLanguage) settingsLanguage.value = language; if (languageSelector) languageSelector.value = language; const profile = { preferredLanguage: language }; if (firebaseStatus.configured) { try { await saveFarmerProfile(profile); } catch { } } };
    languageSelector?.addEventListener('change', (event) => changeAppLanguage(event.target.value));
    settingsLanguage?.addEventListener('change', (event) => changeAppLanguage(event.target.value));
    document.getElementById('saveLanguagePreference')?.addEventListener('click', () => changeAppLanguage(settingsLanguage.value));
    document.getElementById('settingsLanguageList')?.addEventListener('click', (event) => { const language = event.target.closest('[data-settings-language]')?.dataset.settingsLanguage; if (language) changeAppLanguage(language); });
    const onboarding = document.getElementById('languageOnboarding');
    if (!localStorage.getItem('agrione-language-onboarded')) { onboarding?.classList.remove('hidden'); document.body.classList.add('modal-open'); }
    document.getElementById('onboardingLanguages').innerHTML = languageOptions.map((language) => '<button type="button" data-onboarding-language="' + language.code + '"><strong>' + language.nativeName + '</strong><small>' + language.code.toUpperCase() + '</small></button>').join('');
    document.getElementById('onboardingLanguages')?.addEventListener('click', (event) => { const language = event.target.closest('[data-onboarding-language]')?.dataset.onboardingLanguage; if (!language) return; changeAppLanguage(language); localStorage.setItem('agrione-language-onboarded', 'true'); onboarding.classList.add('hidden'); document.body.classList.remove('modal-open'); document.getElementById('home')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
    document.getElementById('assistantLanguage').innerHTML = languageOptionsMarkup;
    document.getElementById('assistantLanguage').value = getLanguage();
    document.addEventListener('languagechange', () => { const assistantLanguage = document.getElementById('assistantLanguage'); if (assistantLanguage) { assistantLanguage.value = getLanguage(); } const assistantContextLanguage = getLanguage(); if (typeof assistantContext !== 'undefined') assistantContext.language = assistantContextLanguage; document.getElementById('languageLabel').textContent = t('nav.language'); document.getElementById('onboardingTitle').textContent = t('onboarding.title'); document.getElementById('onboardingCopy').textContent = t('onboarding.copy'); });
    let latestWeather;
    const weatherLocation = JSON.parse(localStorage.getItem('agrione-weather-location') || '{"village":"Nallapadu","district":"Guntur","state":"Andhra Pradesh"}');
    const locationInputs = { village: document.getElementById('weatherVillage'), district: document.getElementById('weatherDistrict'), state: document.getElementById('weatherState') };
    Object.entries(locationInputs).forEach(([key, input]) => { if (input && weatherLocation[key]) input.value = weatherLocation[key]; });

    const showAuthView = (viewName) => {
        if (!authOverlay) return;
        authViews.forEach((view) => {
            view.classList.toggle('hidden', view.id !== viewName + 'View');
        });
        authOverlay.classList.remove('hidden');
        document.body.classList.add('modal-open');
    };

    const closeAuth = () => {
        authOverlay?.classList.add('hidden');
        document.body.classList.remove('modal-open');
    };

    document.querySelectorAll('[data-auth-view]').forEach((button) => {
        button.addEventListener('click', () => showAuthView(button.getAttribute('data-auth-view')));
    });

    document.getElementById('loginButton')?.addEventListener('click', () => showAuthView('login'));
    profileButton?.addEventListener('click', () => showAuthView('profile'));
    closeAuthButton?.addEventListener('click', closeAuth);
    authOverlay?.addEventListener('click', (event) => {
        if (event.target === authOverlay) closeAuth();
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeAuth();
    });

    notificationButton?.addEventListener('click', () => notificationPanel?.classList.toggle('hidden'));
    document.getElementById('closeNotificationButton')?.addEventListener('click', () => notificationPanel?.classList.add('hidden'));
    notificationPanel?.querySelectorAll('.notification-item').forEach((item) => {
        const actions = document.createElement('div');
        actions.className = 'notification-actions';
        actions.innerHTML = '<button type="button" data-notification-action="read">Mark as read</button><button type="button" data-notification-action="view">View alert</button><button type="button" data-notification-action="delete">Delete</button>';
        item.appendChild(actions);
    });
    notificationPanel?.addEventListener('click', (event) => {
        const button = event.target.closest('[data-notification-action]');
        const item = button?.closest('.notification-item');
        if (!button || !item) return;
        if (button.dataset.notificationAction === 'delete') item.remove();
        if (button.dataset.notificationAction === 'read') { item.classList.add('is-read'); button.textContent = 'Read'; button.disabled = true; }
        if (button.dataset.notificationAction === 'view') document.getElementById('farm-weather')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        const badge = document.querySelector('.notification-badge');
        if (badge) badge.textContent = String(notificationPanel.querySelectorAll('.notification-item:not(.is-read)').length);
    });

    const searchableContent = [
        ['AI Assistant', 'Ask farming questions in simple language', '#ai-assistant'],
        ['Learning Center', 'Farmer education and practical guidance', '#learning-center'],
        ['Help & Support', 'Support tickets and farmer feedback', '#help-support'],
        ['Farm Services', 'Equipment soil testing and storage', '#farm-services'],
        ['Weather', 'Farm weather and planning alerts', '#farm-weather'],
        ['Market Intelligence', 'Prototype prices and market trends', '#market-intelligence'],
        ['Tomato', 'Market prices and buyer listings', '#market'],
        ['Paddy', 'Market prices and crop listings', '#market'],
        ['Market Intelligence', 'Prototype price comparison and farm profit tools', '#market-intelligence'],
        ['Chilli', 'Demo market analytics', '#market-analytics'],
        ['Tractor', 'Equipment rental', '#services'],
        ['Soil Testing', 'Request a soil health test', '#services'],
        ['Disease Detection', 'AI crop health demo', '#disease'],
        ['Storage', 'Crop storage snapshot', '#storage']
    ];

    globalSearch?.addEventListener('input', () => {
        const query = globalSearch.value.trim().toLowerCase();
        if (!searchResults) return;
        if (!query) {
            searchResults.classList.add('hidden');
            searchResults.innerHTML = '';
            return;
        }
        const matches = searchableContent.filter(([title, description]) => (title + description).toLowerCase().includes(query));
        searchResults.innerHTML = matches.length
            ? matches.map(([title, description, target]) => '<button class="search-result" type="button" data-search-target="' + target + '"><strong>' + title + '</strong><small>' + description + '</small></button>').join('')
            : '<p class="search-result"><strong>No demo content found</strong><small>Try Tomato, Tractor, or Disease Detection.</small></p>';
        searchResults.classList.remove('hidden');
        searchResults.querySelectorAll('[data-search-target]').forEach((result) => {
            result.addEventListener('click', () => {
                document.querySelector(result.dataset.searchTarget)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                searchResults.classList.add('hidden');
                globalSearch.value = '';
            });
        });
    });

    const formatLocation = (location) => [location.village, location.district, location.state].filter(Boolean).join(', ');
    const saveSupportRecord = async (collection, record) => { localStorage.setItem('agrione-' + collection, JSON.stringify([record, ...JSON.parse(localStorage.getItem('agrione-' + collection) || '[]')])); if (firebaseStatus.configured) { try { await saveFarmerCollection(collection, record); } catch { } } };
    document.querySelectorAll('[data-support-topic]').forEach((button) => button.addEventListener('click', () => { document.getElementById('supportCategory').value = button.dataset.supportTopic === 'Frequently Asked Questions' ? 'Contact Support' : button.dataset.supportTopic; document.getElementById('supportMessage').focus(); }));
    document.getElementById('supportForm')?.addEventListener('submit', async (event) => { event.preventDefault(); const form = event.currentTarget; if (!form.reportValidity()) return; const record = { ticketId: 'ticket-' + Date.now(), userId: getCurrentUser()?.uid || 'demo-farmer', category: document.getElementById('supportCategory').value, message: document.getElementById('supportMessage').value.trim(), status: 'Open', createdAt: new Date().toISOString() }; await saveSupportRecord('supportTickets', record); document.getElementById('supportSuccess').classList.remove('hidden'); form.reset(); });
    document.getElementById('feedbackForm')?.addEventListener('submit', async (event) => { event.preventDefault(); const form = event.currentTarget; if (!form.reportValidity()) return; await saveSupportRecord('feedback', { userId: getCurrentUser()?.uid || 'demo-farmer', rating: Number(document.getElementById('feedbackRating').value), category: document.getElementById('feedbackCategory').value, message: document.getElementById('feedbackText').value, status: 'Open', createdAt: new Date().toISOString() }); document.getElementById('feedbackSuccess').classList.remove('hidden'); form.reset(); });
    document.getElementById('partnershipForm')?.addEventListener('submit', async (event) => { event.preventDefault(); const form = event.currentTarget; if (!form.reportValidity()) return; await saveSupportRecord('partnershipRequests', { userId: getCurrentUser()?.uid || 'demo-farmer', name: document.getElementById('partnerName').value, organization: document.getElementById('partnerOrganization').value, email: document.getElementById('partnerEmail').value, mobile: document.getElementById('partnerMobile').value, partnershipType: document.getElementById('partnerType').value, message: document.getElementById('partnerMessage').value, status: 'Open', createdAt: new Date().toISOString() }); document.getElementById('partnershipSuccess').classList.remove('hidden'); form.reset(); });
    const advisoryData = (weather) => {
        const current = weather.current;
        const alerts = [];
        if (current.rain >= 50) alerts.push(['Rain expected', 'Rain is expected. Consider postponing irrigation if field moisture is sufficient.']);
        if (current.temperature >= 30) alerts.push(['High temperature', 'High temperature expected. Monitor crop water requirements.']);
        if (current.humidity >= 80) alerts.push(['High humidity', 'High humidity detected. Monitor crops for fungal disease symptoms.']);
        if (current.wind >= 20) alerts.push(['Strong wind', 'Strong winds expected. Avoid spraying during unsafe wind conditions.']);
        if (current.rain < 25) alerts.push(['Low rainfall', 'Low rainfall conditions detected. Plan irrigation based on soil moisture and crop requirements.']);
        return alerts.length ? alerts : [['Field conditions', 'Review soil moisture and crop stage before scheduling field activities.']];
    };
    const renderWeather = (weather) => {
        latestWeather = weather;
        const current = weather.current;
        const locationText = formatLocation(weather.location);
        document.getElementById('weatherTemperature').textContent = current.temperature + '°C';
        document.getElementById('weatherCondition').textContent = current.condition;
        document.getElementById('weatherIcon').textContent = current.icon;
        document.getElementById('weatherLocation').textContent = locationText;
        document.getElementById('weatherDate').textContent = new Intl.DateTimeFormat(undefined, { dateStyle: 'full' }).format(new Date());
        document.getElementById('weatherFeelsLike').textContent = current.feelsLike + '°C';
        document.getElementById('weatherHumidity').textContent = current.humidity + '%';
        document.getElementById('weatherWind').textContent = current.wind + ' km/h';
        document.getElementById('weatherRain').textContent = current.rain + '%';
        document.getElementById('weatherSunrise').textContent = current.sunrise;
        document.getElementById('weatherSunset').textContent = current.sunset;
        document.getElementById('weatherModeBadge').textContent = weather.mode === 'demo' ? 'Demo Weather Data' : 'Live Weather Data';
        document.getElementById('weatherStatus').textContent = weather.mode === 'demo' ? (weather.fallbackReason ? 'Demo Mode — Live weather was unavailable. ' + weatherDisclaimer : weatherDisclaimer) : 'Live weather connected through the configured weather service.';
        document.getElementById('forecastList').innerHTML = weather.forecast.map((day) => '<div><strong>' + day.date + '</strong><span>' + day.icon + ' ' + day.condition + '<br>' + day.max + '° / ' + day.min + '°</span><small>' + day.rain + '% rain · ' + day.humidity + '% humidity<br>' + day.wind + ' km/h wind</small></div>').join('');
        document.getElementById('weatherAlerts').innerHTML = advisoryData(weather).map(([title, message]) => '<article class="advisory-card"><span>Prototype Advisory</span><h3>' + title + '</h3><p>' + message + '</p></article>').join('');
        document.getElementById('weatherInsights').innerHTML = [['🌧️ Rain', current.rain + '% probability. Check field moisture before irrigation.'], ['💧 Irrigation', current.rain >= 50 ? 'Rain may reduce the need for planned irrigation.' : 'Moderate irrigation may be considered depending on soil moisture and crop stage.'], ['🌱 Crop Health', current.humidity >= 80 ? 'Monitor crops for fungal disease symptoms.' : 'Inspect crop leaves during the next field visit.'], ['🌬️ Wind', current.wind >= 20 ? 'Avoid spraying during unsafe wind conditions.' : 'Wind conditions are suitable for routine field inspection.'], ['☀️ Temperature', current.temperature >= 30 ? 'Monitor crop water requirements during hot periods.' : 'Temperature is moderate for planned field checks.']].map(([title, message]) => '<div><span>' + title + '</span><strong>' + message + '</strong></div>').join('');
        document.getElementById('historyTemperature').textContent = weather.history.averageTemperature;
        document.getElementById('historyRainfall').textContent = weather.history.rainfallTrend;
        document.getElementById('historyHumidity').textContent = weather.history.humidityTrend;
        document.getElementById('historyRainyDays').textContent = weather.history.rainyDays;
        document.getElementById('historyChart').innerHTML = weather.history.values.map((value) => '<span style="height:' + value + '%" title="' + value + '%"></span>').join('');
        document.getElementById('dashboardTemperature').textContent = current.temperature + '°C';
        document.getElementById('dashboardWeatherIcon').textContent = current.icon;
        document.getElementById('dashboardHumidity').textContent = current.humidity + '%';
        document.getElementById('dashboardRain').textContent = current.rain + '%';
        document.getElementById('dashboardWind').textContent = current.wind + ' km/h';
        document.getElementById('dashboardAdvisory').textContent = advisoryData(weather)[0][0];
        document.getElementById('dashboardAlert').textContent = 'Prototype Advisory: ' + advisoryData(weather)[0][1];
    };
    const loadWeather = async (location) => renderWeather(await getWeather(location));
    document.getElementById('useLocationButton')?.addEventListener('click', () => {
        const status = document.getElementById('weatherStatus');
        if (!navigator.geolocation) { status.textContent = 'Location is not available in this browser. Manual selection remains available.'; return; }
        status.textContent = 'Requesting one approximate location to improve weather results...';
        navigator.geolocation.getCurrentPosition((position) => {
            locationInputs.village.value = 'Approximate location';
            const location = { village: 'Approximate location', district: locationInputs.district.value.trim(), state: locationInputs.state.value, latitude: position.coords.latitude.toFixed(2), longitude: position.coords.longitude.toFixed(2) };
            localStorage.setItem('agrione-weather-location', JSON.stringify(location));
            document.getElementById('nearbyLocationName').textContent = formatLocation(location);
            loadWeather(location);
        }, () => { status.textContent = weatherDisclaimer + ' Location permission was denied; choose a location manually.'; }, { enableHighAccuracy: false, maximumAge: 300000, timeout: 10000 });
    });
    document.getElementById('locationForm')?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const location = { village: locationInputs.village.value.trim(), district: locationInputs.district.value.trim(), state: locationInputs.state.value };
        localStorage.setItem('agrione-weather-location', JSON.stringify(location));
        document.getElementById('nearbyLocationName').textContent = formatLocation(location);
        await saveFarmerProfile({ farmLocation: location });
        await loadWeather(location);
    });
    loadWeather(weatherLocation);

    let nearbyData = [];
    const serviceRequests = JSON.parse(localStorage.getItem('agrione-service-requests') || '[]');
    const renderRequestHistory = () => {
        const container = document.getElementById('serviceRequestHistory');
        if (!container) return;
        container.innerHTML = serviceRequests.length ? serviceRequests.map((request) => '<div class="request-row"><div><strong>' + request.serviceName + '</strong><span>' + request.serviceType + ' · ' + request.requestDate + '</span></div><span>' + request.location + '</span><b>' + request.status + '</b><button class="mini-btn" type="button">View Details</button></div>').join('') : '<p class="panel-caption">No service requests yet.</p>';
    };
    const createServiceRequest = async (service, serviceType) => {
        const location = formatLocation(JSON.parse(localStorage.getItem('agrione-weather-location') || '{}')) || 'Selected farm location';
        const request = { farmerId: getCurrentUser()?.uid || 'demo-farmer', serviceId: service.id, serviceName: service.name, serviceType, location, requestDate: new Date().toISOString().slice(0, 10), status: 'Requested', createdAt: new Date().toISOString() };
        serviceRequests.unshift(request);
        localStorage.setItem('agrione-service-requests', JSON.stringify(serviceRequests));
        if (firebaseStatus.configured) { try { await saveFarmerCollection('serviceRequests', request); } catch { document.getElementById('serviceError').textContent = 'Saved in Demo Mode while Firebase reconnects.'; document.getElementById('serviceError').classList.remove('hidden'); } }
        renderRequestHistory();
        alert('Request created with status Requested. Future updates may include Confirmed, In Progress, Completed or Cancelled.');
    };
    const serviceCard = (service) => '<article class="service-card"><div class="service-card-head"><span class="service-icon">' + service.icon + '</span><div><span class="prototype-label">Prototype Listing</span><h3>' + service.name + '</h3></div></div><p class="service-category">' + service.category + ' · ' + service.availability + '</p><p>' + service.location + ' · approx. ' + service.distance + ' km</p><p class="service-offer">' + service.services + '</p>' + (service.price ? '<strong>Demo Price: ' + service.price + '</strong>' : '') + (service.fee ? '<strong>Demo Fee: ' + service.fee + '</strong>' : '') + (service.capacity ? '<strong>Capacity: ' + service.capacity + '</strong>' : '') + '<span class="verification-status">Demo / Unverified</span><div class="service-card-actions"><button class="secondary-btn" type="button" data-service-action="contact" data-service-id="' + service.id + '">Contact</button><button class="mini-btn" type="button" data-service-action="details" data-service-id="' + service.id + '">View Details</button><button class="mini-btn" type="button" data-service-action="directions" data-service-id="' + service.id + '">Get Directions</button></div></article>';
    const renderNearbyServices = () => {
        const query = (document.getElementById('serviceSearch')?.value || '').trim().toLowerCase();
        const category = document.getElementById('serviceCategory')?.value || 'All Services';
        const maxDistance = document.getElementById('serviceDistance')?.value || 'all';
        const availability = document.getElementById('serviceAvailability')?.value || 'all';
        const sort = document.getElementById('serviceSort')?.value || 'nearest';
        const filtered = nearbyData.filter((service) => (!query || (service.name + service.category + service.location + service.services).toLowerCase().includes(query)) && (category === 'All Services' || service.category === category) && (maxDistance === 'all' || service.distance <= Number(maxDistance)) && (availability === 'all' || service.availability === availability)).sort((a, b) => sort === 'nearest' ? a.distance - b.distance : a.name.localeCompare(b.name));
        document.getElementById('serviceCards').innerHTML = filtered.map(serviceCard).join('');
        document.getElementById('emptyServices').classList.toggle('hidden', filtered.length > 0);
    };
    const renderSpecialHighlights = () => {
        [['buyerHighlights', 'Crop Buyers'], ['soilHighlights', 'Soil Testing'], ['storageHighlights', 'Storage Facilities']].forEach(([id, category]) => { const service = nearbyData.find((item) => item.category === category); const target = document.getElementById(id); if (service && target) target.innerHTML = '<div class="highlight-item"><strong>' + service.name + '</strong><span>' + service.location + ' · ' + service.distance + ' km</span><p>' + service.services + '</p><b>' + (service.price ? 'Demo Price: ' + service.price : service.fee ? 'Demo Fee: ' + service.fee : 'Demo capacity: ' + service.capacity) + '</b><button class="secondary-btn" type="button" data-service-action="request" data-service-id="' + service.id + '">' + (category === 'Crop Buyers' ? 'Contact Buyer' : category === 'Soil Testing' ? 'Request Soil Test' : 'Request Storage') + '</button></div>'; });
    };
    const initialiseNearby = async () => { const result = await getNearbyServices(weatherLocation); nearbyData = result.services; document.getElementById('nearbyLocationName').textContent = formatLocation(weatherLocation); document.getElementById('serviceCategory').innerHTML = serviceCategories.map((category) => '<option>' + category + '</option>').join(''); document.getElementById('serviceCategories').innerHTML = serviceCategories.map((category, index) => '<button type="button" class="' + (index === 0 ? 'active' : '') + '" data-service-category="' + category + '">' + category + '</button>').join(''); renderNearbyServices(); renderSpecialHighlights(); renderRequestHistory(); };
    initialiseNearby();
    document.querySelectorAll('#serviceSearch, #serviceCategory, #serviceDistance, #serviceAvailability, #serviceSort').forEach((control) => control.addEventListener(control.tagName === 'INPUT' ? 'input' : 'change', renderNearbyServices));
    document.getElementById('serviceCategories')?.addEventListener('click', (event) => { const button = event.target.closest('[data-service-category]'); if (!button) return; document.getElementById('serviceCategory').value = button.dataset.serviceCategory; document.querySelectorAll('[data-service-category]').forEach((item) => item.classList.toggle('active', item === button)); renderNearbyServices(); });
    document.getElementById('serviceCards')?.addEventListener('click', (event) => { const button = event.target.closest('[data-service-action]'); if (!button) return; const service = nearbyData.find((item) => item.id === button.dataset.serviceId); if (!service) return; if (button.dataset.serviceAction === 'directions') document.getElementById('directionsNote').textContent = 'Directions integration will be available when live map services are connected.'; else if (button.dataset.serviceAction === 'details') alert(service.name + ' is a Prototype Listing marked Demo / Unverified.'); else createServiceRequest(service, service.category === 'Crop Buyers' ? 'Buyer enquiry' : service.serviceType); });
    document.querySelectorAll('#buyerHighlights, #soilHighlights, #storageHighlights').forEach((container) => container.addEventListener('click', (event) => { const button = event.target.closest('[data-service-action="request"]'); if (!button) return; const service = nearbyData.find((item) => item.id === button.dataset.serviceId); if (service) createServiceRequest(service, service.serviceType); }));
    document.getElementById('nearbyChangeLocation')?.addEventListener('click', () => document.getElementById('locationForm')?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
    document.getElementById('nearbyUseLocation')?.addEventListener('click', () => document.getElementById('useLocationButton')?.click());
    document.getElementById('mapZoomIn')?.addEventListener('click', () => document.getElementById('mapSurface')?.classList.add('map-zoomed'));
    document.getElementById('mapZoomOut')?.addEventListener('click', () => document.getElementById('mapSurface')?.classList.remove('map-zoomed'));

    const equipmentData = getEquipment();
    const soilData = getSoilServices();
    const storageData = getStorage();
    const farmRequests = JSON.parse(localStorage.getItem('agrione-farm-service-requests') || '[]');
    let selectedEquipment = equipmentData[0];
    const addFarmNotification = (request) => {
        const list = document.querySelector('.notification-list');
        if (!list) return;
        const item = document.createElement('div');
        item.className = 'notification-item';
        item.innerHTML = '<span class="notification-icon equipment-notice">' + (request.serviceType === 'Equipment Rental' ? '🚜' : request.serviceType === 'Soil Testing' ? '🧪' : '📦') + '</span><div><strong>' + request.serviceType + ' request</strong><p>' + request.name + ' was submitted with status ' + request.status + '.</p><small>Just now · DEMO</small></div>';
        const actions = document.createElement('div');
        actions.className = 'notification-actions';
        actions.innerHTML = '<button type="button" data-notification-action="read">Mark as read</button><button type="button" data-notification-action="view">View alert</button><button type="button" data-notification-action="delete">Delete</button>';
        item.appendChild(actions);
        list.prepend(item);
    };
    const saveFarmRequest = async (request, collection) => {
        farmRequests.unshift(request);
        localStorage.setItem('agrione-farm-service-requests', JSON.stringify(farmRequests));
        addFarmNotification(request);
        if (firebaseStatus.configured) { try { await saveFarmerCollection(collection, request); } catch { document.getElementById('farmServiceError').textContent = 'Saved in Demo Mode while Firebase reconnects.'; } }
        renderFarmRequests();
    };
    const renderFarmRequests = (type = 'all') => {
        const target = document.getElementById('farmRequestHistory');
        if (!target) return;
        const filtered = farmRequests.filter((request) => type === 'all' || request.serviceType.toLowerCase().includes(type));
        target.innerHTML = filtered.length ? filtered.map((request) => '<div class="farm-request-row"><div><strong>' + request.name + '</strong><span>' + request.serviceType + ' · ' + request.requestDate + '</span></div><span>' + request.location + '</span><b>' + request.status + '</b><button class="mini-btn" type="button" data-request-details="' + request.requestId + '">View Details</button></div>').join('') : '<p class="panel-caption">No requests yet.</p>';
    };
    const equipmentCard = (item) => '<article class="farm-service-card"><div class="farm-card-head"><span class="farm-service-icon">' + item.icon + '</span><div><span class="prototype-label">Prototype Listing</span><h3>' + item.name + '</h3></div></div><p>' + item.providerName + ' · ' + item.location + '</p><strong>Demo Price: ₹' + item.price.toLocaleString('en-IN') + '/' + item.unit + '</strong><p>' + item.availability + ' · Rating ' + item.rating + '</p><span class="verification-status">Demo / Unverified</span><div class="farm-card-actions"><button class="primary-btn" type="button" data-equipment-book="' + item.id + '">Request Rental</button><button class="mini-btn" type="button" data-equipment-details="' + item.id + '">View Details</button></div></article>';
    const renderEquipment = () => { const query = (document.getElementById('farmServiceSearch').value + document.getElementById('equipmentType').value + document.getElementById('equipmentLocation').value + document.getElementById('equipmentAvailability').value).toLowerCase(); const cards = equipmentData.filter((item) => (document.getElementById('equipmentType').value === 'All equipment' || item.name.toLowerCase().includes(document.getElementById('equipmentType').value.toLowerCase())) && (document.getElementById('equipmentLocation').value === 'All locations' || item.location === document.getElementById('equipmentLocation').value) && (document.getElementById('equipmentAvailability').value === 'Any availability' || item.availability === document.getElementById('equipmentAvailability').value) && (!document.getElementById('farmServiceSearch').value || (item.name + item.providerName + item.location).toLowerCase().includes(document.getElementById('farmServiceSearch').value.toLowerCase()))); document.getElementById('equipmentCards').innerHTML = cards.map(equipmentCard).join(''); };
    const renderSoil = () => { const type = document.getElementById('soilServiceType').value; const location = document.getElementById('soilServiceLocation').value; document.getElementById('soilServiceCards').innerHTML = soilData.filter((item) => (location === 'All locations' || item.location === location) && (type === 'All test types' || item.types.includes(type))).map((item) => '<article class="farm-service-card"><span class="prototype-label">Prototype Listing</span><h3>🧪 ' + item.name + '</h3><p>' + item.location + ' · ' + item.distance + ' km · ' + item.availability + '</p><p>' + item.types + '</p><strong>Demo Fee: ₹' + item.fee + '/sample</strong><button class="primary-btn" type="button" data-soil-request="' + item.id + '">Request Soil Test</button></article>').join(''); };
    const renderStorage = () => { const type = document.getElementById('storageType').value; const location = document.getElementById('storageLocation').value; const availability = document.getElementById('storageAvailability').value; document.getElementById('storageCards').innerHTML = storageData.filter((item) => (type === 'All storage' || item.type === type) && (location === 'All locations' || item.location === location) && (availability === 'Any availability' || item.availability === availability)).map((item) => '<article class="farm-service-card"><span class="prototype-label">Prototype Listing</span><h3>📦 ' + item.name + '</h3><p>' + item.type + ' · ' + item.location + '</p><p>Capacity: ' + item.capacity + ' · Available: ' + item.available + '</p><strong>Demo Price: ₹' + item.price + '/' + item.unit + '</strong><p>' + item.availability + '</p><button class="primary-btn" type="button" data-storage-request="' + item.id + '">Request Storage</button></article>').join(''); };
    const selectEquipment = (item) => { selectedEquipment = item; document.getElementById('bookingEquipment').value = item.name; document.getElementById('bookingEstimate').textContent = 'Prototype Estimate: ₹' + item.price + ' per day × selected days.'; document.getElementById('equipmentBookingForm').scrollIntoView({ behavior: 'smooth', block: 'center' }); };
    const initialiseFarmServices = () => { renderEquipment(); renderSoil(); renderStorage(); renderFarmRequests(); document.querySelectorAll('[data-farm-tab]').forEach((tab) => tab.addEventListener('click', () => { document.querySelectorAll('[data-farm-tab]').forEach((item) => item.classList.toggle('active', item === tab)); document.querySelectorAll('.farm-service-pane').forEach((pane) => pane.classList.toggle('active', pane.id === 'farm' + tab.dataset.farmTab.charAt(0).toUpperCase() + tab.dataset.farmTab.slice(1) + 'Pane')); })); };
    initialiseFarmServices();
    document.querySelectorAll('#farmServiceSearch, #equipmentType, #equipmentAvailability, #equipmentLocation').forEach((control) => control.addEventListener(control.tagName === 'INPUT' ? 'input' : 'change', renderEquipment));
    document.querySelectorAll('#soilServiceType, #soilServiceLocation').forEach((control) => control.addEventListener('change', renderSoil));
    document.querySelectorAll('#storageType, #storageLocation, #storageAvailability').forEach((control) => control.addEventListener('change', renderStorage));
    document.getElementById('equipmentCards')?.addEventListener('click', (event) => { const book = event.target.closest('[data-equipment-book]'); const details = event.target.closest('[data-equipment-details]'); const item = equipmentData.find((equipment) => equipment.id === (book || details)?.dataset.equipmentBook || (book || details)?.dataset.equipmentDetails); if (!item) return; if (details) alert(item.name + ': ' + item.description + ' Available dates: ' + item.dates + '. Requirements: ' + item.requirements + '. Provider contact is available after request review.'); else selectEquipment(item); });
    document.getElementById('soilServiceCards')?.addEventListener('click', (event) => { const item = soilData.find((service) => service.id === event.target.dataset.soilRequest); if (item) { document.getElementById('farmSoilTestType').value = item.types.split(',')[0]; document.getElementById('farmSoilForm').scrollIntoView({ behavior: 'smooth', block: 'center' }); } });
    document.getElementById('storageCards')?.addEventListener('click', (event) => { const item = storageData.find((service) => service.id === event.target.dataset.storageRequest); if (item) { document.getElementById('storageRequestType').value = item.type; document.getElementById('storageForm').scrollIntoView({ behavior: 'smooth', block: 'center' }); } });
    const dateDifference = (start, end) => Math.floor((new Date(end) - new Date(start)) / 86400000) + 1;
    document.getElementById('bookingStart')?.addEventListener('change', () => { const start = document.getElementById('bookingStart').value; const end = document.getElementById('bookingEnd').value; if (start && end && dateDifference(start, end) > 0) document.getElementById('bookingDays').value = dateDifference(start, end); });
    document.getElementById('bookingEnd')?.addEventListener('change', () => document.getElementById('bookingStart').dispatchEvent(new Event('change')));
    document.getElementById('equipmentBookingForm')?.addEventListener('submit', async (event) => { event.preventDefault(); if (!event.currentTarget.reportValidity()) return; const start = document.getElementById('bookingStart').value; const end = document.getElementById('bookingEnd').value; const days = Number(document.getElementById('bookingDays').value); const error = document.getElementById('farmServiceError'); if (!selectedEquipment || !selectedEquipment.name) { error.textContent = 'Select equipment before requesting a rental.'; return; } if (!days || dateDifference(start, end) <= 0) { error.textContent = 'End date must be on or after the start date.'; return; } error.textContent = ''; const estimatedCost = selectedEquipment.price * days; document.getElementById('bookingEstimate').textContent = 'Prototype Estimate: ₹' + estimatedCost.toLocaleString('en-IN') + ' for ' + days + ' day(s). This is not a confirmed quotation.'; await saveFarmRequest({ requestId: 'equipment-' + Date.now(), farmerId: getCurrentUser()?.uid || 'demo-farmer', serviceType: 'Equipment Rental', name: selectedEquipment.name, equipmentId: selectedEquipment.id, startDate: start, endDate: end, location: document.getElementById('bookingLocation').value, estimatedCost, status: 'Requested', requestDate: new Date().toISOString().slice(0, 10), createdAt: new Date().toISOString() }, 'equipmentRequests'); document.getElementById('equipmentSuccess').classList.remove('hidden'); event.currentTarget.reset(); });
    document.getElementById('farmSoilForm')?.addEventListener('submit', async (event) => { event.preventDefault(); if (!event.currentTarget.reportValidity()) return; await saveFarmRequest({ requestId: 'soil-' + Date.now(), farmerId: getCurrentUser()?.uid || 'demo-farmer', serviceType: 'Soil Testing', name: document.getElementById('farmSoilTestType').value, crop: document.getElementById('farmSoilCrop').value, farmArea: Number(document.getElementById('farmSoilArea').value), location: document.getElementById('farmSoilLocation').value, testType: document.getElementById('farmSoilTestType').value, preferredDate: document.getElementById('farmSoilDate').value, status: 'Requested', requestDate: new Date().toISOString().slice(0, 10), createdAt: new Date().toISOString() }, 'soilTestRequests'); document.getElementById('soilSuccess').classList.remove('hidden'); event.currentTarget.reset(); });
    document.getElementById('storageQuantity')?.addEventListener('input', () => { const item = storageData.find((storage) => storage.type === document.getElementById('storageRequestType').value) || storageData[0]; const start = document.getElementById('storageStart').value; const end = document.getElementById('storageEnd').value; if (start && end && dateDifference(start, end) > 0) document.getElementById('storageEstimate').textContent = 'Prototype Estimate: ₹' + (Math.max(0, Number(document.getElementById('storageQuantity').value) || 0) * item.price * dateDifference(start, end)).toLocaleString('en-IN') + '. Not a confirmed quotation.'; });
    document.getElementById('storageForm')?.addEventListener('submit', async (event) => { event.preventDefault(); if (!event.currentTarget.reportValidity()) return; const start = document.getElementById('storageStart').value; const end = document.getElementById('storageEnd').value; const quantity = Number(document.getElementById('storageQuantity').value); const error = document.getElementById('storageError'); if (!quantity || dateDifference(start, end) <= 0) { error.textContent = 'Enter a valid quantity and ensure the end date is after the start date.'; return; } error.textContent = ''; const item = storageData.find((storage) => storage.type === document.getElementById('storageRequestType').value) || storageData[0]; const estimatedCost = quantity * item.price * dateDifference(start, end); document.getElementById('storageEstimate').textContent = 'Prototype Estimate: ₹' + estimatedCost.toLocaleString('en-IN') + '. Not a confirmed quotation.'; await saveFarmRequest({ requestId: 'storage-' + Date.now(), farmerId: getCurrentUser()?.uid || 'demo-farmer', serviceType: 'Storage', name: item.name, crop: document.getElementById('storageCrop').value, quantity, unit: document.getElementById('storageUnit').value, storageType: item.type, startDate: start, endDate: end, location: document.getElementById('storageRequestLocation').value, estimatedCost, status: 'Storage Requested', requestDate: new Date().toISOString().slice(0, 10), createdAt: new Date().toISOString() }, 'storageRequests'); event.currentTarget.reset(); });
    document.querySelectorAll('[data-request-tab]').forEach((tab) => tab.addEventListener('click', () => { document.querySelectorAll('[data-request-tab]').forEach((item) => item.classList.toggle('active', item === tab)); renderFarmRequests(tab.dataset.requestTab); }));
    document.getElementById('soilReportUpload')?.addEventListener('change', (event) => { if (event.target.files[0]) alert('Demo upload selected. Report storage will be connected to Firebase in a future version.'); });

    const chatMessages = [];
    const assistantHistory = JSON.parse(localStorage.getItem('agrione-assistant-history') || '[]');
    let assistantContext = { language: getLanguage() };
    const assistantActions = (action) => { if (!action) return ''; const button = document.createElement('button'); button.className = 'assistant-action'; button.type = 'button'; button.textContent = action[0]; button.dataset.target = action[1]; return button; };
    const renderChat = () => { const target = document.getElementById('chatMessages'); if (!target) return; target.innerHTML = ''; chatMessages.forEach((message) => { const item = document.createElement('div'); item.className = 'chat-message ' + message.role; const bubble = document.createElement('p'); bubble.textContent = message.text; item.appendChild(bubble); if (message.action) item.appendChild(assistantActions(message.action)); if (message.role === 'assistant') { const label = document.createElement('small'); label.textContent = 'DEMO AI · Prototype guidance'; item.appendChild(label); } target.appendChild(item); }); target.scrollTop = target.scrollHeight; };
    const renderQuickQuestions = (category = 'Crop Health') => { const target = document.getElementById('quickQuestions'); if (!target) return; const quickQuestions = getAssistantQuestions(assistantContext.language); target.innerHTML = (quickQuestions[category] || quickQuestions['General Farming']).map((question) => '<button type="button" data-quick-question="' + question.replaceAll('"', '&quot;') + '">' + question + '</button>').join(''); };
    const renderAssistantHistory = () => { const target = document.getElementById('assistantHistoryList'); target.innerHTML = assistantHistory.length ? assistantHistory.map((chat, index) => '<button type="button" class="history-item" data-history-index="' + index + '">' + (chat.messages.find((message) => message.role === 'user')?.text || 'Untitled chat').slice(0, 55) + '</button>').join('') : '<p class="panel-caption">No saved demo chats yet.</p>'; };
    const saveAssistantHistory = async () => { if (!chatMessages.length) return; const record = { chatId: 'chat-' + Date.now(), farmerId: getCurrentUser()?.uid || 'demo-farmer', messages: chatMessages, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }; assistantHistory.unshift(record); assistantHistory.splice(8); localStorage.setItem('agrione-assistant-history', JSON.stringify(assistantHistory)); renderAssistantHistory(); if (firebaseStatus.configured) { try { await saveFarmerCollection('assistantChats', record); } catch { } } };
    const sendAssistantMessage = async (text) => { const message = text.trim(); if (!message) { document.getElementById('assistantError').textContent = 'Enter a question before sending.'; return; } chatMessages.push({ role: 'user', text: message }); renderChat(); document.getElementById('typingIndicator').classList.remove('hidden'); document.getElementById('assistantInput').value = ''; const response = await getAssistantResponse(message, assistantContext); document.getElementById('typingIndicator').classList.add('hidden'); const disclaimer = response.disclaimer || SAFETY; chatMessages.push({ role: 'assistant', text: response.text.includes(disclaimer) ? response.text : response.text + '\n\n' + disclaimer, action: response.action }); renderChat(); await saveAssistantHistory(); document.getElementById('aiQuestionCount').textContent = String(Number(document.getElementById('aiQuestionCount').textContent) + 1); document.getElementById('aiConversationCount').textContent = String(assistantHistory.length); if (response.category === 'Crop Health') document.getElementById('aiDiseaseCount').textContent = String(Number(document.getElementById('aiDiseaseCount').textContent) + 1); if (response.category === 'Weather') document.getElementById('aiWeatherCount').textContent = String(Number(document.getElementById('aiWeatherCount').textContent) + 1); if (response.category === 'Market') document.getElementById('aiMarketCount').textContent = String(Number(document.getElementById('aiMarketCount').textContent) + 1); };
    chatMessages.push({ role: 'assistant', text: 'Hello. Ask me about crops, weather, markets or farm services. I provide preliminary prototype guidance only.\n\n' + SAFETY }); renderChat(); renderQuickQuestions(); renderAssistantHistory();
    document.getElementById('assistantChatForm')?.addEventListener('submit', (event) => { event.preventDefault(); sendAssistantMessage(document.getElementById('assistantInput').value); });
    document.getElementById('quickQuestions')?.addEventListener('click', (event) => { const question = event.target.dataset.quickQuestion; if (question) sendAssistantMessage(question); });
    document.getElementById('assistantCategories')?.addEventListener('click', (event) => { const button = event.target.closest('[data-ai-category]'); if (!button) return; document.querySelectorAll('[data-ai-category]').forEach((item) => item.classList.toggle('active', item === button)); renderQuickQuestions(button.dataset.aiCategory); });
    document.getElementById('assistantLanguage')?.addEventListener('change', (event) => { assistantContext.language = event.target.value; changeAppLanguage(event.target.value); renderQuickQuestions(document.querySelector('[data-ai-category].active')?.dataset.aiCategory); });
    document.addEventListener('languagechange', () => { if (typeof assistantContext !== 'undefined') { assistantContext.language = getLanguage(); renderQuickQuestions(document.querySelector('[data-ai-category].active')?.dataset.aiCategory); } });
    document.getElementById('clearAssistantChat')?.addEventListener('click', () => { chatMessages.splice(0, chatMessages.length, { role: 'assistant', text: 'Chat cleared. Ask a new farming question.\n\n' + SAFETY }); renderChat(); });
    document.getElementById('newAssistantChat')?.addEventListener('click', () => { chatMessages.splice(0, chatMessages.length, { role: 'assistant', text: 'New chat started. How can I help with your farm today?\n\n' + SAFETY }); renderChat(); });
    document.getElementById('deleteAssistantHistory')?.addEventListener('click', () => { assistantHistory.splice(0); localStorage.removeItem('agrione-assistant-history'); renderAssistantHistory(); });
    document.getElementById('assistantHistoryList')?.addEventListener('click', (event) => { const chat = assistantHistory[Number(event.target.dataset.historyIndex)]; if (chat) { chatMessages.splice(0, chatMessages.length, ...chat.messages); renderChat(); } });
    document.getElementById('chatMessages')?.addEventListener('click', (event) => { const action = event.target.closest('.assistant-action'); if (action) document.querySelector(action.dataset.target)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
    document.getElementById('floatingAiButton')?.addEventListener('click', () => document.getElementById('ai-assistant')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    document.getElementById('voiceInputButton')?.addEventListener('click', () => { const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition; if (!Recognition) { document.getElementById('assistantError').textContent = t('voice.unsupported'); return; } const recognition = new Recognition(); recognition.lang = speechLanguage(); recognition.onresult = (event) => { document.getElementById('assistantInput').value = event.results[0][0].transcript; }; recognition.onerror = () => { document.getElementById('assistantError').textContent = 'Voice input could not be captured. You can type your question instead.'; }; recognition.start(); });

    let marketPrices = [];
    let marketComparison = [];
    const watchlist = JSON.parse(localStorage.getItem('agrione-market-watchlist') || '[]');
    const priceAlerts = JSON.parse(localStorage.getItem('agrione-price-alerts') || '[]');
    const renderMarketPrices = () => {
        const query = (document.getElementById('marketSearch')?.value || '').toLowerCase();
        const crop = document.getElementById('marketCropSelector')?.value || 'All crops';
        const location = document.getElementById('marketLocationSelector')?.value || 'All locations';
        const market = document.getElementById('marketNameSelector')?.value || 'All markets';
        const filtered = marketPrices.filter((item) => (crop === 'All crops' || item.crop === crop) && (location === 'All locations' || item.location === location) && (market === 'All markets' || item.market === market) && (!query || (item.crop + item.market + item.location).toLowerCase().includes(query)));
        document.getElementById('marketPriceCards').innerHTML = filtered.map((item) => '<article class="market-intel-card"><div class="market-card-top"><span class="crop-label">' + item.crop + '</span><span class="trend-pill ' + (item.trend.startsWith('+') ? 'up' : 'down') + '">' + item.trend + '</span></div><strong>₹' + item.price + ' / ' + item.unit + '</strong><p>' + item.market + ' · ' + item.location + '</p><small>Last updated: ' + item.lastUpdated + ' · Demo Price</small><div class="market-card-actions"><button class="mini-btn" type="button" data-market-action="sell" data-crop="' + item.crop + '">Sell This Crop</button><button class="mini-btn" type="button" data-market-action="buyers" data-crop="' + item.crop + '">View Buyers</button></div></article>').join('');
    };
    const renderComparison = () => {
        const sort = document.getElementById('comparisonSort')?.value || 'price';
        const data = [...marketComparison].sort((a, b) => sort === 'distance' ? a.distance - b.distance : sort === 'value' ? (b.price - b.distance * .05) - (a.price - a.distance * .05) : b.price - a.price);
        document.getElementById('comparisonBody').innerHTML = data.map((item) => '<tr><td>' + item.market + '</td><td>' + item.crop + '</td><td>₹' + item.price + '/kg · demo</td><td>' + item.distance + ' km</td><td class="trend ' + (item.trend.startsWith('+') ? 'up' : 'down') + '">' + item.trend + '</td><td>' + item.lastUpdated + '</td></tr>').join('');
        const best = data[0];
        document.getElementById('sellingDecision').innerHTML = best ? ['Market A', 'Market B'].map((label, index) => { const item = data[index] || best; const transport = Math.round(item.distance * .05 * 100) / 100; const net = Math.max(0, item.price - transport); return '<div class="decision-option ' + (index === 0 ? 'best-option' : '') + '"><span>' + label + (index === 0 ? ' · Estimated Best Option' : '') + '</span><strong>₹' + item.price + '/kg</strong><p>' + item.market + ' · ' + item.distance + ' km</p><p>Estimated transport: ₹' + transport + '/kg</p><b>Estimated net amount: ₹' + net + '/kg</b></div>'; }).join('') : '<p class="panel-caption">No comparison data available.</p>';
    };
    const renderTrend = async () => { const trend = await getMarketTrend(document.getElementById('trendRange').value); document.getElementById('marketTrendChart').innerHTML = trend.values.map((value, index) => '<span style="height:' + value + '%" title="Prototype value ' + value + '"><small>' + (index + 1) + '</small></span>').join(''); };
    const renderWatchlist = () => { document.getElementById('watchlistItems').innerHTML = watchlist.length ? watchlist.map((crop) => { const item = marketPrices.find((market) => market.crop === crop); return '<div class="watch-item"><div><strong>' + crop + '</strong><span>₹' + item.price + '/kg · ' + item.trend + '</span></div><button class="mini-btn" type="button" data-remove-watch="' + crop + '">Remove</button></div>'; }).join('') : '<p class="panel-caption">No crops added to your watchlist.</p>'; document.getElementById('adminWatchlistCount').textContent = String(watchlist.length); };
    const renderPriceAlerts = () => { document.getElementById('priceAlertItems').innerHTML = priceAlerts.map((alert) => '<p class="watch-item"><span>' + alert.crop + ' at ₹' + alert.target + '/kg</span><b>Prototype Price Alert</b></p>').join(''); document.getElementById('adminPriceAlertCount').textContent = String(priceAlerts.length); };
    const safeNumber = (id) => Math.max(0, Number(document.getElementById(id).value) || 0);
    const renderMarket = async () => { const prices = await getMarketPrices(); const comparisons = await getMarketComparison(); marketPrices = prices.data || []; marketComparison = comparisons.data || []; document.getElementById('marketStatus').textContent = prices.mode === 'live' ? 'Live market source connected. Verify the provider before making selling decisions.' : prices.fallbackReason ? 'Demo Mode — Live market data was unavailable. Market prices and insights shown here are prototype data and are not live verified prices.' : 'Market prices and insights shown here are prototype data and are not live verified prices.'; document.getElementById('topMarketInsight').textContent = marketPrices[0] ? marketPrices[0].crop + ' shows a prototype change of ' + marketPrices[0].trend + ' at ' + marketPrices[0].market + '.' : 'No market insight is available.'; renderMarketPrices(); renderComparison(); renderWatchlist(); renderPriceAlerts(); await renderTrend(); };
    renderMarket();
    document.querySelectorAll('#marketCropSelector, #marketLocationSelector, #marketNameSelector, #marketDateSelector, #marketSearch').forEach((control) => control.addEventListener(control.tagName === 'INPUT' ? 'input' : 'change', renderMarketPrices));
    document.getElementById('comparisonSort')?.addEventListener('change', renderComparison);
    document.getElementById('trendRange')?.addEventListener('change', renderTrend);
    document.getElementById('marketPriceCards')?.addEventListener('click', (event) => { const button = event.target.closest('[data-market-action]'); if (!button) return; const crop = button.dataset.crop; if (button.dataset.marketAction === 'sell') { document.getElementById('marketCropName').value = crop; document.getElementById('sell-market')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); } else document.getElementById('farmer-marketplace')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
    document.getElementById('profitForm')?.addEventListener('submit', (event) => { event.preventDefault(); if (!event.currentTarget.reportValidity()) return; const revenue = safeNumber('profitYield') * safeNumber('profitPrice'); const expenses = ['seedCost', 'fertilizerCost', 'inputCost', 'labourCost', 'irrigationCost', 'profitTransport', 'otherCost'].reduce((total, id) => total + safeNumber(id), 0); const profit = revenue - expenses; const area = safeNumber('profitArea'); document.getElementById('profitError').textContent = revenue === 0 ? 'Enter an expected yield and selling price greater than zero.' : ''; document.getElementById('profitResults').innerHTML = [['Total Production', safeNumber('profitYield') + ' kg'], ['Total Revenue', '₹' + revenue.toFixed(2)], ['Total Expenses', '₹' + expenses.toFixed(2)], ['Estimated Profit', '₹' + profit.toFixed(2)], ['Profit per Acre', '₹' + (area ? (profit / area).toFixed(2) : '0.00')], ['Profit Margin', (revenue ? Math.max(-100, (profit / revenue) * 100) : 0).toFixed(1) + '%']].map(([label, value]) => '<div><span>' + label + '</span><strong>' + value + '</strong></div>').join(''); });
    document.getElementById('harvestForm')?.addEventListener('submit', (event) => { event.preventDefault(); if (!event.currentTarget.reportValidity()) return; const yieldTotal = safeNumber('harvestArea') * safeNumber('harvestYield'); document.getElementById('harvestResults').innerHTML = '<div><span>Estimated Total Yield</span><strong>' + yieldTotal.toFixed(2) + ' kg</strong></div><div><span>Estimated Revenue</span><strong>₹' + (yieldTotal * safeNumber('harvestPrice')).toFixed(2) + '</strong></div>'; });
    document.getElementById('transportForm')?.addEventListener('submit', (event) => { event.preventDefault(); if (!event.currentTarget.reportValidity()) return; const cost = safeNumber('transportDistance') * safeNumber('transportRate') * Math.max(1, safeNumber('transportQuantity') / 1000); document.getElementById('transportResults').innerHTML = '<div><span>Estimated Transport Cost</span><strong>₹' + cost.toFixed(2) + '</strong></div>'; });
    document.getElementById('watchlistForm')?.addEventListener('submit', async (event) => { event.preventDefault(); const crop = document.getElementById('watchCrop').value; if (!watchlist.includes(crop)) watchlist.push(crop); localStorage.setItem('agrione-market-watchlist', JSON.stringify(watchlist)); if (firebaseStatus.configured) { try { await saveFarmerCollection('marketWatchlist', { crop, mode: 'demo' }); } catch { } } renderWatchlist(); });
    document.getElementById('watchlistItems')?.addEventListener('click', (event) => { const crop = event.target.dataset.removeWatch; if (!crop) return; watchlist.splice(watchlist.indexOf(crop), 1); localStorage.setItem('agrione-market-watchlist', JSON.stringify(watchlist)); renderWatchlist(); });
    document.getElementById('priceAlertForm')?.addEventListener('submit', async (event) => { event.preventDefault(); if (!event.currentTarget.reportValidity()) return; const alertData = { crop: document.getElementById('alertCrop').value, target: safeNumber('alertTarget'), mode: 'demo' }; priceAlerts.push(alertData); localStorage.setItem('agrione-price-alerts', JSON.stringify(priceAlerts)); if (firebaseStatus.configured) { try { await saveFarmerCollection('priceAlerts', alertData); } catch { } } renderPriceAlerts(); event.currentTarget.reset(); });

    document.querySelectorAll('#cropFilter, #locationFilter, #marketFilter').forEach((filter) => {
        filter.addEventListener('change', () => {
            const crop = document.getElementById('cropFilter').value;
            const location = document.getElementById('locationFilter').value;
            const market = document.getElementById('marketFilter').value;
            document.querySelectorAll('#analyticsTableBody tr').forEach((row) => {
                const cropMatches = crop === 'all' || row.dataset.crop === crop;
                const locationMatches = location === 'all' || row.dataset.location === location;
                const marketMatches = market === 'all' || row.dataset.market === market;
                row.style.display = cropMatches && locationMatches && marketMatches ? '' : 'none';
            });
        });
    });

    document.getElementById('resetMarketFilters')?.addEventListener('click', () => {
        document.getElementById('cropFilter').value = 'all';
        document.getElementById('locationFilter').value = 'all';
        document.getElementById('marketFilter').value = 'all';
        document.querySelectorAll('#analyticsTableBody tr').forEach((row) => { row.style.display = ''; });
    });

    document.getElementById('marketDetailsButton')?.addEventListener('click', () => {
        alert('Demo market details: Kolar has the highest sample Tomato price at ₹1,620/Q.');
    });

    document.getElementById('demoFarmerButton')?.addEventListener('click', () => {
        closeAuth();
        document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    document.getElementById('loginForm')?.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (!event.currentTarget.reportValidity()) return;
        const message = document.getElementById('loginMessage');
        try {
            if (firebaseStatus.configured) await signIn(document.getElementById('loginIdentity').value.trim(), document.getElementById('loginPassword').value);
            message.textContent = firebaseStatus.configured ? 'Login successful. Welcome back, Farmer!' : 'Demo login successful. Welcome back, Farmer!';
        } catch {
            message.textContent = 'We could not sign you in. Check your email and password and try again.';
            message.classList.remove('hidden');
            return;
        }
        message.classList.remove('hidden');
        setTimeout(() => {
            closeAuth();
            document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 650);
    });

    document.getElementById('signupForm')?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        if (!form.reportValidity()) return;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('signupConfirmPassword').value;
        const message = document.getElementById('signupMessage');
        if (password !== confirmPassword) {
            message.textContent = 'Passwords do not match.';
            message.classList.remove('hidden');
            return;
        }
        try {
            if (firebaseStatus.configured) await signUp({ fullName: document.getElementById('signupName').value.trim(), mobile: document.getElementById('signupMobile').value.trim(), email: document.getElementById('signupEmail').value.trim(), village: document.getElementById('signupVillage').value.trim(), district: document.getElementById('signupDistrict').value.trim(), state: document.getElementById('signupState').value.trim(), mainCrop: document.getElementById('signupMainCrop').value.trim(), farmSize: document.getElementById('signupFarmSize').value.trim() }, password);
            message.textContent = firebaseStatus.configured ? 'Account created and farmer profile saved.' : 'Account created in Demo Mode. You can now use your demo dashboard.';
        } catch {
            message.textContent = 'We could not create the account. Please check the details and try again.';
            message.classList.remove('hidden');
            return;
        }
        message.classList.remove('hidden');
        form.reset();
    });

    document.getElementById('forgotForm')?.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (!event.currentTarget.reportValidity()) return;
        const message = document.getElementById('forgotMessage');
        try {
            if (firebaseStatus.configured) await resetPassword(document.getElementById('forgotIdentity').value.trim());
            message.textContent = firebaseStatus.configured ? 'Password reset email sent.' : 'A demo password reset link has been sent.';
        } catch {
            message.textContent = 'We could not send a reset email. Please check the address and try again.';
        }
        message.classList.remove('hidden');
        event.currentTarget.reset();
    });

    document.getElementById('logoutButton')?.addEventListener('click', async () => { await signOutUser(); closeAuth(); });
    observeAuth(async (user) => {
        document.querySelectorAll('.auth-user-name').forEach((item) => { item.textContent = user?.email || 'Farmer'; });
        if (user) {
            const profile = await getFarmerProfile();
            if (profile?.farmLocation) {
                Object.entries(profile.farmLocation).forEach(([key, value]) => { if (locationInputs[key] && value) locationInputs[key].value = value; });
                localStorage.setItem('agrione-weather-location', JSON.stringify(profile.farmLocation));
                document.getElementById('nearbyLocationName').textContent = formatLocation(profile.farmLocation);
                loadWeather(profile.farmLocation);
            }
            if (typeof assistantContext !== 'undefined') assistantContext = { ...assistantContext, mainCrop: profile?.mainCrop, farmArea: profile?.farmSize, village: profile?.village, district: profile?.district, state: profile?.state };
            if (profile?.preferredLanguage) changeAppLanguage(profile.preferredLanguage);
        }
    });

    document.getElementById('activityDate')?.setAttribute('min', new Date().toISOString().slice(0, 10));
    document.getElementById('activityForm')?.addEventListener('submit', (event) => {
        event.preventDefault();
        const activity = document.getElementById('activityType').value;
        const date = document.getElementById('activityDate').value;
        const warning = document.getElementById('plannerWarning');
        const risky = latestWeather && ((activity === 'Spraying' && latestWeather.current.wind >= 20) || (activity === 'Irrigation' && latestWeather.current.rain >= 50));
        warning.textContent = risky ? 'Weather-based warning: conditions may be unsuitable. Review local field conditions before proceeding.' : 'Weather check: no prototype warning for this activity. Confirm conditions on the day.';
        const planned = document.createElement('p');
        planned.textContent = activity + ' · ' + date;
        document.getElementById('plannedActivities').appendChild(planned);
        event.currentTarget.reset();
    });

    document.querySelectorAll('[data-target]').forEach((button) => {
        button.addEventListener('click', () => {
            const target = button.getAttribute('data-target');
            if (!target) return;
            const targetElement = document.querySelector(target);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    const showDiseaseError = (message) => { if (diseaseError) { diseaseError.textContent = message; diseaseError.classList.remove('hidden'); } };
    const clearDiseaseError = () => diseaseError?.classList.add('hidden');
    const previewDiseaseImage = (file) => {
        clearDiseaseError();
        if (!file) return;
        if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) { showDiseaseError('Please choose a JPG, JPEG, or PNG image.'); imageInput.value = ''; return; }
        if (file.size > 8 * 1024 * 1024) { showDiseaseError('That image is larger than 8 MB. Please choose a smaller crop photo.'); imageInput.value = ''; return; }
        const reader = new FileReader();
        reader.onload = (event) => { previewImage.src = event.target.result; previewBox.style.display = 'block'; removeImageButton?.classList.remove('hidden'); };
        reader.onerror = () => showDiseaseError('We could not read that image. Please try another file.');
        reader.readAsDataURL(file);
    };
    imageInput?.addEventListener('change', (event) => previewDiseaseImage(event.target.files?.[0]));
    diseaseDropZone?.addEventListener('dragover', (event) => { event.preventDefault(); diseaseDropZone.classList.add('drag-active'); });
    diseaseDropZone?.addEventListener('dragleave', () => diseaseDropZone.classList.remove('drag-active'));
    diseaseDropZone?.addEventListener('drop', (event) => { event.preventDefault(); diseaseDropZone.classList.remove('drag-active'); const file = event.dataTransfer.files?.[0]; if (file && imageInput) { const transfer = new DataTransfer(); transfer.items.add(file); imageInput.files = transfer.files; previewDiseaseImage(file); } });
    removeImageButton?.addEventListener('click', () => { if (imageInput) imageInput.value = ''; previewImage.src = ''; previewBox.style.display = 'none'; removeImageButton.classList.add('hidden'); resultContent?.classList.add('hidden'); clearDiseaseError(); });

    if (marketImageInput) {
        marketImageInput.addEventListener('change', (event) => {
            const file = event.target.files && event.target.files[0];
            if (!file) return;

            const isValidImage = ['image/jpeg', 'image/jpg', 'image/png'].includes(file.type);
            if (!isValidImage) {
                alert('Please upload a JPG, JPEG, or PNG image for your crop listing.');
                marketImageInput.value = '';
                if (marketPreviewBox) {
                    marketPreviewBox.style.display = 'none';
                }
                return;
            }

            const reader = new FileReader();
            reader.onload = function (e) {
                if (marketPreviewImage) {
                    marketPreviewImage.src = e.target.result;
                }
                if (marketPreviewBox) {
                    marketPreviewBox.style.display = 'block';
                }
            };
            reader.readAsDataURL(file);
        });
    }

    if (detectButton) {
        detectButton.addEventListener('click', async () => {
            const file = imageInput?.files?.[0];
            clearDiseaseError();
            if (!file) { showDiseaseError('Please upload a crop image before analyzing.'); return; }
            detectButton.disabled = true;
            analysisLoading?.classList.remove('hidden');
            try {
                const result = await analyzeCropImage(file);
                cropResult.textContent = result.crop;
                diseaseName.textContent = result.possibleIssue;
                confidenceValue.textContent = result.prototypeConfidence;
                symptomsValue.innerHTML = result.symptoms.map((symptom) => '<li>' + symptom + '</li>').join('');
                treatmentValue.innerHTML = result.guidance.map((item) => '<li>' + item + '</li>').join('');
                preventionValue.textContent = 'Review field conditions regularly and confirm any treatment plan with a qualified agricultural expert.';
                resultContent.classList.remove('hidden');
                resultContent.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            } catch (error) {
                const messages = { INVALID_FILE: 'Please upload a JPG, JPEG, or PNG image.', IMAGE_TOO_LARGE: 'That image is too large. Please choose a file under 8 MB.', NO_IMAGE: 'Please upload a crop image before analyzing.' };
                showDiseaseError(messages[error.message] || 'Analysis could not be completed. Please try again.');
            } finally {
                detectButton.disabled = false;
                analysisLoading?.classList.add('hidden');
            }
        });
    }

    document.querySelectorAll('[data-product]').forEach((button) => {
        button.addEventListener('click', () => {
            const product = button.getAttribute('data-product') || 'product';
            const action = button.textContent.trim();
            alert(action + ': ' + product + ' selected for the demo product catalogue.');
        });
    });

    if (demoOrderForm) {
        demoOrderForm.addEventListener('submit', (event) => {
            event.preventDefault();
            if (!demoOrderForm.reportValidity()) {
                return;
            }

            orderMessage.classList.remove('hidden');
            orderMessage.textContent = 'Demo order placed successfully.';
            demoOrderForm.reset();
            orderMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
    }

    if (dashboardSellForm) {
        dashboardSellForm.addEventListener('submit', (event) => {
            event.preventDefault();
            if (!dashboardSellForm.reportValidity()) {
                return;
            }

            alert('Prototype crop listing posted successfully. Buyers can review your listing in the demo dashboard.');
            dashboardSellForm.reset();
        });
    }

    document.querySelectorAll('[data-request]').forEach((button) => {
        button.addEventListener('click', async () => {
            const item = button.getAttribute('data-request') || 'service';
            const request = { serviceId: item.toLowerCase().replaceAll(' ', '-'), serviceType: 'Equipment Rental', location: formatLocation(JSON.parse(localStorage.getItem('agrione-weather-location') || '{}')), requestDate: new Date().toISOString().slice(0, 10), status: 'Requested' };
            if (firebaseStatus.configured) { try { await saveFarmerCollection('equipmentRequests', request); } catch { } }
            alert('Prototype equipment request created with status Requested for ' + item + '.');
        });
    });

    document.getElementById('sellForm')?.addEventListener('submit', (event) => {
        event.preventDefault();
        const crop = document.getElementById('cropName')?.value || 'Crop';
        alert('Prototype listing posted for ' + crop + '. Market buyers can view the listing in the demo dashboard.');
        event.currentTarget.reset();
    });

    if (farmerSellForm) {
        farmerSellForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (!farmerSellForm.reportValidity()) {
                return;
            }

            if (marketSuccessMessage) {
                marketSuccessMessage.classList.remove('hidden');
            }

            if (marketImageInput) {
                marketImageInput.value = '';
            }
            if (marketPreviewBox) {
                marketPreviewBox.style.display = 'none';
            }
            if (marketPreviewImage) {
                marketPreviewImage.src = '';
            }

            if (firebaseStatus.configured) {
                try { await saveFarmerCollection('crops', { cropName: document.getElementById('marketCropName').value, quantity: Number(document.getElementById('marketQuantity').value), unit: 'kg', price: Number(document.getElementById('marketPricePerKg').value), location: document.getElementById('marketLocation').value, farmerName: document.getElementById('marketFarmerName').value, status: 'available' }); } catch { alert('Your crop was kept in the demo form. Firebase could not save it right now.'); }
            }

            farmerSellForm.reset();
            marketSuccessMessage?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
    }

    document.getElementById('soilForm')?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const crop = document.getElementById('soilCrop')?.value || 'Crop';
        if (firebaseStatus.configured) { try { await saveFarmerCollection('soilTestRequests', { serviceId: 'soilcare-field-lab', serviceType: 'Soil Testing', farmLocation: document.getElementById('soilLocation').value, crop, soilType: document.getElementById('soilType').value, contactNumber: '', preferredDate: '', requestDate: new Date().toISOString().slice(0, 10), status: 'Requested' }); } catch { alert('The soil request is available in demo mode while Firebase reconnects.'); } }
        alert('Prototype soil test request created with status Requested for ' + crop + '.');
        event.currentTarget.reset();
    });

    const renderDiseaseReports = () => {
        if (!diseaseReportList) return;
        const reports = getDiseaseReports();
        document.getElementById('emptyReportState')?.classList.toggle('hidden', reports.length > 0);
        diseaseReportList.querySelectorAll('.saved-report').forEach((report) => report.remove());
        reports.forEach((report) => {
            const item = document.createElement('article');
            item.className = 'saved-report';
            item.innerHTML = '<div><span>' + report.date + '</span><strong>' + report.crop + '</strong></div><div><span>Possible issue</span><strong>' + report.possibleIssue + '</strong></div><div><span>Prototype confidence</span><strong>' + report.prototypeConfidence + '</strong></div><span class="report-status">' + report.status + '</span><button class="mini-btn" type="button">View Report</button>';
            item.querySelector('button').addEventListener('click', () => { cropResult.textContent = report.crop; diseaseName.textContent = report.possibleIssue; confidenceValue.textContent = report.prototypeConfidence; resultContent.classList.remove('hidden'); resultContent.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); });
            diseaseReportList.appendChild(item);
        });
        const adminTotal = document.getElementById('adminReportTotal');
        if (adminTotal) adminTotal.textContent = String(12 + reports.length);
    };
    document.getElementById('saveDiseaseReportButton')?.addEventListener('click', async () => {
        const reportData = { imageName: imageInput?.files?.[0]?.name || 'demo-crop-image', cropName: cropResult.textContent, possibleDisease: diseaseName.textContent, confidence: confidenceValue.textContent, symptoms: [...symptomsValue.querySelectorAll('li')].map((item) => item.textContent), guidance: [...treatmentValue.querySelectorAll('li')].map((item) => item.textContent), mode: 'demo' };
        saveDiseaseReport({ crop: reportData.cropName, possibleIssue: reportData.possibleDisease, prototypeConfidence: reportData.confidence, symptoms: reportData.symptoms, guidance: reportData.guidance });
        if (firebaseStatus.configured) { try { await saveFarmerCollection('diseaseReports', reportData); } catch { showDiseaseError('Report saved locally. The Firebase connection is temporarily unavailable.'); } }
        renderDiseaseReports();
        const button = document.getElementById('saveDiseaseReportButton');
        button.textContent = 'Report Saved'; button.disabled = true;
        setTimeout(() => { button.textContent = 'Save Report'; button.disabled = false; }, 1600);
    });
    document.getElementById('analyzeAnotherButton')?.addEventListener('click', () => removeImageButton?.click());
    document.getElementById('treatmentGuidanceButton')?.addEventListener('click', () => document.getElementById('treatmentValue')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }));
    document.getElementById('recommendedProductsButton')?.addEventListener('click', () => document.querySelector('.product-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    renderDiseaseReports();

    const marketplaceListings = [
        { id: 1, crop: 'Tomato', category: 'Vegetables', quantity: 420, price: 42, location: 'Guntur', farmer: 'Ravi Kumar', harvest: '12 Sep 2026', quality: 'Grade A · 9/10', status: 'Available', image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=900&q=80', description: 'Firm, bright tomatoes harvested at peak colour. Packed in ventilated crates and ready for local dispatch.' },
        { id: 2, crop: 'Paddy', category: 'Grains', quantity: 850, price: 31, location: 'Kurnool', farmer: 'Lakshmi Devi', harvest: '02 Sep 2026', quality: 'Moisture 13% · 8/10', status: 'Available', image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=900&q=80', description: 'Clean, sun-dried paddy from the current harvest with consistent grain size for milling.' },
        { id: 3, crop: 'Red Chilli', category: 'Spices', quantity: 180, price: 96, location: 'Warangal', farmer: 'Suresh Naik', harvest: '28 Aug 2026', quality: 'Teja variety · 9/10', status: 'Available', image: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=900&q=80', description: 'Deep red Teja chilli with strong colour and medium heat. Suitable for spice processors.' },
        { id: 4, crop: 'Banana', category: 'Fruits', quantity: 300, price: 38, location: 'Hassan', farmer: 'Meera Gowda', harvest: '14 Sep 2026', quality: 'Fresh bunches · 8/10', status: 'Available', image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=900&q=80', description: 'Freshly cut banana bunches with planned staggered delivery for retailers and food businesses.' }
    ];
    const listingContainer = document.getElementById('cropListings');
    const detailModal = document.getElementById('cropDetailModal');
    let selectedListing = null;

    const renderListings = () => {
        if (!listingContainer) return;
        const query = (document.getElementById('marketplaceSearch')?.value || '').trim().toLowerCase();
        const category = document.getElementById('marketplaceCategory')?.value || 'all';
        const location = document.getElementById('marketplaceLocation')?.value || 'all';
        const priceRange = document.getElementById('marketplacePrice')?.value || 'all';
        const sort = document.getElementById('marketplaceSort')?.value || 'recent';
        const filtered = marketplaceListings.filter((listing) => {
            const matchesQuery = !query || (listing.crop + listing.farmer + listing.location).toLowerCase().includes(query);
            const matchesCategory = category === 'all' || listing.category === category;
            const matchesLocation = location === 'all' || listing.location === location;
            const [min, max] = priceRange === 'all' ? [0, Infinity] : priceRange.split('-').map(Number);
            return matchesQuery && matchesCategory && matchesLocation && listing.price >= min && listing.price <= max;
        }).sort((first, second) => sort === 'price-low' ? first.price - second.price : sort === 'price-high' ? second.price - first.price : sort === 'quantity' ? second.quantity - first.quantity : first.id - second.id);
        listingContainer.innerHTML = filtered.map((listing, index) => `<article class="crop-listing-card" style="animation-delay:${index * 60}ms"><img src="${listing.image}" alt="${listing.crop} crop listing" loading="lazy"><div class="crop-listing-content"><div class="listing-card-top"><h4>${listing.crop}</h4><span class="listing-status">${listing.status}</span></div><div class="listing-card-price">₹${listing.price.toLocaleString('en-IN')} <small>/ kg · sample</small></div><div class="listing-card-meta"><span>◉ ${listing.quantity} kg</span><span>⌖ ${listing.location}</span></div><div class="listing-farmer"><span>👨‍🌾</span><span>${listing.farmer} <small>· badge prototype</small></span></div><button class="primary-btn full-width-btn" type="button" data-crop-id="${listing.id}">View Details</button></div></article>`).join('');
        document.getElementById('emptyMarket')?.classList.toggle('hidden', filtered.length > 0);
        listingContainer.querySelectorAll('[data-crop-id]').forEach((button) => button.addEventListener('click', () => openCropDetails(Number(button.dataset.cropId))));
    };
    const showModalView = (viewId) => {
        ['cropDetailView', 'enquiryView', 'orderView', 'confirmedView'].forEach((id) => document.getElementById(id)?.classList.toggle('hidden', id !== viewId));
    };
    const openCropDetails = (id) => {
        selectedListing = marketplaceListings.find((listing) => listing.id === id);
        if (!selectedListing || !detailModal) return;
        document.getElementById('detailCropImage').src = selectedListing.image;
        document.getElementById('detailCropImage').alt = selectedListing.crop + ' crop';
        document.getElementById('detailCropName').textContent = selectedListing.crop;
        document.getElementById('detailCropSummary').textContent = selectedListing.quantity + ' kg available · ' + selectedListing.location + ' · ' + selectedListing.farmer;
        document.getElementById('detailCropFacts').innerHTML = `<div><span>Expected price</span><strong>₹${selectedListing.price}/kg · demo</strong></div><div><span>Harvest date</span><strong>${selectedListing.harvest}</strong></div><div><span>Quality</span><strong>${selectedListing.quality}</strong></div><div><span>Listing status</span><strong>${selectedListing.status}</strong></div>`;
        document.getElementById('detailCropDescription').textContent = selectedListing.description;
        showModalView('cropDetailView'); detailModal.classList.remove('hidden'); document.body.classList.add('modal-open');
    };
    renderListings();
    document.querySelectorAll('#marketplaceSearch, #marketplaceCategory, #marketplaceLocation, #marketplacePrice, #marketplaceSort').forEach((control) => control.addEventListener(control.tagName === 'INPUT' ? 'input' : 'change', renderListings));
    document.getElementById('closeCropDetail')?.addEventListener('click', () => { detailModal?.classList.add('hidden'); document.body.classList.remove('modal-open'); });
    document.getElementById('openEnquiryButton')?.addEventListener('click', () => showModalView('enquiryView'));
    document.getElementById('openOrderButton')?.addEventListener('click', () => showModalView('orderView'));
    document.getElementById('buyerEnquiryForm')?.addEventListener('submit', (event) => { event.preventDefault(); if (!event.currentTarget.reportValidity()) return; document.getElementById('enquirySuccess').classList.remove('hidden'); event.currentTarget.reset(); });
    document.getElementById('purchaseForm')?.addEventListener('submit', (event) => { event.preventDefault(); if (!event.currentTarget.reportValidity()) return; document.getElementById('orderId').textContent = 'AO-' + (1048 + Math.floor(Math.random() * 80)); showModalView('confirmedView'); event.currentTarget.reset(); });
    document.querySelectorAll('[data-farmer-action]').forEach((button) => button.addEventListener('click', () => alert(button.dataset.farmerAction + ' is simulated for this prototype.')));
    document.querySelectorAll('[data-market-tab]').forEach((button) => button.addEventListener('click', () => { if (button.dataset.marketTab === 'search') document.getElementById('marketplaceSearch')?.focus(); else alert(button.textContent.trim() + ' is showing sample buyer data in this prototype.'); }));
});
