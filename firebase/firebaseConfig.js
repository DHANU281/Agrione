export const firebaseConfig = {
    apiKey: "AIzaSyCqGRy-YmNSUlTTyaAziobyq-nsCcl8xQoc",
    authDomain: "agrione-c2499.firebaseapp.com",
    projectId: "agrione-c2499",
    storageBucket: "agrione-c2499.firebasestorage.app",
    messagingSenderId: "531422611800",
    appId: "1:531422611800:web:e02901e7b5a69335c53d2d"
};

export const isFirebaseConfigured =
    Object.values(firebaseConfig).every(Boolean);