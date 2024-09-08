import { initializeApp as initializeClientApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import * as admin from 'firebase-admin';
import { CustomServiceAccount, FirebaseConfigInterface } from './interfaces/FirebaseConfigInterface';

const serviceAccountCred: CustomServiceAccount = {
  type: process.env.NODE_FIREBASE_TYPE as string,
  project_id: process.env.NODE_FIREBASE_PROJECT_ID as string,
  private_key_id: process.env.NODE_FIREBASE_PRIVATE_KEY_ID as string,
  private_key: (process.env.NODE_FIREBASE_PRIVATE_KEY as string).replace(/\\n/g, '\n'),
  client_email: process.env.NODE_FIREBASE_CLIENT_EMAIL as string,
  client_id: process.env.NODE_FIREBASE_CLIENT_ID as string,
  auth_uri: process.env.NODE_FIREBASE_AUTH_URI as string,
  token_uri: process.env.NODE_FIREBASE_TOKEN_URI as string,
  auth_provider_x509_cert_url: process.env.NODE_FIREBASE_AUTH_PROVIDER_X509_CERT_URL as string,
  client_x509_cert_url: process.env.NODE_FIREBASE_CLIENT_X509_CERT_URL as string,
  universe_domain: process.env.NODE_FIREBASE_UNIVERSE_DOMAIN as string,
};

const firebaseConfig: FirebaseConfigInterface = {
  apiKey: `${process.env.NODE_FIREBASE_API_KEY}`,
  authDomain: `${process.env.NODE_FIREBASE_AUTH_DOMAIN}`,
  projectId: `${process.env.NODE_FIREBASE_PROJECT_ID}`,
  storageBucket: `${process.env.NODE_FIREBASE_STORAGE_BUCKET}`,
  messagingSenderId: `${process.env.NODE_FIREBASE_MESSAGING_SENDER_ID}`,
  appId: `${process.env.NODE_FIREBASE_APP_ID}`,
  measurementId: `${process.env.NODE_FIREBASE_MEASUREMENT_ID}`
};

const app = initializeClientApp(firebaseConfig);
export const db = getFirestore(app);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountCred as admin.ServiceAccount),
});

export const adminDb = admin.firestore();
