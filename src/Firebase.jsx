import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBASN7mcUEMcjEZ5YoOoryScQrkCwEGR5Y",
    authDomain: "hulo-25502.firebaseapp.com",
    projectId: "hulo-25502",
    storageBucket: "hulo-25502.firebasestorage.app",
    messagingSenderId: "325794264733",
    appId: "1:325794264733:web:a84ffec1e486d3ec6cc674",
    measurementId: "G-HEC7Q5VHTE"
  };

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);