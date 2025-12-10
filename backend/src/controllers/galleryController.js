const mongoose = require('mongoose');
const GalleryItem = require('../models/GalleryItem');
const { uploadImage, deleteImage } = require('../services/cloudinary');

exports.getAll = async (req, res) => {
  try {
    const items = await GalleryItem.find().sort({ createdAt: -1 });
    return res.json({ success: true, data: items });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getOne = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid ID' });
  }

  try {
    const item = await GalleryItem.findById(id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Not Found' });
    }

    return res.json({ success: true, data: item });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.create = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file provided' });
    }

    const fileStr = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    const uploadRes = await uploadImage(fileStr, 'gallery');

    const newItem = await GalleryItem.create({
      url: uploadRes?.secure_url || uploadRes?.url,
      public_id: uploadRes?.public_id,
      caption: req.body.caption || '',
      type: 'image',
    });

    return res.status(201).json({ success: true, data: newItem });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid ID' });
  }

  try {
    const updated = await GalleryItem.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Not Found' });
    }
    return res.json({ success: true, data: updated });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.remove = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid ID' });
  }

  try {
    const item = await GalleryItem.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Not Found' });
    }

    if (item.public_id) {
      await deleteImage(item.public_id);
    }

    await GalleryItem.findByIdAndDelete(id);
    return res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};
