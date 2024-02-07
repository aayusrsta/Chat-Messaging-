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









  //Using topic:
//   const admin = require('firebase-admin');

// const serviceAccount = require('./src/utils/serviceAccount.json');

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

// // Replace 'yourTopic' with a topic name (e.g., 'news', 'updates', etc.)
// const topic = 'yourTopic';

// const payload = {
//   notification: {
//     title: 'Your Notification Title',
//     body: 'Your Notification Body',
//   },
//   data: {
//     imageUrl: 'https://staticg.sportskeeda.com/editor/2022/01/41359-16424533288388-1920.jpg', 
//     action: 'open_url', 
//   },
// };

// // Sending notifications to devices subscribed to a topic
// admin.messaging().sendToTopic(topic, payload)
//   .then((response) => {
//     console.log('Notification sent successfully:', response);
//   })
//   .catch((error) => {
//     console.error('Error sending notification:', error);
//   });

