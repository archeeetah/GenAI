"use client";

import { createContext, useContext, ReactNode } from 'react';
import { doc, getDoc, DocumentData, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { useAuth } from './auth-context';

// 1. Updated Interface: removed getDocumentsByQuery, added getApplications
interface FirestoreContextType {
    getUserDocument: (collectionName: string) => Promise<DocumentData | null>;
    getApplications: () => Promise<DocumentData[]>;
}

const FirestoreContext = createContext<FirestoreContextType | undefined>(undefined);

export function FirestoreProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();

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

    const value = {
        getUserDocument,
        getApplications,
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