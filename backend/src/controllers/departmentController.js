const mongoose = require('mongoose');
const Department = require('../models/Department');
const { uploadImage } = require('../services/cloudinary');

exports.getAll = async (req, res) => {
  try {
    const { status, includeDrafts } = req.query || {};
    const query = { isActive: { $ne: false } };

    if (includeDrafts === 'true' || status === 'all') {
      // keep all statuses
    } else if (status) {
      query.status = status;
    } else {
      query.status = 'published';
    }

    const items = await Department.find(query)
      .select('name slug image heroImage coverImage images videos shortDescription description tagline order isActive status')
      .sort({ name: 1 });
    return res.json({ success: true, data: items });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};
// Alias for consumers expecting getDepartments
exports.getDepartments = exports.getAll;

exports.getOne = async (req, res) => {
  const { id } = req.params;

  try {
    const includeDrafts = req.query?.includeDrafts === 'true' || req.query?.status === 'all';
    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const item = isObjectId
      ? await Department.findById(id)
      : await Department.findOne({ slug: id });

    if (!item || (!includeDrafts && item.status !== 'published')) {
      return res.status(404).json({ success: false, message: 'Not Found' });
    }

    console.log('Department detail response:', item);
    return res.json({ success: true, data: item });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.create = async (req, res) => {
  try {
    const payload = { ...req.body };
    const { imageData } = payload;

    if (imageData) {
      try {
        const uploadedUrl = await uploadImage(imageData);
        const url = uploadedUrl?.secure_url || uploadedUrl?.url;
        payload.heroImage = url || payload.heroImage;
        payload.image = url || payload.image;
        payload.coverImage = url || payload.coverImage;
      } catch (uploadErr) {
        return res.status(500).json({ success: false, message: 'Image upload failed' });
      }
    }

    if (payload.heroImage && typeof payload.heroImage === 'object') {
      payload.heroImage = payload.heroImage.url || payload.heroImage.secure_url || '';
    }
    if (payload.image && typeof payload.image === 'object') {
      payload.image = payload.image.url || payload.image.secure_url || '';
    }
    if (payload.coverImage && typeof payload.coverImage === 'object') {
      payload.coverImage = payload.coverImage.url || payload.coverImage.secure_url || '';
    }

    delete payload.imageData;

    const newItem = await Department.create(payload);
    return res.status(201).json({ success: true, data: newItem });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.uploadImageOnly = async (req, res) => {
  const { imageData } = req.body || {};
  if (!imageData) {
    return res.status(400).json({ success: false, message: 'No image provided' });
  }

  try {
    const uploadedUrl = await uploadImage(imageData);
    return res.json({ success: true, url: uploadedUrl });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Image upload failed' });
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

    if (imageData) {
      try {
        const uploadedUrl = await uploadImage(imageData);
        const url = uploadedUrl?.secure_url || uploadedUrl?.url;
        payload.heroImage = url || payload.heroImage;
        payload.image = url || payload.image;
        payload.coverImage = url || payload.coverImage;
      } catch (uploadErr) {
        return res.status(500).json({ success: false, message: 'Image upload failed' });
      }
    }

    if (payload.heroImage && typeof payload.heroImage === 'object') {
      payload.heroImage = payload.heroImage.url || payload.heroImage.secure_url || '';
    }
    if (payload.image && typeof payload.image === 'object') {
      payload.image = payload.image.url || payload.image.secure_url || '';
    }
    if (payload.coverImage && typeof payload.coverImage === 'object') {
      payload.coverImage = payload.coverImage.url || payload.coverImage.secure_url || '';
    }

    delete payload.imageData;

    const updated = await Department.findByIdAndUpdate(id, payload, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Not Found' });
    }
    return res.json({ success: true, data: updated });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid ID' });
  }
  if (!['draft', 'published'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  try {
    const updated = await Department.findByIdAndUpdate(id, { status }, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Not Found' });
    }
    return res.json({ success: true, data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.remove = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid ID' });
  }

  try {
    const removed = await Department.findByIdAndDelete(id);
    if (!removed) {
      return res.status(404).json({ success: false, message: 'Not Found' });
    }
    return res.json({ success: true, data: removed });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};
