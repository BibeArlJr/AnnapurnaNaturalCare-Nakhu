const mongoose = require('mongoose');
const BlogCategory = require('../models/BlogCategory');

exports.getAll = async (_req, res) => {
  try {
    const items = await BlogCategory.find().sort({ createdAt: -1 });
    return res.json({ success: true, data: items });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.create = async (req, res) => {
  try {
    const payload = { ...req.body };
    const newItem = await BlogCategory.create(payload);
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
    const updated = await BlogCategory.findByIdAndUpdate(id, req.body, { new: true });
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
    const Blog = require('../models/Blog');
    const usageCount = await Blog.countDocuments({ categoryId: id });
    if (usageCount > 0) {
      return res
        .status(400)
        .json({ success: false, message: 'Cannot delete category. It is assigned to existing blog posts.' });
    }

    const removed = await BlogCategory.findByIdAndDelete(id);
    if (!removed) {
      return res.status(404).json({ success: false, message: 'Not Found' });
    }
    return res.json({ success: true, data: removed });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};
