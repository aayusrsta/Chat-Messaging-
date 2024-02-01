import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: "AIzaSyDvfmotOCQGfnPlXKs5W4SsR1W1NBueVbU",
  authDomain: "react-chat-ad50c.firebaseapp.com",
  projectId: "react-chat-ad50c",
  storageBucket: "react-chat-ad50c.appspot.com",
  messagingSenderId: "983554774488",
  appId: "1:983554774488:web:7dda2aba7735e4e073cead",
  measurementId: "G-7ERGF0GPDG",
};


 const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);


