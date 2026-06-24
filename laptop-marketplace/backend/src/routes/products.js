const express = require('express');
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const { slugify } = require('../utils/slugify');

const router = express.Router();

function buildFilter(query) {
  const filter = {};
  if (query.brand) filter.brand = query.brand;
  if (query.condition) filter.condition = query.condition;
  if (query.ram) filter.ram = query.ram;
  if (query.storage) filter.storage = query.storage;
  if (query.processor) filter.processor = new RegExp(query.processor, 'i');
  if (query.search) {
    filter.$or = [
      { model: new RegExp(query.search, 'i') },
      { brand: new RegExp(query.search, 'i') },
    ];
  }
  if (query.minPrice || query.maxPrice) {
    filter.sellingPrice = {};
    if (query.minPrice) filter.sellingPrice.$gte = Number(query.minPrice);
    if (query.maxPrice) filter.sellingPrice.$lte = Number(query.maxPrice);
  }
  if (query.availability === 'out_of_stock') {
    filter.$or = [{ isAvailable: false }, { quantityAvailable: 0 }];
  } else if (query.availability === 'low_stock') {
    filter.isAvailable = true;
    filter.quantityAvailable = { $gt: 0, $lte: 3 };
  } else if (query.availability === 'in_stock') {
    filter.isAvailable = true;
    filter.quantityAvailable = { $gt: 3 };
  }
  return filter;
}

function buildSort(sortBy) {
  switch (sortBy) {
    case 'price_asc': return { sellingPrice: 1 };
    case 'price_desc': return { sellingPrice: -1 };
    case 'featured': return { featured: -1, createdAt: -1 };
    default: return { createdAt: -1 };
  }
}

// Public: list available products
router.get('/', async (req, res) => {
  try {
    const filter = { isAvailable: true, quantityAvailable: { $gt: 0 }, ...buildFilter(req.query) };
    if (req.query.featured === 'true') filter.featured = true;

    const products = await Product.find(filter).sort(buildSort(req.query.sortBy));
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Public: get by slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Public: related products
router.get('/:id/related', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    const related = await Product.find({
      _id: { $ne: product._id },
      brand: product.brand,
      isAvailable: true,
      quantityAvailable: { $gt: 0 },
    }).limit(4);
    res.json(related);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: list all products
router.get('/admin/all', auth, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: get single
router.get('/admin/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: create
router.post('/', auth, async (req, res) => {
  try {
    const data = { ...req.body };
    data.slug = slugify(data.brand, data.model);

    const existing = await Product.findOne({ slug: data.slug });
    if (existing) {
      data.slug = `${data.slug}-${Date.now()}`;
    }

    const product = await Product.create(data);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Admin: update stock quantity only
router.patch('/:id/stock', auth, async (req, res) => {
  try {
    const quantity = Number(req.body.quantityAvailable);
    if (Number.isNaN(quantity) || quantity < 0) {
      return res.status(400).json({ message: 'quantityAvailable must be a number >= 0' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    product.quantityAvailable = quantity;
    product.isAvailable = quantity > 0;
    await product.save();
    res.json(product);
  } catch (err) {
    const status = err.codeName === 'NotWritablePrimary' ? 503 : 400;
    res.status(status).json({ message: err.message });
  }
});

// Admin: update
router.put('/:id', auth, async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.brand && data.model) {
      const newSlug = slugify(data.brand, data.model);
      const conflict = await Product.findOne({ slug: newSlug, _id: { $ne: req.params.id } });
      if (conflict) {
        return res.status(400).json({ message: 'A product with this brand and model already exists' });
      }
      data.slug = newSlug;
    }
    if (data.quantityAvailable !== undefined) {
      data.quantityAvailable = Number(data.quantityAvailable);
      if (Number.isNaN(data.quantityAvailable) || data.quantityAvailable < 0) {
        return res.status(400).json({ message: 'quantityAvailable must be a number >= 0' });
      }
      if (data.isAvailable === undefined) {
        data.isAvailable = data.quantityAvailable > 0;
      }
    }
    const product = await Product.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    const status = err.codeName === 'NotWritablePrimary' ? 503 : 400;
    res.status(status).json({ message: err.message });
  }
});

// Admin: mark sold (decrement quantity)
router.patch('/:id/mark-sold', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    product.quantityAvailable = Math.max(0, product.quantityAvailable - 1);
    if (product.quantityAvailable === 0) product.isAvailable = false;
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Admin: toggle availability
router.patch('/:id/toggle-availability', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    product.isAvailable = !product.isAvailable;
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Admin: delete
router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: stats
router.get('/admin/stats/summary', auth, async (req, res) => {
  try {
    const all = await Product.find();
    res.json({
      total: all.length,
      available: all.filter(p => p.isAvailable && p.quantityAvailable > 0).length,
      lowStock: all.filter(p => p.isAvailable && p.quantityAvailable > 0 && p.quantityAvailable <= 3).length,
      outOfStock: all.filter(p => !p.isAvailable || p.quantityAvailable === 0).length,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
