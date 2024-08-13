import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider signInWithEmailAndPassword } from "firebase/auth";
import { signOut } from "firebase/auth";
import { auth } from '../firebase';


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

const signInWithGoogle = () => {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
};

const signInWithEmail = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export { auth, signInWithGoogle, signInWithEmail };


const handleSignOut = () => {
  signOut(auth).then(() => {
    console.log('Signed out successfully');
  }).catch((error) => {
    console.error('Sign out error', error);
  });
};