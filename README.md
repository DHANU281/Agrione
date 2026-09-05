# AgriOne Prototype

AgriOne is a browser-based farmer platform prototype covering dashboard insights, weather, disease detection, marketplace listings, orders, equipment rental, soil testing, profiles, AI Farmer Assistant, and admin reporting.

## Multilingual language system

The centralized `i18n/index.js` module supports English, Telugu, Hindi, Tamil, Kannada, Malayalam, Marathi, Bengali, Gujarati, Punjabi, Assamese, and Odia. English is the default; the selected language is persisted in `localStorage` and can be saved as `preferredLanguage` on the Firebase farmer profile. Missing keys safely fall back to English.

Add a language by extending the shared language metadata and catalog in `i18n/index.js`; UI code should reference translation keys rather than embedding translated strings. The first-visit onboarding dialog, header selector, and Language Settings section all use this same catalog. Indian languages remain LTR, while the document direction can be extended later for RTL languages.

The AI Assistant uses localized quick questions, prototype responses, and speech recognition locales (`en-IN`, `te-IN`, `hi-IN`, `ta-IN`, `kn-IN`, `ml-IN`, `mr-IN`, `bn-IN`, `gu-IN`, `pa-IN`, `as-IN`, `or-IN`). Voice input depends on browser speech-recognition support and shows a friendly fallback when unavailable.

## Technologies

- HTML, CSS, and JavaScript modules
- Firebase Authentication and Cloud Firestore adapter
- Browser `localStorage` demo fallback
- PWA manifest and service worker for supported browsers

## Project Overview

AgriOne is a static, single-page student startup MVP. It keeps the original dashboard, authentication, Firebase adapter, crop disease prototype, multilingual UI, AI Assistant, weather, maps, market intelligence, marketplace, orders, farm services, notifications, support, learning, and admin presentation surfaces.

## Project Structure

- `index.html/index.html`: semantic application shell and feature sections
- `script.js/script.js`: UI orchestration and event wiring
- `style.css/style.css`: shared responsive design system
- `i18n/index.js`: centralized language catalog and fallback runtime
- `services/`: isolated AI, disease, weather, market, map-adjacent, notification, and farm-service boundaries
- `manifest.json`, `sw.js`, `offline.html`: installable web-app and offline shell

## Demo Mode and Environment Variables

Copy `.env.example` to a deployment environment. `VITE_DEMO_MODE=true` is the safe default. Weather, market, maps, AI, provider listings, orders, and support analytics remain clearly labelled prototype/demo data until verified backend services are configured. Never commit `.env` or private credentials.

## PWA and Deployment

The app is Vercel-ready as a static deployment: publish the repository root with no build command and no output directory. `vercel.json` keeps the service worker fresh. Service-worker installation requires HTTPS or localhost; opening the HTML directly with `file:` can still use the cached/demo UI but browsers do not permit service-worker registration there.

## Security

Firebase rules scope farmer-owned records by authenticated UID and reserve admin records for the `admin` custom claim. Uploads are type- and size-validated in the existing disease flow. API keys are configuration placeholders only; production AI, weather, market, and map credentials must stay behind server-side endpoints.

## Future Roadmap

1. Student Prototype
2. Farmer Validation
3. MVP Pilot
4. Real AI Model Integration
5. Live Market and Weather APIs
6. Service Provider Network
7. Regional Expansion
8. Scale Across India

## Firebase setup

1. Create a Firebase project and enable Email/Password Authentication.
2. Create a Firestore database.
3. Copy `.env.example` values into your deployment environment.
4. Inject the public Firebase web config as `window.__AGRIONE_FIREBASE_CONFIG__` before the module scripts load. A Vite or other build pipeline can map `VITE_FIREBASE_*` variables to this object.
5. Deploy `firebase/firestore.rules` and create an admin custom claim through a trusted server or Firebase Admin SDK. Never create admin authentication in the browser.

## Weather setup

Farm Weather runs in clearly labelled Demo Mode until both `VITE_WEATHER_API_KEY` and `VITE_WEATHER_API_URL` are configured. The service sends a location label and optional approximate coordinates to the configured server endpoint. API failures automatically fall back to Demo Mode.

## AI Assistant

AgriOne AI Assistant is available at the `#ai-assistant` section and provides short English or Telugu prototype responses. Without `VITE_AI_API_KEY` and `VITE_AI_API_URL`, it runs in `DEMO AI` mode using predefined topic responses. Chat history uses `localStorage` and can be sent to the `assistantChats` collection when Firebase is configured. Voice input uses browser speech recognition when supported.

AI responses are preliminary educational and planning information, not guaranteed or professionally verified agricultural advice. Disease and treatment questions should be confirmed with a qualified agricultural expert and product labels.

The adapter is in `services/firebaseService.js`. It lazy-loads the Firebase browser SDK only when all public config values exist. Authentication uses browser-local persistence. No private keys, service-account credentials, AI keys, or secret tokens belong in this frontend.

## Firestore collections

The prepared collections are `farmers`, `crops`, `orders`, `diseaseReports`, `equipmentRequests`, `soilTestRequests`, `storageRequests`, `serviceRequests`, `marketWatchlist`, `priceAlerts`, `assistantChats`, and `notifications`. Farmer-owned reads and writes are UID-scoped by `firebase/firestore.rules`; admin access is reserved for a secure `admin` custom claim.

The service exposes reusable authentication, document write, and farmer collection read functions. Existing UI forms remain functional in demo mode; production wiring can call `saveFarmerCollection` for marketplace, order, equipment, and soil submissions as backend endpoints are enabled.

## Demo Mode

Without Firebase configuration, the application displays `Demo Mode — Firebase backend is not connected.` Existing demo flows continue using local sample data. Disease reports are stored in browser `localStorage` under `agrione-disease-reports`. Demo prices, orders, profiles, payment states, and diagnosis responses are not real-world claims.

## Disease AI integration

`services/diseaseDetectionService.js` exposes `analyzeCropImage(image)` with a clearly separated demo response. Replace the marked fallback with a backend endpoint connected to a trained computer-vision model. Keep model credentials on the server, validate responses there, and return normalized crop, issue, confidence, symptoms, guidance, and `mode` fields.

## AI Assistant setup

The AI Assistant supports English and Telugu demo questions, quick topic prompts, browser voice input where supported, local chat history, and links to existing AgriOne modules. Configure `VITE_AI_API_KEY` and `VITE_AI_API_URL` only for a server-backed production integration; do not place private keys in frontend code. Without them, the interface shows `DEMO AI` and uses predefined responses. All responses are preliminary educational guidance and must not replace qualified agricultural advice.

## Deployment

Serve the project from a static host or local web server so browser modules and remote Firebase SDK imports load consistently. Inject the public config at build time, deploy Firestore rules, and test Authentication providers and rules in a Firebase project before sharing the app.
