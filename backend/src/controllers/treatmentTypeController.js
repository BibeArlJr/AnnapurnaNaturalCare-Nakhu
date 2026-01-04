const TreatmentType = require('../models/TreatmentType');
const slugify = require('slugify');

exports.getAllTreatmentTypes = async (_req, res) => {
  try {
    const items = await TreatmentType.find().sort({ name: 1 });
    return res.json({ success: true, data: items });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.createTreatmentType = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    const item = await TreatmentType.create({
      name: name.trim(),
      slug: slugify(name, { lower: true }),
    });
    return res.status(201).json({ success: true, data: item });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateTreatmentType = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, isActive } = req.body;
    const payload = {};
    if (name) {
      payload.name = name.trim();
      payload.slug = slugify(name, { lower: true });
    }
    if (typeof isActive !== 'undefined') {
      payload.isActive = isActive;
    }
    const item = await TreatmentType.findByIdAndUpdate(id, payload, { new: true });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }
    return res.json({ success: true, data: item });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteTreatmentType = async (req, res) => {
  try {
    await TreatmentType.findByIdAndDelete(req.params.id);
    return res.json({ success: true });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};
