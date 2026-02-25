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
      
      if (user) {
        try {
          // 🔥 Timeout set kiya hai taake app infinite loading par na atke (Max 5 seconds)
          const fetchPromise = getDoc(doc(db, 'users', user.uid));
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Firestore timeout')), 5000)
          );
          
          const userDoc = await Promise.race([fetchPromise, timeoutPromise]) as any;

          if (userDoc && userDoc.exists() && mounted) {
            setUserProfile({ id: userDoc.id, ...userDoc.data() } as User);
          } else if (mounted) {
            // Agar document nahi mila ya load hone mein masla hua, toh default "viewer" profile set karein
            setUserProfile({ 
              id: user.uid, 
              email: user.email || '', 
              name: 'User', 
              role: 'viewer', 
              createdAt: new Date() 
            });
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          if (mounted) {
            // Error aane ki surat mein bhi app ko block na hone dein
            setUserProfile({ 
              id: user.uid, 
              email: user.email || '', 
              name: 'User', 
              role: 'viewer', 
              createdAt: new Date() 
            });
          }
        }
      } else {
        if (mounted) {
          setUserProfile(null);
        }
      }
      
      if (mounted) {
        setLoading(false); // ✅ Sab kuch set hone ke baad hi loading false hogi
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
