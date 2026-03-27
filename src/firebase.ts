import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp, getDocFromServer, doc } from 'firebase/firestore';

// Import the Firebase configuration
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase SDK
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Test connection to Firestore
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. ");
    }
  }
}
testConnection();

export enum ConversionType {
  MAP_CLICK = 'map_click',
  DIRECTIONS_REQUEST = 'directions_request',
  HOURS_CHECK = 'hours_check',
  PURCHASE_INITIATION = 'purchase_initiation',
}

export async function trackConversion(type: ConversionType, metadata: any = {}) {
  try {
    await addDoc(collection(db, 'conversions'), {
      type,
      timestamp: serverTimestamp(),
      userId: auth.currentUser?.uid || 'anonymous',
      metadata,
    });
    console.log(`Conversion tracked: ${type}`);
  } catch (error) {
    console.error('Error tracking conversion:', error);
  }
}

export async function login() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
}
