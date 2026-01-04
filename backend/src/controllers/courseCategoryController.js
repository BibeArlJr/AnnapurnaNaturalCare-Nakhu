const CourseCategory = require('../models/CourseCategory');
const Course = require('../models/Course');
const slugify = require('slugify');

exports.list = async (_req, res) => {
  try {
    const items = await CourseCategory.find().sort({ createdAt: -1 });
    return res.json({ success: true, data: items });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.listActive = async (_req, res) => {
  try {
    const items = await CourseCategory.find({ status: 'active' }).sort({ name: 1 });
    return res.json({ success: true, data: items });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.create = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (payload.name && !payload.slug) {
      payload.slug = slugify(payload.name, { lower: true, strict: true });
    }
    const exists = await CourseCategory.findOne({ $or: [{ name: payload.name }, { slug: payload.slug }] });
    if (exists) return res.status(400).json({ success: false, message: 'Category with this name/slug already exists' });
    const item = await CourseCategory.create(payload);
    return res.status(201).json({ success: true, data: item });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = { ...req.body };
    if (payload.name && !payload.slug) {
      payload.slug = slugify(payload.name, { lower: true, strict: true });
    }
    const exists = await CourseCategory.findOne({
      _id: { $ne: id },
      $or: [{ name: payload.name }, { slug: payload.slug }],
    });
    if (exists) return res.status(400).json({ success: false, message: 'Category with this name/slug already exists' });
    const item = await CourseCategory.findByIdAndUpdate(id, payload, { new: true });
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    return res.json({ success: true, data: item });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const inUse = await Course.findOne({ category: id });
    if (inUse) return res.status(400).json({ success: false, message: 'Cannot delete: category in use by courses' });
    await CourseCategory.findByIdAndDelete(id);
    return res.json({ success: true });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};
