importScripts('https://www.gstatic.com/firebasejs/9.6.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.2/firebase-messaging-compat.js');
// importScripts('/__/firebase/10.0.0/firebase-app-compat.js');
// importScripts('/__/firebase/10.0.0/firebase-messaging-compat.js');
// importScripts('/__/firebase/init.js');

const firebaseConfig = {
  apiKey: "AIzaSyDvfmotOCQGfnPlXKs5W4SsR1W1NBueVbU",
  authDomain: "react-chat-ad50c.firebaseapp.com",
  projectId: "react-chat-ad50c",
  storageBucket: "react-chat-ad50c.appspot.com",
  messagingSenderId: "983554774488",
  appId: "1:983554774488:web:7dda2aba7735e4e073cead",
  measurementId: "G-7ERGF0GPDG",
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Received background message ', payload);

  // const notificationTitle = payload.notification.title;
  const notificationTitle = "RANDOM TITLE FOR TESTING";

  const notificationOptions = {
    // body: payload.notification.body,
    body: "TEST BODY",

  };


 

  return self.registration.showNotification(notificationTitle, notificationOptions);
});
