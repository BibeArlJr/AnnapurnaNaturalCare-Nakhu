const mongoose = require('mongoose');

const GalleryItemSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['image', 'video'], default: 'image' },
    url: { type: String, required: true },
    public_id: { type: String },
    caption: { type: String },
    title: { type: String },
    description: { type: String },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('GalleryItem', GalleryItemSchema);
