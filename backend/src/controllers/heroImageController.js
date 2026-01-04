const HeroImage = require('../models/HeroImage');

exports.list = async (_req, res) => {
  try {
    const items = await HeroImage.find().sort({ order: 1, createdAt: 1 });
    return res.json({ success: true, data: items });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.create = async (req, res) => {
  try {
    const { url, caption } = req.body || {};
    if (!url) {
      return res.status(400).json({ success: false, message: 'Image URL is required' });
    }
    const last = await HeroImage.findOne().sort({ order: -1 });
    const nextOrder = last ? (last.order || 0) + 1 : 0;
    const item = await HeroImage.create({ url, caption: caption || '', order: nextOrder });
    return res.status(201).json({ success: true, data: item });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await HeroImage.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Not found' });
    return res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

exports.reorder = async (req, res) => {
  try {
    const { order = [] } = req.body || {};
    if (!Array.isArray(order) || !order.length) {
      return res.status(400).json({ success: false, message: 'Order array required' });
    }
    await Promise.all(
      order.map((item, idx) => {
        const id = item.id || item._id || item;
        const ord = typeof item.order === 'number' ? item.order : idx;
        return HeroImage.findByIdAndUpdate(id, { order: ord });
      })
    );
    const items = await HeroImage.find().sort({ order: 1, createdAt: 1 });
    return res.json({ success: true, data: items });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};
