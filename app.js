
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const QRCode = require('qrcode');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://<username>:<password>@cluster0.mongodb.net/accounting?retryWrites=true&w=majority';
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Admin credentials (initial)
const ADMIN = {
  name: 'Dr. Nasir',
  email: 'gaddafikali@gmail.com',
  passwordHash: bcrypt.hashSync('68135154', 10)
};

// Simple login endpoint
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  if(email === ADMIN.email && bcrypt.compareSync(password, ADMIN.passwordHash)) {
    const token = jwt.sign({ email }, 'SECRET_KEY', { expiresIn: '8h' });
    res.json({ success: true, token });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// Test route
app.get('/', (req, res) => res.json({ status: 'Backend running' }));

// QR code generation example
app.get('/api/qrcode', async (req, res) => {
  try {
    const qr = await QRCode.toDataURL('Sample QR Code');
    res.json({ qr });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = app;
