const express = require('express');
const Review = require('../models/Review');

const router = express.Router();

function mapReview(doc) {
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    id: obj._id.toString(),
    customerName: obj.customerName,
    customerRole: obj.customerRole || '',
    customerCompany: obj.customerCompany || '',
    customerImage: obj.customerImage || '',
    rating: obj.rating,
    reviewText: obj.reviewText,
    isVisible: obj.isVisible,
    isFeatured: obj.isFeatured,
    displayOrder: obj.displayOrder,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
  };
}

function validateReviewBody(body, partial = false) {
  const errors = [];
  if (!partial || body.customerName !== undefined) {
    if (!body.customerName || !String(body.customerName).trim()) errors.push('customerName is required');
  }
  if (!partial || body.rating !== undefined) {
    const rating = Number(body.rating);
    if (!rating || rating < 1 || rating > 5) errors.push('rating must be between 1 and 5');
  }
  if (!partial || body.reviewText !== undefined) {
    if (!body.reviewText || !String(body.reviewText).trim()) errors.push('reviewText is required');
  }
  return errors;
}

// Public: visible reviews
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find({ isVisible: true })
      .sort({ displayOrder: 1, createdAt: -1 });
    res.json(reviews.map(mapReview));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Public: featured visible reviews (max 6)
router.get('/featured', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 6, 6);
    const reviews = await Review.find({ isVisible: true, isFeatured: true })
      .sort({ displayOrder: 1, createdAt: -1 })
      .limit(limit);
    res.json(reviews.map(mapReview));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
module.exports.mapReview = mapReview;
module.exports.validateReviewBody = validateReviewBody;
