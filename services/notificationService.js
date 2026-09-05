import { saveFarmerCollection, getUserDocuments, getCurrentUser } from './firebaseService.js';
const KEY = 'agrione-notifications';
export function getLocalNotifications() { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
export function saveLocalNotification(notification) { const items = getLocalNotifications(); items.unshift({ id: 'local-' + Date.now(), ...notification, read: false }); localStorage.setItem(KEY, JSON.stringify(items)); return items; }
export async function createNotification(notification) { const item = saveLocalNotification(notification); if (getCurrentUser()) { try { await saveFarmerCollection('notifications', notification); } catch { } } return item; }
export async function getNotifications() { if (getCurrentUser()) { try { return await getUserDocuments('notifications'); } catch { } } return getLocalNotifications(); }
