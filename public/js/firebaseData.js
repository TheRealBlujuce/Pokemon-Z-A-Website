// Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// import { getFirestore, collection, getDocs } from "firebase/firestore";

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-analytics.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBGQaaRXNK9FlEW4zld7QxR6z5wuYCL_bw",
  authDomain: "pokebase-d4e08.firebaseapp.com",
  projectId: "pokebase-d4e08",
  storageBucket: "pokebase-d4e08.firebasestorage.app",
  messagingSenderId: "463755905235",
  appId: "1:463755905235:web:1f54c50520765a83e26c26",
  measurementId: "G-3298WTBT0Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
export const auth = getAuth();

export function getDatabase(){
  return db;
}

// --- Function to get Pokémon data ---
export async function getAllPokemon() {
  const querySnapshot = await getDocs(collection(db, "pokemon"));
  const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return data;
}

// ---- AUTH ---- 

// Login function
export async function login(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user; // returns the logged-in user object
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
}

// Logout function
export async function logout() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout failed:", error);
  }
}

// Get current user
export function getCurrentUser() {
  return auth.currentUser;
}