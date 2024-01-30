// public/firebase-messaging-sw.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { isSupported, getMessaging, onMessage } from "firebase/messaging";
import { onBackgroundMessage } from "@firebase/messaging/sw";

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

if (typeof window !== "undefined") {
  (async () => {
    if (await isSupported()) {
      const messaging = getMessaging(app);

      // Request permission to receive notifications
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          console.log("Notification permission granted.");
          console.log("MESSAGING", messaging);
        } else {
          console.error("Notification permission denied.");
        }
      });

      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
          onBackgroundMessage(messaging, (payload) => {
            console.log('[firebase-messaging-sw.js] Received background message ', payload);
            // Customize notification here
            const notificationTitle = 'Background Message Title';
            const notificationOptions = {
              body: 'Background Message body.',
              icon: '/firebase-logo.png'
            };
          
            registration.showNotification(notificationTitle, notificationOptions);
          });
        });
  
        onMessage(messaging, (payload) => {
          console.log("Message received:", payload);
  
          if (Notification.permission === "granted") {
            const notificationTitle = payload?.notification?.title || "New Message";
            const notificationBody = payload?.notification?.body || "You have a new message";
            console.log("Notification Title:", notificationTitle);
            console.log("Notification Body:", notificationBody);
  
            const notification = new Notification(notificationTitle, {
              body: notificationBody,
            });
  
            notification.addEventListener("click", () => {
              console.log("Notification clicked!");
            });
          }
        });
      }
    }
  })();
}
