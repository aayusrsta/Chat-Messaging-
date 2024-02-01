importScripts('https://www.gstatic.com/firebasejs/9.6.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.2/firebase-messaging-compat.js');

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

  const notificationTitle = 'Name of the last message sender';
  const notificationOptions = {
    body: 'The last message.',
    // icon: '/path/to/icon.png',
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});
