import { initializeApp as initializeClientApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import * as admin from 'firebase-admin';
import serviceAccount from '../config/cuisine-6ff3f-firebase-adminsdk-lql7w-2ec6bfc376.json'; // Pastikan path ini benar

const serviceAccountCred = serviceAccount as admin.ServiceAccount;

const firebaseConfig = {
  apiKey: process.env.NODE_FIREBASE_API_KEY,
  authDomain: process.env.NODE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NODE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NODE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NODE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NODE_FIREBASE_APP_ID,
  measurementId: process.env.NODE_FIREBASE_MEASUREMENT_ID
};

const app = initializeClientApp(firebaseConfig);
export const db = getFirestore(app);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountCred),
});

export const adminDb = admin.firestore();
