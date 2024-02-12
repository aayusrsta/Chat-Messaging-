const admin = require('firebase-admin');

const serviceAccount = require('./src/utils/serviceAccount.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const registrationToken = 'eWtA4lGMt38RGKj186Onbi:APA91bG_5rWfGEnPelGDIv-r6cVpyuWLQQjbkPyHbFgosZStJJ9Rk6Tz88G79R_YiyGvOLvrQfLJhQc8sNayK1D11UyoaDJgb93amGJzXbJ9s_SCN7DcLyVyB7fpclC5LCQ-bwpuymym';

const payload = {
  notification: {
    title: 'Your Notification Title',
    body: 'Your Notification Body',
  },
  data: {
    imageUrl: 'https://staticg.sportskeeda.com/editor/2022/01/41359-16424533288388-1920.jpg', 
    action: 'open_url', 
  },
};

admin.messaging().sendToDevice(registrationToken, payload)
  .then((response) => {
    console.log('Notification sent successfully:', response);
  })
  .catch((error) => {
    console.error('Error sending notification:', error);
  });

// import { initializeApp } from "firebase-admin/app";
// import { getMessaging } from "firebase-admin/messaging";
// import { db } from "./src/firebase"; 

// initializeApp();
// const messaging = getMessaging();

// export const sendChatNotification = functions.firestore
//   .document("messages/{messageId}")
//   .onCreate(async (snapshot, context) => {
//     const message = snapshot.data();

//     // Ensure that the message has the necessary fields
//     if (!message || !message.from || !message.to) {
//       console.error("Invalid message structure");
//       return null;
//     }

//     const senderId = message.from;
//     const receiverId = message.to;

//     // Fetch the sender's display name for the notification
//     const senderDoc = await db.collection("users").doc(senderId).get();
//     const senderName = senderDoc.data()?.username || "Someone";

//     // Fetch the receiver's FCM token
//     const receiverDoc = await db.collection("users").doc(receiverId).get();
//     const receiverToken = receiverDoc.data()?.notificationToken;

//     // Check if the receiver has a valid FCM token
//     if (!receiverToken) {
//       console.log(`User ${receiverId} does not have a valid FCM token`);
//       return null;
//     }

//     // Construct the notification payload
//     const notification = {
//       title: `${senderName} sent you a message`,
//       body: message.text || "Sent an attachment",
//     };

//     // Send the notification
//     const payload = {
//       token: receiverToken,
//       notification: notification,
//     };

//     try {
//       await messaging.send(payload);
//       console.log("Notification sent successfully");
//     } catch (error) {
//       console.error("Error sending notification:", error);
//     }

//     return null;
//   });




