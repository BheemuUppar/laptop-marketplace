const express = require('express');
const Master = require('../models/Master');
const { MASTER_TYPES, mapMaster } = require('../models/Master');

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const items = await Master.find({ isActive: true })
      .sort({ type: 1, displayOrder: 1, value: 1 });

    const grouped = {};
    MASTER_TYPES.forEach(type => {
      grouped[type] = [];
    });

    items.forEach(item => {
      if (!grouped[item.type]) grouped[item.type] = [];
      grouped[item.type].push(mapMaster(item));
    });

    res.json(grouped);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/counts', async (_req, res) => {
  try {
    const counts = await Master.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]);

    const result = {};
    MASTER_TYPES.forEach(type => {
      result[type] = 0;
    });
    counts.forEach(row => {
      result[row._id] = row.count;
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:type', async (req, res) => {
  try {
    const { type } = req.params;
    if (!MASTER_TYPES.includes(type)) {
      return res.status(400).json({ message: `Invalid master type: ${type}` });
    }

    const items = await Master.find({ type, isActive: true }).sort({
      displayOrder: 1,
      value: 1,
    });

    res.json(items.map(mapMaster));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
