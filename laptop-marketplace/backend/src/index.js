require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectMongo } = require('./utils/connectMongo');
const { isCloudinaryConfigured } = require('./utils/cloudinaryConfig');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const inquiryRoutes = require('./routes/inquiries');
const uploadRoutes = require('./routes/upload');
const reviewRoutes = require('./routes/reviews');
const adminReviewRoutes = require('./routes/adminReviews');
const storeMediaRoutes = require('./routes/storeMedia');
const adminStoreMediaRoutes = require('./routes/adminStoreMedia');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: (_origin, callback) => callback(null, true),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/api/health', (_req, res) => res.json({ status: 'ok', store: 'iPro Technologies' }));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin/reviews', adminReviewRoutes);
app.use('/api/store/media', storeMediaRoutes);
app.use('/api/admin/store/media', adminStoreMediaRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

connectMongo()
  .then(() => {
    const storage = isCloudinaryConfigured() ? 'Cloudinary' : 'local disk (uploads/)';
    app.listen(PORT, () => {
      console.log(`API running on http://localhost:${PORT}`);
      console.log(`Image storage: ${storage}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
