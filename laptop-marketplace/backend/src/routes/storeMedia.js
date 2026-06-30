const express = require('express');
const StoreMedia = require('../models/StoreMedia');
const StoreSettings = require('../models/StoreSettings');

const router = express.Router();

function mapPhoto(doc) {
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    id: obj._id.toString(),
    src: obj.imageUrl,
    alt: obj.title || 'Store photo',
    displayOrder: obj.displayOrder,
  };
}

function mapVideo(doc) {
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    id: obj._id.toString(),
    videoId: obj.videoId,
    title: obj.title || 'Store video',
    displayOrder: obj.displayOrder,
  };
}

router.get('/', async (_req, res) => {
  try {
    const [photos, videos, settings] = await Promise.all([
      StoreMedia.find({ type: 'photo', isVisible: true }).sort({ displayOrder: 1, createdAt: -1 }),
      StoreMedia.find({ type: 'video', isVisible: true }).sort({ displayOrder: 1, createdAt: -1 }),
      StoreSettings.findOne({ key: 'main' }),
    ]);

    res.json({
      photos: photos.map(mapPhoto),
      videos: videos.map(mapVideo),
      youtubeChannelUrl: settings?.youtubeChannelUrl || '',
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
module.exports.mapPhoto = mapPhoto;
module.exports.mapVideo = mapVideo;
