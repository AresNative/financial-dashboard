import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_APP_FB_APIKEY,
  authDomain: import.meta.env.VITE_APP_FB_AUTHDOMAIN,
  projectId: import.meta.env.VITE_APP_FB_PROJECTID,
  storageBucket: import.meta.env.VITE_APP_FB_STORAGEBUCKET,
  messagingSenderId: import.meta.env.VITE_APP_FB_MESSAGINGSENDERID,
  appId: import.meta.env.VITE_APP_FB_APPID,
  measurementId: import.meta.env.VITE_APP_FB_MEASUREMENTID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
