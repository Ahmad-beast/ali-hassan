import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Settings } from '../types';

export const getSettings = async (): Promise<Settings | null> => {
  const settingsDoc = await getDoc(doc(db, 'settings', 'currency'));
  if (settingsDoc.exists()) {
    return { id: settingsDoc.id, ...settingsDoc.data() } as Settings;
  }
  return null;
};

export const updateCurrencyRate = async (rate: number, userId: string) => {
  const settings: Omit<Settings, 'id'> = {
    kwdToPkrRate: rate,
    updatedBy: userId,
    updatedAt: new Date(),
  };

  await setDoc(doc(db, 'settings', 'currency'), settings);
};

export const subscribeToSettings = (callback: (settings: Settings | null) => void) => {
  return onSnapshot(doc(db, 'settings', 'currency'), (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() } as Settings);
    } else {
      callback(null);
    }
  });
};