const RetreatDestination = require('../models/RetreatDestination');

exports.createDestination = async (req, res) => {
  try {
    const { name, type } = req.body || {};
    if (!name || !type) {
      return res.status(400).json({ success: false, message: 'Name and type are required' });
    }
    const existing = await RetreatDestination.findOne({ name: name.trim(), type });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Destination already exists for this category' });
    }
    const item = await RetreatDestination.create({ name: name.trim(), type });
    return res.status(201).json({ success: true, data: item });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

exports.getDestinations = async (req, res) => {
  try {
    const { type } = req.query || {};
    const filter = {};
    if (type) filter.type = type;
    const items = await RetreatDestination.find(filter).sort({ name: 1 });
    return res.json({ success: true, data: items });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.updateDestination = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, isActive } = req.body || {};
    const item = await RetreatDestination.findById(id);
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });

    if (name) item.name = name.trim();
    if (type) item.type = type;
    if (typeof isActive !== 'undefined') item.isActive = isActive;

    if (item.name && item.type) {
      const dup = await RetreatDestination.findOne({
        _id: { $ne: id },
        name: item.name,
        type: item.type,
      });
      if (dup) {
        return res.status(400).json({ success: false, message: 'Destination already exists for this category' });
      }
    }

    const saved = await item.save();
    return res.json({ success: true, data: saved });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

exports.toggleDestination = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await RetreatDestination.findById(id);
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    item.isActive = !item.isActive;
    const saved = await item.save();
    return res.json({ success: true, data: saved });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteDestination = async (req, res) => {
  try {
    await RetreatDestination.findByIdAndDelete(req.params.id);
    return res.json({ success: true });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};
