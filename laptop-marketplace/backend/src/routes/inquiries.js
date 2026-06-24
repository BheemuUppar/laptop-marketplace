const express = require('express');
const Inquiry = require('../models/Inquiry');
const auth = require('../middleware/auth');

const router = express.Router();

// Public: submit inquiry
router.post('/', async (req, res) => {
  try {
    const { name, mobile, email, message, productId } = req.body;
    if (!name || !mobile || !email || !message) {
      return res.status(400).json({ message: 'Name, mobile, email, and message are required' });
    }
    const inquiry = await Inquiry.create({ name, mobile, email, message, productId });
    res.status(201).json(inquiry);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Admin: list all
router.get('/', auth, async (req, res) => {
  try {
    const inquiries = await Inquiry.find().populate('productId', 'brand model').sort({ createdAt: -1 });
    res.json(inquiries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: update status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const inquiry = await Inquiry.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!inquiry) return res.status(404).json({ message: 'Inquiry not found' });
    res.json(inquiry);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Admin: stats
router.get('/stats/count', auth, async (req, res) => {
  try {
    const total = await Inquiry.countDocuments();
    const newCount = await Inquiry.countDocuments({ status: 'new' });
    res.json({ total, new: newCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
