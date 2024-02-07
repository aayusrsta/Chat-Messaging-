
const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('./src/utils/serviceAccount.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://your-firebase-project-id.firebaseio.com',
});

const app = express();
const PORT = 3001;

const validUsers = [
  { username: 'user1', password: 'user123', uid: '1', name: 'User One' },
  { username: 'user2', password: 'user123', uid: '2', name: 'User Two' },
  { username: 'user3', password: 'user123', uid: '3', name: 'User Three' },

];

app.use(cors());
app.use(bodyParser.json());

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  const validUser = validUsers.find(user => user.username === username && user.password === password);

  if (validUser) {
    const { uid, name } = validUser;

    const token = jwt.sign({ username, uid, name}, 'your-secret-key-any-string', { expiresIn: '1h' });

    admin.auth().createCustomToken(uid)
      .then(customToken => {
        admin.auth().updateUser(uid, { displayName: name })
          .then(() => {
            res.json({ token, customToken });
          })
          .catch(error => {
            console.error('Error updating display name:', error);
            res.status(500).json({ message: 'Internal server error' });
          });
      })
      .catch(error => {
        console.error('Error generating custom token:', error);
        res.status(500).json({ message: 'Internal server error' });
      });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});
app.get('/api/users', (req, res) => {
  res.json(validUsers);
});
app.listen(PORT, () => {
  console.log(`Authentication server is running on http://localhost:${PORT}`);
});
