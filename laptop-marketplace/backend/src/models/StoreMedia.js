const mongoose = require('mongoose');

const storeMediaSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['photo', 'video'], required: true },
    title: { type: String, trim: true, default: '' },
    imageUrl: { type: String, trim: true, default: '' },
    videoId: { type: String, trim: true, default: '' },
    isVisible: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

storeMediaSchema.index({ type: 1, isVisible: 1, displayOrder: 1 });

module.exports = mongoose.model('StoreMedia', storeMediaSchema);
