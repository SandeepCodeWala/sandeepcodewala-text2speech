// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyANeMoxu5knsCP1-LKoymTkfoChUMube4k",
  authDomain: "texttovoicepro-cf1e6.firebaseapp.com",
  projectId: "texttovoicepro-cf1e6",
  storageBucket: "texttovoicepro-cf1e6.firebasestorage.app",
  messagingSenderId: "551033413501",
  appId: "1:551033413501:web:f665f230511d5c9eacb614",
  measurementId: "G-BCC7R2JV6N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);