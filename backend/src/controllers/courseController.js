const Course = require('../models/Course');
const slugify = require('slugify');

const normalizeSyllabus = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw) && raw.length && typeof raw[0] === 'object' && raw[0].topic) {
    return raw.map((t) => ({
      topic: t.topic,
      items: Array.isArray(t.items) ? t.items.filter((i) => i && i.trim()) : [],
    }));
  }
  // legacy array of strings
  const list = Array.isArray(raw) ? raw : [raw];
  const items = list.map((i) => (typeof i === 'string' ? i.trim() : '')).filter(Boolean);
  if (!items.length) return [];
  return [{ topic: 'General', items }];
};

exports.listPublic = async (_req, res) => {
  try {
    const items = await Course.find({ isPublished: true }).sort({ createdAt: -1 });
    return res.json({ success: true, data: items });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.list = async (_req, res) => {
  try {
    const items = await Course.find().sort({ createdAt: -1 });
    return res.json({ success: true, data: items });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getBySlug = async (req, res) => {
  try {
    const item = await Course.findOne({ slug: req.params.slug, isPublished: true });
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    return res.json({ success: true, data: item });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.create = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (payload.title && !payload.slug) {
      payload.slug = slugify(payload.title, { lower: true, strict: true });
    }
    if (payload.syllabus) payload.syllabus = normalizeSyllabus(payload.syllabus);
    const item = await Course.create(payload);
    return res.status(201).json({ success: true, data: item });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = { ...req.body };
    if (payload.title && !payload.slug) {
      payload.slug = slugify(payload.title, { lower: true, strict: true });
    }
    if (payload.syllabus) payload.syllabus = normalizeSyllabus(payload.syllabus);
    const item = await Course.findByIdAndUpdate(id, payload, { new: true });
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    return res.json({ success: true, data: item });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    return res.json({ success: true });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};
