const mongoose = require('mongoose');
const Package = require('../models/Package');
const { uploadImage, deleteImage } = require('../services/cloudinary');

function normalizeIncluded(included) {
  if (!included) return [];
  if (Array.isArray(included)) return included.filter(Boolean).map((i) => i.trim()).filter(Boolean);
  return included
    .split(/\r?\n|,/)
    .map((i) => i.trim())
    .filter(Boolean);
}

exports.getAll = async (_req, res) => {
  try {
    const items = await Package.find().populate('departmentId', 'name');
    return res.json({ success: true, data: items });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getOne = async (req, res) => {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID' });
    }
    const item = await Package.findById(id).populate('departmentId', 'name');

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
    payload.included = normalizeIncluded(payload.included);
    if (payload.price !== undefined) payload.price = Number(payload.price);

    if (req.file) {
      const fileStr = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      const uploadRes = await uploadImage(fileStr, 'packages');
      payload.imageUrl = uploadRes?.secure_url || uploadRes?.url;
      payload.imagePublicId = uploadRes?.public_id;
    }

    const newItem = await Package.create(payload);
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
    payload.included = normalizeIncluded(payload.included);
    if (payload.price !== undefined) payload.price = Number(payload.price);

    const existing = await Package.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Not Found' });
    }

    if (req.file) {
      if (existing.imagePublicId) {
        await deleteImage(existing.imagePublicId);
      }
      const fileStr = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      const uploadRes = await uploadImage(fileStr, 'packages');
      payload.imageUrl = uploadRes?.secure_url || uploadRes?.url;
      payload.imagePublicId = uploadRes?.public_id;
    }

    const updated = await Package.findByIdAndUpdate(id, payload, { new: true });
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
    const item = await Package.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Not Found' });
    }

    if (item.imagePublicId) {
      await deleteImage(item.imagePublicId);
    }

    await Package.findByIdAndDelete(id);
    return res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};
