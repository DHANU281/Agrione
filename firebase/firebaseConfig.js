// Public Firebase web configuration is injected at deploy time through window.__AGRIONE_FIREBASE_CONFIG__.
// Do not place private keys, service-account JSON, or AI secrets in this file.
export const firebaseConfig = globalThis.__AGRIONE_FIREBASE_CONFIG__ || {
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: ''
};

export const isFirebaseConfigured = Object.values(firebaseConfig).every(Boolean);
