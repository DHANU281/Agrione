import { firebaseConfig, isFirebaseConfigured } from '../firebase/firebaseConfig.js';

let firebaseModules;
let firebaseApp;
let auth;
let db;

async function getFirebase() {
    if (!isFirebaseConfigured) return null;
    if (!firebaseModules) {
        const [appModule, authModule, firestoreModule] = await Promise.all([
            import('https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js'),
            import('https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js'),
            import('https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js')
        ]);
        firebaseApp = appModule.initializeApp(firebaseConfig);
        auth = authModule.getAuth(firebaseApp);
        db = firestoreModule.getFirestore(firebaseApp);
        firebaseModules = { authModule, firestoreModule };
        await authModule.setPersistence(auth, authModule.browserLocalPersistence);
    }
    return { auth, db, ...firebaseModules };
}

export const firebaseStatus = { configured: isFirebaseConfigured, mode: isFirebaseConfigured ? 'firebase' : 'demo' };
export const getCurrentUser = () => auth?.currentUser || null;

export async function signIn(email, password) {
    const firebase = await getFirebase();
    if (!firebase) throw new Error('DEMO_MODE');
    return firebase.authModule.signInWithEmailAndPassword(firebase.auth, email, password);
}

export async function signUp(profile, password) {
    const firebase = await getFirebase();
    if (!firebase) throw new Error('DEMO_MODE');
    const credentials = await firebase.authModule.createUserWithEmailAndPassword(firebase.auth, profile.email, password);
    await saveDocument('farmers', credentials.user.uid, { ...profile, uid: credentials.user.uid, role: 'farmer', createdAt: firebase.firestoreModule.serverTimestamp() });
    return credentials;
}

export async function signOutUser() {
    const firebase = await getFirebase();
    if (firebase) return firebase.authModule.signOut(firebase.auth);
}

export async function resetPassword(email) {
    const firebase = await getFirebase();
    if (!firebase) throw new Error('DEMO_MODE');
    return firebase.authModule.sendPasswordResetEmail(firebase.auth, email);
}

export function observeAuth(callback) {
    if (!isFirebaseConfigured) return () => {};
    getFirebase().then((firebase) => firebase.authModule.onAuthStateChanged(firebase.auth, callback)).catch(() => {});
    return () => {};
}

export async function saveDocument(collectionName, documentId, data) {
    const firebase = await getFirebase();
    if (!firebase) throw new Error('DEMO_MODE');
    const reference = documentId ? firebase.firestoreModule.doc(firebase.db, collectionName, documentId) : firebase.firestoreModule.collection(firebase.db, collectionName);
    if (documentId) await firebase.firestoreModule.setDoc(reference, data, { merge: true });
    else return firebase.firestoreModule.addDoc(reference, data);
    return reference;
}

export async function getUserDocuments(collectionName, farmerId = getCurrentUser()?.uid) {
    const firebase = await getFirebase();
    if (!firebase) throw new Error('DEMO_MODE');
    const query = firebase.firestoreModule.query(firebase.firestoreModule.collection(firebase.db, collectionName), firebase.firestoreModule.where('farmerId', '==', farmerId), firebase.firestoreModule.orderBy('createdAt', 'desc'));
    const snapshot = await firebase.firestoreModule.getDocs(query);
    return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export async function getFarmerProfile() {
    const user = getCurrentUser();
    if (!user) return null;
    const firebase = await getFirebase();
    if (!firebase) return JSON.parse(localStorage.getItem('agrione-farmer-profile') || 'null');
    const snapshot = await firebase.firestoreModule.getDoc(firebase.firestoreModule.doc(firebase.db, 'farmers', user.uid));
    return snapshot.exists() ? snapshot.data() : null;
}

export async function saveFarmerProfile(profile) {
    const existing = JSON.parse(localStorage.getItem('agrione-farmer-profile') || '{}');
    localStorage.setItem('agrione-farmer-profile', JSON.stringify({ ...existing, ...profile }));
    const user = getCurrentUser();
    if (user && isFirebaseConfigured) await saveDocument('farmers', user.uid, profile);
}

export async function saveFarmerCollection(collectionName, data) {
    return saveDocument(collectionName, null, { ...data, farmerId: data.farmerId || getCurrentUser()?.uid, createdAt: data.createdAt || (await getFirebase())?.firestoreModule.serverTimestamp(), status: data.status || 'pending' });
}

export const createCropListing = (data) => saveFarmerCollection('crops', { ...data, status: data.status || 'available' });
export const createOrder = (data) => saveFarmerCollection('orders', { ...data, orderId: data.orderId || 'AO-' + Date.now(), status: data.status || 'Order Placed' });
export const saveDiseaseReportToFirebase = (data) => saveFarmerCollection('diseaseReports', { ...data, mode: 'demo' });
export const createEquipmentRequest = (data) => saveFarmerCollection('equipmentRequests', data);
export const createSoilTestRequest = (data) => saveFarmerCollection('soilTestRequests', data);
export const createNotification = (data) => saveFarmerCollection('notifications', { ...data, read: false });
