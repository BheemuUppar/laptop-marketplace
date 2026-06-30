const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const auth = require('../middleware/auth');
const { cloudinary, configureCloudinary, isCloudinaryConfigured } = require('../utils/cloudinaryConfig');

const router = express.Router();

const UPLOAD_DIR = path.join(__dirname, '../../uploads/products');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

configureCloudinary();

const fileFilter = (_req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Only image files are allowed'));
};

const memoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

const diskUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

function getPublicBaseUrl(req) {
  return process.env.API_BASE_URL || `${req.protocol}://${req.get('host')}`;
}

function getUploadFolder(req) {
  const folder = req.body?.folder || req.query?.folder;
  if (folder === 'reviews') return 'ipro-technologies/reviews';
  return 'ipro-technologies/products';
}

async function uploadToCloudinary(files, folder) {
  return Promise.all(
    files.map(
      (file) =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder, resource_type: 'image' },
            (err, result) => (err ? reject(err) : resolve(result.secure_url))
          );
          stream.end(file.buffer);
        })
    )
  );
}

router.post('/', auth, (req, res) => {
  const handler = isCloudinaryConfigured() ? memoryUpload.array('images', 5) : diskUpload.array('images', 5);

  handler(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    try {
      if (!req.files?.length) {
        return res.status(400).json({ message: 'No images provided' });
      }

      let urls;

      if (isCloudinaryConfigured()) {
        urls = await uploadToCloudinary(req.files, getUploadFolder(req));
      } else {
        const base = getPublicBaseUrl(req);
        urls = req.files.map((f) => `${base}/uploads/products/${f.filename}`);
      }

      res.json({ urls });
    } catch (uploadErr) {
      res.status(500).json({ message: uploadErr.message || 'Upload failed' });
    }
  });
});

module.exports = router;
