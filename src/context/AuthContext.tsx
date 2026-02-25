import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User } from '../types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userProfile: null,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
    let mounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!mounted) return;

      setCurrentUser(user);
      
      // ✅ FIX: Loading ko fauran false kar dein taake app stuck na ho!
      setLoading(false);
      
      if (user) {
        try {
          // Ye background mein load hota rahega, app block nahi hogi
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists() && mounted) {
            setUserProfile({ id: userDoc.id, ...userDoc.data() } as User);
          } else if (mounted) {
            setUserProfile(null);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          if (mounted) {
            setUserProfile(null);
          }
        }
      } else {
        if (mounted) {
          setUserProfile(null);
        }
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);
  
  return (
    <AuthContext.Provider value={{ currentUser, userProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
