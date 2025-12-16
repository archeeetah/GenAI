"use client";

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { doc, getDoc, DocumentData, collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { useAuth } from './auth-context';

// 1. Updated Interface: removed getDocumentsByQuery, added getApplications
interface FirestoreContextType {
    getUserDocument: (collectionName: string) => Promise<DocumentData | null>;
    getApplications: () => Promise<DocumentData[]>;
    getLoans: () => Promise<DocumentData[]>;
    createApplication: (applicationId: string, initialData: DocumentData) => Promise<void>;
    userData: DocumentData | null;
}

const FirestoreContext = createContext<FirestoreContextType | undefined>(undefined);

export function FirestoreProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();

    const [userData, setUserData] = useState<DocumentData | null>(null);

    // Ensure User Profile Exists & Listen for Realtime Updates
    useEffect(() => {
        if (!user || !db) {
            setUserData(null);
            return;
        }

        const userDocRef = doc(db, 'users', user.uid);

        const ensureAndSubscribe = async () => {
            // 1. Check if doc exists, if not create default
            try {
                const docSnap = await getDoc(userDocRef);
                if (!docSnap.exists()) {
                    const defaultProfile = {
                        uid: user.uid,
                        email: user.email,
                        displayName: user.displayName || 'User',
                        preApprovedLoan: 0,
                        activeApplications: 0,
                        loanApplications: 0,
                        creditScore: 0, // Default to 0, or 750 if preferred, sticking to 0 as "fresh"
                        createdAt: new Date().toISOString()
                    };
                    const { setDoc } = await import('firebase/firestore');
                    await setDoc(userDocRef, defaultProfile);
                }
            } catch (err) {
                console.error("Error creating user profile:", err);
            }

            // 2. Set up Real-time Listener
            const unsubscribe = onSnapshot(userDocRef, (doc) => {
                if (doc.exists()) {
                    setUserData(doc.data());
                }
            });

            return unsubscribe;
        };

        const unsubscribePromise = ensureAndSubscribe();

        return () => {
            // Cleanup subscription
            unsubscribePromise.then(unsub => unsub && unsub());
        };

    }, [user]);

    const getUserDocument = async (collectionName: string) => {
        if (!user || !db) return null;

        try {
            const docRef = doc(db, collectionName, user.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return docSnap.data();
            } else {
                return null;
            }
        } catch (error) {
            console.error("Error fetching user document:", error);
            return null;
        }
    };

    // 2. Updated Function: No params, auto-injects doc ID as applicationId
    const getApplications = async () => {
        if (!db || !user) return [];

        try {
            const q = query(collection(db, "applications"), where("uid", "==", user.uid));
            const querySnapshot = await getDocs(q);

            const docs = querySnapshot.docs.map(doc => ({
                applicationId: doc.id, // <--- Maps Firestore Doc ID to 'applicationId'
                ...doc.data()
            }));

            return docs;
        } catch (error) {
            console.error("Error querying documents:", error);
            return [];
        }
    };

    const createApplication = async (applicationId: string, initialData: DocumentData) => {
        if (!db || !user) return;
        try {
            const docRef = doc(db, "applications", applicationId);
            // Check if it exists first to avoid overwriting if deemed necessary, 
            // but for now we assume the caller handles the check or we just set it.
            // Using setDoc with merge: true is safer if we just want to ensure it exists.
            // But for a new application, assuming the ID is unique (session ID).
            const { setDoc, updateDoc, increment } = await import('firebase/firestore');
            await setDoc(docRef, initialData, { merge: true });

            // Increment Open Applications count for the user
            const userRef = doc(db, "users", user.uid);
            // We use updateDoc because we know the user doc should exist (ensured by ensureUserProfile)
            await updateDoc(userRef, {
                loanApplications: increment(1)
            });

        } catch (error) {
            console.error("Error creating application:", error);
        }
    };

    // 3. New Function: Fetch Approved Loans from Sub-collection
    const getLoans = async () => {
        if (!db || !user) return [];

        try {
            // Fetch from users/{uid}/loans
            const loansRef = collection(db, "users", user.uid, "loans");
            // Optionally order by date if you add indexing later
            const q = query(loansRef);
            const querySnapshot = await getDocs(q);

            const docs = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            return docs;
        } catch (error) {
            console.error("Error fetching loans:", error);
            return [];
        }
    };

    const value = {
        getUserDocument,
        getApplications,
        getLoans, // Export getLoans
        createApplication,
        userData // Export realtime data
    };

    return <FirestoreContext.Provider value={value}>{children}</FirestoreContext.Provider>;
}

export function useFirestore() {
    const context = useContext(FirestoreContext);
    if (context === undefined) {
        throw new Error('useFirestore must be used within a FirestoreProvider');
    }
    return context;
}