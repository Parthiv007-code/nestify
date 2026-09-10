require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const listingsRoutes = require('./routes/listings');
const usersRoutes = require('./routes/users');

const app = express();
const path = require('path');

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use(cors());           // allows your React app (different port) to call this API
app.use(express.json());   // parses incoming JSON request bodies into req.body

// Mount route groups under their base paths
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingsRoutes);
app.use('/api/users', usersRoutes);

// Simple health check — useful to confirm the server is alive
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
