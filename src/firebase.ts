import { initializeApp } from 'firebase/app';
import { FirebaseConfigInterface } from './interfaces/FirebaseConfigInterface';

const firebaseConfig: FirebaseConfigInterface = {
  apiKey: `${process.env.NODE_FIREBASE_API_KEY}`,
  authDomain: `${process.env.NODE_FIREBASE_AUTH_DOMAIN}`,
  projectId: `${process.env.NODE_FIREBASE_PROJECT_ID}`,
  storageBucket: `${process.env.NODE_FIREBASE_STORAGE_BUCKET}`,
  messagingSenderId: `${process.env.NODE_FIREBASE_MESSAGING_SENDER_ID}`,
  appId: `${process.env.NODE_FIREBASE_APP_ID}`,
  measurementId: `${process.env.NODE_FIREBASE_MEASUREMENT_ID}`
};

export const app = initializeApp(firebaseConfig);