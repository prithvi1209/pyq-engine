import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your config object
const firebaseConfig = {
  apiKey: "AIzaSyCjP1s5oGbvvUu5T-KjDE53DuGFdgJk_yw",
  authDomain: "upsc-brain.firebaseapp.com",
  projectId: "upsc-brain",
  storageBucket: "upsc-brain.firebasestorage.app",
  messagingSenderId: "864473415654",
  appId: "1:864473415654:web:673e2b471a95f75642e027",
  measurementId: "G-PNS58KE7B8",
};

const app = initializeApp(firebaseConfig);

// EXPORTS REQUIRED FOR LOGIN.TSX
export const auth = getAuth(app);
export const db = getFirestore(app);
