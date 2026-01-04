const PartnerHotel = require('../models/PartnerHotel');

exports.list = async (_req, res) => {
  try {
    const items = await PartnerHotel.find().sort({ location: 1, starRating: 1 });
    return res.json({ success: true, data: items });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.listPublic = async (_req, res) => {
  try {
    const items = await PartnerHotel.find({ isActive: true }).sort({ location: 1, starRating: 1 });
    return res.json({ success: true, data: items });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.create = async (req, res) => {
  try {
    const payload = { ...req.body };
    const item = await PartnerHotel.create(payload);
    return res.status(201).json({ success: true, data: item });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await PartnerHotel.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Not found' });
    return res.json({ success: true, data: updated });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await PartnerHotel.findByIdAndDelete(req.params.id);
    return res.json({ success: true });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};
