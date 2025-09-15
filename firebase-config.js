// Mengimpor fungsi untuk inisialisasi dasar
import { initializeApp } from "firebase/app";

// --> BARIS TAMBAHAN: Mengimpor fungsi untuk mengaktifkan Firestore
import { getFirestore } from "firebase/firestore";

// --> BARIS TAMBAHAN: Mengimpor fungsi untuk mengaktifkan Authentication
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDwUuphBlB9QHiHIIgyFxp7prYEVpjjqLE",
  authDomain: "airnav-logbook-17d28.firebaseapp.com",
  projectId: "airnav-logbook-17d28",
  storageBucket: "airnav-logbook-17d28.firebasestorage.app",
  messagingSenderId: "366192208250",
  appId: "1:366192208250:web:84c720c72fbf8b18f6cec3"
};

// Inisialisasi dasar
const app = initializeApp(firebaseConfig);

// --> BARIS TAMBAHAN: Membuat "jalan pintas" ke layanan Firestore
export const db = getFirestore(app);
// --> BARIS TAMBAHAN: Membuat "jalan pintas" ke layanan Authentication
export const auth = getAuth(app);