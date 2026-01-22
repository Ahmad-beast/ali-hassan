import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  getDocs,
  getDoc,
  setDoc,
  increment
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Transaction, AuditLog, Receiver } from '../types';

export const getTransactionById = async (id: string): Promise<Transaction | null> => {
  const docRef = doc(db, 'transactions', id);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      date: data.date?.toDate ? data.date.toDate() : data.date,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
    } as Transaction;
  }
  
  return null;
};

export const addTransaction = async (transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
  const newTransaction = {
    ...transaction,
    createdAt: new Date(),
  };

  const docRef = await addDoc(collection(db, 'transactions'), newTransaction);

  // Update receiver usage count
  await updateReceiverUsage(transaction.to);

  // Log the action
  await logAction('CREATE', 'transaction', docRef.id, transaction.createdBy, null, newTransaction);

  return docRef.id;
};

export const updateTransaction = async (id: string, updates: Partial<Transaction>, userId: string) => {
  // Get original transaction for logging
  const originalDoc = await getDoc(doc(db, 'transactions', id));
  const originalData = originalDoc.data();

  const updatedData = {
    ...updates,
    updatedAt: new Date(),
  };

  await updateDoc(doc(db, 'transactions', id), updatedData);

  // Log the action
  await logAction('UPDATE', 'transaction', id, userId, originalData, { ...originalData, ...updatedData });
};

export const deleteTransaction = async (id: string, userId: string) => {
  // Get original transaction for logging
  const originalDoc = await getDoc(doc(db, 'transactions', id));
  const originalData = originalDoc.data();

  // Soft delete
  await updateDoc(doc(db, 'transactions', id), {
    isDeleted: true,
    updatedAt: new Date(),
  });

  // Log the action
  await logAction('DELETE', 'transaction', id, userId, originalData, { ...originalData, isDeleted: true });
};

export const subscribeToTransactions = (callback: (transactions: Transaction[]) => void) => {
  const q = query(
    collection(db, 'transactions'),
    orderBy('date', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const allTransactions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate ? doc.data().date.toDate() : doc.data().date,
      createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : doc.data().createdAt,
      updatedAt: doc.data().updatedAt?.toDate ? doc.data().updatedAt.toDate() : doc.data().updatedAt,
    } as Transaction));
    
    // Filter out deleted transactions in memory to avoid composite index requirement
    const activeTransactions = allTransactions.filter(transaction => !transaction.isDeleted);
    callback(activeTransactions);
  });
};

const updateReceiverUsage = async (receiverName: string) => {
  const receiverRef = doc(db, 'receivers', receiverName.toLowerCase());
  const receiverDoc = await getDoc(receiverRef);

  if (receiverDoc.exists()) {
    await updateDoc(receiverRef, {
      usageCount: increment(1),
    });
  } else {
    await setDoc(receiverRef, {
      name: receiverName,
      usageCount: 1,
    });
  }
};

const logAction = async (
  action: 'CREATE' | 'UPDATE' | 'DELETE',
  entityType: string,
  entityId: string,
  performedBy: string,
  beforeValues: any,
  afterValues: any
) => {
  const log: Omit<AuditLog, 'id'> = {
    action,
    entityType: entityType as any,
    entityId,
    performedBy,
    performedAt: new Date(),
    beforeValues,
    afterValues,
  };

  await addDoc(collection(db, 'logs'), log);
};

export const getReceivers = async (): Promise<Receiver[]> => {
  const q = query(collection(db, 'receivers'), orderBy('usageCount', 'desc'));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Receiver));
};