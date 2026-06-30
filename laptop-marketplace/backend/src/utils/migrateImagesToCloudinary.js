require('dotenv').config();
const path = require('path');
const fs = require('fs');
const Product = require('../models/Product');
const Review = require('../models/Review');
const { connectMongo } = require('./connectMongo');
const { cloudinary, configureCloudinary, isCloudinaryConfigured } = require('./cloudinaryConfig');

const UPLOAD_DIR = path.join(__dirname, '../../uploads/products');
const PRODUCT_FOLDER = 'ipro-technologies/products';
const REVIEW_FOLDER = 'ipro-technologies/reviews';
const DEFAULT_UNSPLASH =
  'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=600&fit=crop&q=80';

/** @type {Map<string, string>} */
const urlCache = new Map();

function isCloudinaryUrl(url) {
  return typeof url === 'string' && url.includes('res.cloudinary.com');
}

function isLocalImageUrl(url) {
  if (!url || typeof url !== 'string') return false;
  return url.includes('/uploads/products/') || url.includes('localhost:3000/uploads');
}

function needsMigration(url) {
  if (!url || typeof url !== 'string') return false;
  if (isCloudinaryUrl(url)) return false;
  return isLocalImageUrl(url) || url.startsWith('http://') || url.startsWith('https://');
}

function extractFilename(url) {
  try {
    const pathname = url.includes('://') ? new URL(url).pathname : url;
    return path.basename(pathname.split('?')[0]);
  } catch {
    return path.basename(String(url).split('?')[0]);
  }
}

async function uploadLocalFile(filePath, folder) {
  const result = await cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: 'image',
  });
  return result.secure_url;
}

async function uploadRemoteUrl(sourceUrl, folder) {
  const result = await cloudinary.uploader.upload(sourceUrl, {
    folder,
    resource_type: 'image',
  });
  return result.secure_url;
}

async function migrateImageUrl(sourceUrl, folder) {
  if (!sourceUrl || isCloudinaryUrl(sourceUrl)) return sourceUrl;
  if (urlCache.has(sourceUrl)) return urlCache.get(sourceUrl);

  let cloudUrl = null;

  if (isLocalImageUrl(sourceUrl)) {
    const filename = extractFilename(sourceUrl);
    const filePath = path.join(UPLOAD_DIR, filename);
    if (fs.existsSync(filePath)) {
      cloudUrl = await uploadLocalFile(filePath, folder);
    } else {
      console.warn(`  Skipped (file missing): ${filename}`);
    }
  } else if (sourceUrl.startsWith('http://') || sourceUrl.startsWith('https://')) {
    cloudUrl = await uploadRemoteUrl(sourceUrl, folder);
  }

  if (cloudUrl) {
    urlCache.set(sourceUrl, cloudUrl);
    console.log(`  ${sourceUrl} -> ${cloudUrl}`);
  }

  return cloudUrl || sourceUrl;
}

async function migrateProducts() {
  const products = await Product.find({});
  let updated = 0;
  let imagesMigrated = 0;

  for (const product of products) {
    let changed = false;
    const nextImages = [];

    for (const image of product.images || []) {
      if (needsMigration(image)) {
        const before = image;
        const migrated = await migrateImageUrl(image, PRODUCT_FOLDER);
        nextImages.push(migrated);
        if (migrated !== before && isCloudinaryUrl(migrated)) {
          changed = true;
          imagesMigrated += 1;
        }
      } else {
        nextImages.push(image);
      }
    }

    if (changed) {
      product.images = nextImages;
      await product.save();
      updated += 1;
      console.log(`Updated product: ${product.brand} ${product.model}`);
    }
  }

  return { updated, imagesMigrated };
}

async function migrateReviews() {
  const reviews = await Review.find({ customerImage: { $ne: '' } });
  let updated = 0;

  for (const review of reviews) {
    if (!needsMigration(review.customerImage)) continue;

    const migrated = await migrateImageUrl(review.customerImage, REVIEW_FOLDER);
    if (migrated !== review.customerImage && isCloudinaryUrl(migrated)) {
      review.customerImage = migrated;
      await review.save();
      updated += 1;
      console.log(`Updated review: ${review.customerName}`);
    }
  }

  return updated;
}

async function main() {
  if (!configureCloudinary() || !isCloudinaryConfigured()) {
    console.error('Cloudinary is not configured.');
    console.error('Add your real API secret to backend/.env:');
    console.error('  CLOUDINARY_API_SECRET=<secret from Cloudinary dashboard>');
    console.error('  CLOUDINARY_URL=cloudinary://898871616898793:<secret>@dd1ezv027');
    process.exit(1);
  }

  await connectMongo();
  console.log('Migrating product images to Cloudinary...');
  const { updated, imagesMigrated } = await migrateProducts();
  console.log(`Products updated: ${updated} (${imagesMigrated} images uploaded)`);

  console.log('Migrating review profile images to Cloudinary...');
  const reviewCount = await migrateReviews();
  console.log(`Reviews updated: ${reviewCount}`);

  console.log('Migration complete.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Migration failed:', err.message);
  if (err.message.includes('Invalid Signature')) {
    console.error('Your CLOUDINARY_API_SECRET in backend/.env is incorrect. Copy it from Cloudinary → Settings → API Keys.');
  }
  process.exit(1);
});
