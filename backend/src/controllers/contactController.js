const mongoose = require('mongoose');
const ContactMessage = require('../models/ContactMessage');

exports.getAll = async (req, res) => {
  try {
    const items = await ContactMessage.find();
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
    const item = await ContactMessage.findById(id);
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
    const newItem = await ContactMessage.create(req.body);
    return res.status(201).json({ success: true, data: newItem });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  return res.status(400).json({ success: false, message: 'Update not supported' });
};

exports.remove = async (req, res) => {
  return res.status(400).json({ success: false, message: 'Delete not supported' });
};
