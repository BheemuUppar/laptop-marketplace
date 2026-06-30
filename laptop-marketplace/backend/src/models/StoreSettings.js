const mongoose = require('mongoose');

const storeSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, default: 'main' },
    youtubeChannelUrl: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('StoreSettings', storeSettingsSchema);
