const mongoose = require('mongoose');

const MASTER_TYPES = [
  'brand',
  'processor',
  'ram',
  'storage',
  'graphics',
  'screenSize',
  'condition',
  'os',
  'laptopType',
  'warranty',
  'color',
];

const masterSchema = new mongoose.Schema(
  {
    type: { type: String, required: true, enum: MASTER_TYPES, index: true },
    value: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

masterSchema.index({ type: 1, value: 1 }, { unique: true });
masterSchema.index({ type: 1, isActive: 1, displayOrder: 1 });

function mapMaster(doc) {
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    id: obj._id.toString(),
    type: obj.type,
    value: obj.value,
    description: obj.description || '',
    displayOrder: obj.displayOrder ?? 0,
    isActive: obj.isActive !== false,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
  };
}

module.exports = mongoose.model('Master', masterSchema);
module.exports.MASTER_TYPES = MASTER_TYPES;
module.exports.mapMaster = mapMaster;
