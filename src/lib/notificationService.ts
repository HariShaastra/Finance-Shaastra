import { db, UserProfile, Entry, handleFirestoreError, OperationType } from './firebase';
import { collection, query, orderBy, limit, getDocs, doc, updateDoc, Timestamp } from 'firebase/firestore';

export async function checkIrregularUsage(userId: string, profile: UserProfile) {
  if (!profile.notificationsEnabled) return;

  try {
    const entriesQ = query(
      collection(db, 'users', userId, 'entries'),
      orderBy('date', 'desc'),
      limit(1)
    );
    const snap = await getDocs(entriesQ);
    
    if (snap.empty) {
      // New user, maybe nudge once
      return;
    }

    const lastEntry = snap.docs[0].data() as Entry;
    const lastDate = lastEntry.date?.toDate ? lastEntry.date.toDate() : new Date(lastEntry.date);
    const diffDays = (new Date().getTime() - lastDate.getTime()) / (1000 * 3600 * 24);

    if (diffDays >= 3) {
      showNotification("Mindfulness Check", "Your financial discipline thrives on consistency. It's been a few days since your last log.");
    }
  } catch (error) {
    console.error("Error checking usage:", error);
  }
}

export async function requestNotificationPermission() {
  if (!("Notification" in window)) return false;
  
  if (Notification.permission === "granted") return true;
  
  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }
  
  return false;
}

export function showNotification(title: string, body: string) {
  if (Notification.permission === "granted") {
    new Notification(title, { body, icon: '/logo.png' });
  }
}
