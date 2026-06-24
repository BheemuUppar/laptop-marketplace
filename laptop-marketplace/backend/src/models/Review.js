const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true, trim: true },
    customerRole: { type: String, trim: true, default: '' },
    customerCompany: { type: String, trim: true, default: '' },
    customerImage: { type: String, trim: true, default: '' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    reviewText: { type: String, required: true, trim: true },
    isVisible: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

reviewSchema.index({ isVisible: 1, displayOrder: 1, createdAt: -1 });
reviewSchema.index({ isVisible: 1, isFeatured: 1, displayOrder: 1 });

module.exports = mongoose.model('Review', reviewSchema);
