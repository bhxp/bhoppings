const express = require('express');
const path = require('path');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('./firebase.json'); // Replace with your service account file path

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://your-database-name.firebaseio.com', // Replace with your Firebase Realtime Database URL
});

const db = admin.database();

const app = express();
const PORT = process.env.PORT || 3000;

// Helper function to get the entire database
async function getDatabase() {
  try {
    const snapshot = await db.ref('/').once('value');
    return snapshot.val();
  } catch (error) {
    console.error('Error retrieving database:', error);
    return null;
  }
}

// Helper function to get a specific key from the database
async function getKey(key) {
  try {
    const snapshot = await db.ref(key).once('value');
    return snapshot.val() || null;
  } catch (error) {
    console.error('Error retrieving key:', error);
    return null;
  }
}

// Helper function to write a specific key to the database
async function writeKey(key, value) {
  try {
    await db.ref(key).set(value);
    return value;
  } catch (error) {
    console.error('Error writing key:', error);
    return null;
  }
}

app.use(express.json()); // Middleware to parse JSON requests
app.use(express.static(path.join(__dirname, 'public')));

// Redirect /tango to /tangini
app.get('/tango', (req, res) => {
  res.redirect('/tangini');
});

// Route to increment "test" property in Firebase Realtime Database
app.get('/test', async (req, res) => {
  try {
    // Check if "test" exists in Firebase
    const testValue = await getKey('test');
    
    let newTestValue;
    
    if (testValue === null) {
      // If "test" doesn't exist, create it with value 1
      newTestValue = 1;
    } else {
      // Increment the "test" value
      newTestValue = testValue + 1;
    }

    // Write the updated value of "test" to Firebase
    const updatedValue = await writeKey('test', newTestValue);

    if (updatedValue !== null) {
      res.status(200).json({ test: updatedValue });
    } else {
      res.status(500).send('Error updating the test property');
    }
  } catch (error) {
    console.error('Error processing /test request:', error);
    res.status(500).send('Internal server error');
  }
});

// Example routes for reading and writing data to Firebase
// Route to get the entire database
app.get('/database', async (req, res) => {
  try {
    const data = await getDatabase();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).send('Error retrieving the database');
  }
});

// Route to get a specific key from the database
app.get('/key/:key', async (req, res) => {
  const { key } = req.params;
  try {
    const value = await getKey(key);
    if (value !== null) {
      res.status(200).json({ [key]: value });
    } else {
      res.status(404).send(`Key "${key}" not found`);
    }
  } catch (error) {
    res.status(500).send('Error retrieving the key');
  }
});

// Route to write a new key to the database
app.post('/key', async (req, res) => {
  const { key, value } = req.body;
  try {
    if (key && value !== undefined) {
      const result = await writeKey(key, value);
      if (result !== null) {
        res.status(200).json({ [key]: result });
      } else {
        res.status(500).send('Error writing the key');
      }
    } else {
      res.status(400).send('Invalid key or value');
    }
  } catch (error) {
    res.status(500).send('Error writing the key');
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public/404/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
