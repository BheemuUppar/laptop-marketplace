const express = require('express');
const StoreMedia = require('../models/StoreMedia');
const StoreSettings = require('../models/StoreSettings');
const auth = require('../middleware/auth');
const { mapPhoto, mapVideo } = require('./storeMedia');

const router = express.Router();

router.use(auth);

function extractYoutubeVideoId(input) {
  if (!input) return '';
  const trimmed = String(input).trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;

  try {
    const url = new URL(trimmed);
    if (url.hostname.includes('youtu.be')) {
      return url.pathname.replace(/^\//, '').split('/')[0] || '';
    }
    const v = url.searchParams.get('v');
    if (v) return v;
    const embedMatch = url.pathname.match(/\/embed\/([^/?]+)/);
    if (embedMatch) return embedMatch[1];
    const shortsMatch = url.pathname.match(/\/shorts\/([^/?]+)/);
    if (shortsMatch) return shortsMatch[1];
  } catch {
    return '';
  }
  return '';
}

function mapAdminItem(doc) {
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    id: obj._id.toString(),
    type: obj.type,
    title: obj.title || '',
    imageUrl: obj.imageUrl || '',
    videoId: obj.videoId || '',
    isVisible: obj.isVisible,
    displayOrder: obj.displayOrder,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
  };
}

router.get('/settings', async (_req, res) => {
  try {
    const settings = await StoreSettings.findOne({ key: 'main' });
    res.json({ youtubeChannelUrl: settings?.youtubeChannelUrl || '' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/settings', async (req, res) => {
  try {
    const youtubeChannelUrl = String(req.body.youtubeChannelUrl || '').trim();
    const settings = await StoreSettings.findOneAndUpdate(
      { key: 'main' },
      { youtubeChannelUrl },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json({ youtubeChannelUrl: settings.youtubeChannelUrl || '' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/', async (_req, res) => {
  try {
    const items = await StoreMedia.find().sort({ type: 1, displayOrder: 1, createdAt: -1 });
    res.json(items.map(mapAdminItem));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/photos', async (req, res) => {
  try {
    const { imageUrl, title, displayOrder, isVisible } = req.body;
    if (!imageUrl || !String(imageUrl).trim()) {
      return res.status(400).json({ message: 'imageUrl is required' });
    }

    const photo = await StoreMedia.create({
      type: 'photo',
      imageUrl: String(imageUrl).trim(),
      title: String(title || '').trim(),
      displayOrder: Number(displayOrder) || 0,
      isVisible: isVisible !== false,
    });

    res.status(201).json(mapAdminItem(photo));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/videos', async (req, res) => {
  try {
    const videoId = extractYoutubeVideoId(req.body.videoId || req.body.youtubeUrl || req.body.url);
    if (!videoId) {
      return res.status(400).json({ message: 'Valid YouTube URL or video ID is required' });
    }

    const video = await StoreMedia.create({
      type: 'video',
      videoId,
      title: String(req.body.title || '').trim(),
      displayOrder: Number(req.body.displayOrder) || 0,
      isVisible: req.body.isVisible !== false,
    });

    res.status(201).json(mapAdminItem(video));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const item = await StoreMedia.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Media item not found' });

    if (req.body.title !== undefined) item.title = String(req.body.title).trim();
    if (req.body.displayOrder !== undefined) item.displayOrder = Number(req.body.displayOrder) || 0;
    if (req.body.isVisible !== undefined) item.isVisible = Boolean(req.body.isVisible);

    if (item.type === 'photo' && req.body.imageUrl !== undefined) {
      item.imageUrl = String(req.body.imageUrl).trim();
    }

    if (item.type === 'video') {
      const nextId = extractYoutubeVideoId(req.body.videoId || req.body.youtubeUrl || req.body.url);
      if (nextId) item.videoId = nextId;
    }

    await item.save();
    res.json(mapAdminItem(item));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.patch('/:id/visibility', async (req, res) => {
  try {
    const item = await StoreMedia.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Media item not found' });
    item.isVisible = req.body.isVisible !== undefined ? Boolean(req.body.isVisible) : !item.isVisible;
    await item.save();
    res.json(mapAdminItem(item));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const item = await StoreMedia.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Media item not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
module.exports.extractYoutubeVideoId = extractYoutubeVideoId;
