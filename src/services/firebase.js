import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDyipt0FDmQ3I6TnQktdyzawYsSoYgn2d4",
  authDomain: "agro-66597.firebaseapp.com",
  databaseURL: "https://agro-66597-default-rtdb.firebaseio.com",
  projectId: "agro-66597",
  storageBucket: "agro-66597.firebasestorage.app",
  messagingSenderId: "411842555044",
  appId: "1:411842555044:web:1d75aa6f85953662628a31",
  measurementId: "G-240MLM7E8X"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
