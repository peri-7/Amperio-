const express = require('express');
const cors = require('cors');
const fs = require('fs');
const http = require('http');
const https = require('https');
require('dotenv').config();

// import error-handling middleware
const errorHandler = require('./middleware/errorHandler');

// import routes
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// mount routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

// 404 handler
app.use((req, res, next) => {
  const error = new Error('Not Found');
  res.status(404);
  next(error);
});

// global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 9876;
const USE_HTTPS = process.env.USE_HTTPS === 'true';

if (USE_HTTPS) {
  // 🔐 HTTPS MODE (only if certs exist)
  try {
    const sslOptions = {
      key: fs.readFileSync('server.key'),
      cert: fs.readFileSync('server.cert'),
    };

    https.createServer(sslOptions, app).listen(PORT, () => {
      console.log(`🔐 HTTPS server running at https://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ HTTPS enabled but cert files missing.');
    console.error('👉 Either add server.key/server.cert or set USE_HTTPS=false');
    process.exit(1);
  }
} else {
  // 🌍 HTTP MODE (default, safe for all teammates)
  http.createServer(app).listen(PORT, () => {
    console.log(`🌍 HTTP server running at http://localhost:${PORT}`);
  });
}
