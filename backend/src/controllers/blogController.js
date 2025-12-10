const mongoose = require('mongoose');
const Blog = require('../models/Blog');
const BlogCategory = require('../models/BlogCategory');
const { uploadImage } = require('../services/cloudinary');

exports.getAll = async (req, res) => {
  try {
    const items = await Blog.find().populate('categoryId', 'name slug');
    return res.json({ success: true, data: items });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getOne = async (req, res) => {
  const { id } = req.params;

  try {
    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const item = isObjectId
      ? await Blog.findById(id).populate('categoryId', 'name slug')
      : await Blog.findOne({ slug: id }).populate('categoryId', 'name slug');

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
    const payload = { ...req.body };
    const { imageData } = payload;
    if (payload.categoryId) {
      const exists = await BlogCategory.findById(payload.categoryId);
      if (!exists) {
        return res.status(400).json({ success: false, message: 'Invalid category' });
      }
    }

    if (imageData) {
      try {
        const uploadedUrl = await uploadImage(imageData, 'blogs');
        payload.coverImage = uploadedUrl;
      } catch (err) {
        return res.status(500).json({ success: false, message: 'Image upload failed' });
      }
    }

    delete payload.imageData;

    const newItem = await Blog.create(payload);
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
    const payload = { ...req.body };
    const { imageData } = payload;
    if (payload.categoryId) {
      const exists = await BlogCategory.findById(payload.categoryId);
      if (!exists) {
        return res.status(400).json({ success: false, message: 'Invalid category' });
      }
    }

    if (imageData) {
      try {
        const uploadedUrl = await uploadImage(imageData, 'blogs');
        payload.coverImage = uploadedUrl;
      } catch (err) {
        return res.status(500).json({ success: false, message: 'Image upload failed' });
      }
    }

    delete payload.imageData;

    const updated = await Blog.findByIdAndUpdate(id, payload, { new: true });
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
    const removed = await Blog.findByIdAndDelete(id);
    if (!removed) {
      return res.status(404).json({ success: false, message: 'Not Found' });
    }
    return res.json({ success: true, data: removed });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};
