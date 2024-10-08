import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const signInWithGoogle = () => {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
};

const signInWithEmail = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

const handleSignOut = () => {
  signOut(auth)
    .then(() => {
      console.log("Signed out successfully");
    })
    .catch((error) => {
      console.error("Sign out error", error);
    });
};

export { auth, signInWithGoogle, signInWithEmail, db, handleSignOut };
