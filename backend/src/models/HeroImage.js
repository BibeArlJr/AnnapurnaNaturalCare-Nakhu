const mongoose = require('mongoose');

const HeroImageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },
    caption: {
      type: String,
      default: '',
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('HeroImage', HeroImageSchema, 'heroimages');
