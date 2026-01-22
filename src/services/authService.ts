import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut 
} from 'firebase/auth';
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User } from '../types';

export const signUp = async (name: string, email: string, password: string, role: 'admin' | 'viewer' = 'viewer') => {
  // Check if email already exists
  const emailQuery = query(
    collection(db, 'users'), 
    where('email', '==', email)
  );
  const emailSnapshot = await getDocs(emailQuery);
  
  if (!emailSnapshot.empty) {
    throw new Error('Email already exists');
  }

  // Create user with email
  const userCredential = await createUserWithEmailAndPassword(
    auth, 
    email, 
    password
  );

  // Create user profile in Firestore
  const userProfile: Omit<User, 'id'> = {
    name,
    email,
    role,
    createdAt: new Date(),
  };

  await setDoc(doc(db, 'users', userCredential.user.uid), userProfile);

  return userCredential;
};

export const signIn = async (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const signOut = async () => {
  return firebaseSignOut(auth);
};