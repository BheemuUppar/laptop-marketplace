const express = require('express');
const mongoose = require('mongoose');
const Master = require('../models/Master');
const { MASTER_TYPES, mapMaster } = require('../models/Master');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function findDuplicate(type, value, excludeId) {
  const trimmed = String(value || '').trim();
  if (!trimmed) return null;

  const query = {
    type,
    value: { $regex: new RegExp(`^${escapeRegex(trimmed)}$`, 'i') },
  };
  if (excludeId) query._id = { $ne: excludeId };

  return Master.findOne(query);
}

router.get('/', async (req, res) => {
  try {
    const type = req.query.type ? String(req.query.type) : '';
    const search = String(req.query.search || '').trim();
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter = {};
    if (type) {
      if (!MASTER_TYPES.includes(type)) {
        return res.status(400).json({ message: `Invalid master type: ${type}` });
      }
      filter.type = type;
    }
    if (search) {
      filter.$or = [
        { value: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const [items, total] = await Promise.all([
      Master.find(filter)
        .sort({ type: 1, displayOrder: 1, value: 1 })
        .skip(skip)
        .limit(limit),
      Master.countDocuments(filter),
    ]);

    res.json({
      items: items.map(mapMaster),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/type/:type', async (req, res) => {
  try {
    const { type } = req.params;
    if (!MASTER_TYPES.includes(type)) {
      return res.status(400).json({ message: `Invalid master type: ${type}` });
    }

    const search = String(req.query.search || '').trim();
    const filter = { type };
    if (search) {
      filter.$or = [
        { value: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const items = await Master.find(filter).sort({ displayOrder: 1, value: 1 });
    res.json(items.map(mapMaster));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/counts', async (_req, res) => {
  try {
    const counts = await Master.aggregate([
      { $group: { _id: '$type', total: { $sum: 1 }, active: { $sum: { $cond: ['$isActive', 1, 0] } } } },
    ]);

    const result = {};
    MASTER_TYPES.forEach(type => {
      result[type] = { total: 0, active: 0 };
    });
    counts.forEach(row => {
      result[row._id] = { total: row.total, active: row.active };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const type = String(req.body.type || '').trim();
    const value = String(req.body.value || '').trim();

    if (!MASTER_TYPES.includes(type)) {
      return res.status(400).json({ message: `Invalid master type: ${type}` });
    }
    if (!value) {
      return res.status(400).json({ message: 'Value is required' });
    }

    const duplicate = await findDuplicate(type, value);
    if (duplicate) {
      return res.status(409).json({ message: `"${value}" already exists for ${type}` });
    }

    const item = await Master.create({
      type,
      value,
      description: String(req.body.description || '').trim(),
      displayOrder: Number(req.body.displayOrder) || 0,
      isActive: req.body.isActive !== false,
    });

    res.status(201).json(mapMaster(item));
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Duplicate value for this type' });
    }
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const item = await Master.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Master record not found' });

    if (req.body.value !== undefined) {
      const value = String(req.body.value).trim();
      if (!value) return res.status(400).json({ message: 'Value is required' });

      const duplicate = await findDuplicate(item.type, value, item._id);
      if (duplicate) {
        return res.status(409).json({ message: `"${value}" already exists for ${item.type}` });
      }
      item.value = value;
    }

    if (req.body.description !== undefined) {
      item.description = String(req.body.description).trim();
    }
    if (req.body.displayOrder !== undefined) {
      item.displayOrder = Number(req.body.displayOrder) || 0;
    }
    if (req.body.isActive !== undefined) {
      item.isActive = Boolean(req.body.isActive);
    }

    await item.save();
    res.json(mapMaster(item));
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Duplicate value for this type' });
    }
    res.status(400).json({ message: err.message });
  }
});

router.patch('/:id/status', async (req, res) => {
  try {
    const item = await Master.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Master record not found' });

    item.isActive = req.body.isActive !== undefined ? Boolean(req.body.isActive) : !item.isActive;
    await item.save();
    res.json(mapMaster(item));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid master id' });
    }

    const item = await Master.findByIdAndDelete(id);
    if (!item) return res.status(404).json({ message: 'Master record not found' });

    res.json({ message: 'Master deleted', item: mapMaster(item) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
