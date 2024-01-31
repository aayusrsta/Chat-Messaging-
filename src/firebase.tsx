import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { collection, getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import {
  isSupported,
  getMessaging,
  getToken,
  onMessage,
} from "firebase/messaging";
import { useEffect } from "react";

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

// if (typeof window !== 'undefined') {
//   const messaging = getMessaging(app);

//   getToken(messaging, { vapidKey: 'BCVDQWcX1Jbic82j_hOpHbasdrcHywqnKwWL7xDxYsMPbhmYGillMguXKy8yMSwcoC3zwMcxPyUPsYkoKGK7kAg' })
//     .then((currentToken) => {
//       if (currentToken) {
//         console.log("The token is:", currentToken);
//       } else {
//         console.log('No registration token available. Request permission to generate one.');
//       }
//     })
//     .catch((err) => {
//       console.log('An error occurred while retrieving token. ', err);
//     });
// }

