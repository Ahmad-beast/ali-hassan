import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { AuditLog } from '../types';

export const subscribeToAuditLogs = (callback: (logs: AuditLog[]) => void) => {
  const q = query(
    collection(db, 'logs'),
    orderBy('performedAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const logs: AuditLog[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        performedAt: data.performedAt?.toDate ? data.performedAt.toDate() : data.performedAt,
      } as AuditLog;
    });
    callback(logs);
  });
};