const express = require('express');
const Review = require('../models/Review');
const auth = require('../middleware/auth');
const { mapReview, validateReviewBody } = require('./reviews');

const router = express.Router();

router.use(auth);

router.get('/stats/summary', async (_req, res) => {
  try {
    const [total, visible, featured, hidden] = await Promise.all([
      Review.countDocuments(),
      Review.countDocuments({ isVisible: true }),
      Review.countDocuments({ isFeatured: true }),
      Review.countDocuments({ isVisible: false }),
    ]);
    res.json({ total, visible, featured, hidden });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/', async (_req, res) => {
  try {
    const reviews = await Review.find().sort({ displayOrder: 1, createdAt: -1 });
    res.json(reviews.map(mapReview));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json(mapReview(review));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const errors = validateReviewBody(req.body);
    if (errors.length) return res.status(400).json({ message: errors.join(', ') });

    const review = await Review.create({
      customerName: req.body.customerName.trim(),
      customerRole: req.body.customerRole?.trim() || '',
      customerCompany: req.body.customerCompany?.trim() || '',
      customerImage: req.body.customerImage?.trim() || '',
      rating: Number(req.body.rating),
      reviewText: req.body.reviewText.trim(),
      isVisible: req.body.isVisible !== false,
      isFeatured: req.body.isFeatured === true,
      displayOrder: Number(req.body.displayOrder) || 0,
    });
    res.status(201).json(mapReview(review));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const errors = validateReviewBody(req.body, true);
    if (errors.length) return res.status(400).json({ message: errors.join(', ') });

    const update = {};
    if (req.body.customerName !== undefined) update.customerName = String(req.body.customerName).trim();
    if (req.body.customerRole !== undefined) update.customerRole = String(req.body.customerRole).trim();
    if (req.body.customerCompany !== undefined) update.customerCompany = String(req.body.customerCompany).trim();
    if (req.body.customerImage !== undefined) update.customerImage = String(req.body.customerImage).trim();
    if (req.body.rating !== undefined) update.rating = Number(req.body.rating);
    if (req.body.reviewText !== undefined) update.reviewText = String(req.body.reviewText).trim();
    if (req.body.isVisible !== undefined) update.isVisible = Boolean(req.body.isVisible);
    if (req.body.isFeatured !== undefined) update.isFeatured = Boolean(req.body.isFeatured);
    if (req.body.displayOrder !== undefined) update.displayOrder = Number(req.body.displayOrder) || 0;

    const review = await Review.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json(mapReview(review));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/:id/visibility', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    review.isVisible = req.body.isVisible !== undefined ? Boolean(req.body.isVisible) : !review.isVisible;
    await review.save();
    res.json(mapReview(review));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/:id/featured', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    review.isFeatured = req.body.isFeatured !== undefined ? Boolean(req.body.isFeatured) : !review.isFeatured;
    await review.save();
    res.json(mapReview(review));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
