const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    brand: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    processor: { type: String, required: true },
    generation: { type: String, default: '' },
    ram: { type: String, required: true },
    storage: { type: String, required: true },
    graphics: { type: String, default: '' },
    displaySize: { type: String, required: true },
    batteryHealth: { type: Number, min: 0, max: 100, default: 80 },
    condition: { type: String, enum: ['Excellent', 'Good', 'Fair'], required: true },
    warrantyMonths: { type: Number, min: 0, default: 0 },
    quantityAvailable: { type: Number, min: 0, default: 1 },
    sellingPrice: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, min: 0 },
    description: { type: String, default: '' },
    images: [{ type: String }],
    featured: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.index({ brand: 1, isAvailable: 1 });
productSchema.index({ featured: 1, isAvailable: 1 });

module.exports = mongoose.model('Product', productSchema);
