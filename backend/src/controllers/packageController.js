const mongoose = require('mongoose');
const Package = require('../models/Package');
const { uploadImage, deleteImage } = require('../services/cloudinary');
const { createPackageSchema } = require('../utils/validation');

function normalizeIncluded(included) {
  if (!included) return [];
  if (Array.isArray(included)) return included.filter(Boolean).map((i) => i.trim()).filter(Boolean);
  return included
    .toString()
    .split(/\r?\n|,/)
    .map((i) => i.trim())
    .filter(Boolean);
}

function normalizeDepartments(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw
      .map((item) => (typeof item === 'object' && item !== null ? item._id || item.id || item.value : item))
      .filter(Boolean);
  }
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.filter(Boolean);
    } catch (_) {
      // not JSON, continue
    }
    return raw
      .split(/[,\\n]+/)
      .map((v) => v.trim())
      .filter(Boolean);
  }
  return [];
}

function validatePayload(raw) {
  const payload = { ...raw };

  if (payload.description && !payload.longDescription) {
    payload.longDescription = payload.description;
  }

  if (typeof payload.slug !== 'undefined' && payload.slug !== null) {
    payload.slug = payload.slug.toString();
  }
  if (typeof payload.price === 'string') payload.price = Number(payload.price);
  if (typeof payload.duration === 'string') payload.duration = Number(payload.duration);
  if (typeof payload.departments === 'string') payload.departments = [payload.departments];
  if (typeof payload.included === 'string') payload.included = [payload.included];

  const parsed = createPackageSchema.safeParse(payload);
  if (!parsed.success) {
    console.error('Package validation error:', parsed.error.format());
    return { error: parsed.error.format() };
  }

  const parsedData = parsed.data;

  const includedRaw = parsedData.included ?? payload['included[]'];
  parsedData.included = normalizeIncluded(includedRaw);

  const departmentsRaw = parsedData.departments ?? payload['departments[]'];
  parsedData.departments = normalizeDepartments(departmentsRaw);

  return { data: parsedData };
}

exports.getAll = async (_req, res) => {
  try {
    const items = await Package.find().populate('departments', 'name slug');
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
    const item = await Package.findById(id).populate('departments', 'name slug');

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
    console.log('Create package request body:', req.body);
    if (req.file) {
      console.log('Create package file:', {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
      });
    }

    const { data, error } = validatePayload(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error,
      });
    }

    const payloadToSave = { ...data };

    const slugInput = payloadToSave.slug;
    if (!slugInput) {
      return res.status(400).json({ success: false, message: 'Slug is required' });
    }
    const slug = slugify(slugInput, { lower: true, strict: true });
    if (!slug) {
      return res.status(400).json({ success: false, message: 'Unable to generate slug' });
    }
    payloadToSave.slug = slug;

    if (!Array.isArray(payloadToSave.departments) || payloadToSave.departments.length === 0) {
      return res.status(400).json({ success: false, message: 'Select at least one department' });
    }

    if (req.file) {
      const fileStr = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      const uploadRes = await uploadImage(fileStr, 'packages');
      payloadToSave.imageUrl = uploadRes?.secure_url || uploadRes?.url;
      payloadToSave.imagePublicId = uploadRes?.public_id;
    }

    console.log('SAVING SLUG:', payloadToSave.slug);

    const newItem = await Package.create({
      name: payloadToSave.name,
      slug: payloadToSave.slug,
      price: payloadToSave.price,
      duration: payloadToSave.duration,
      shortDescription: payloadToSave.shortDescription,
      longDescription: payloadToSave.longDescription,
      description: payloadToSave.longDescription || payloadToSave.description,
      included: payloadToSave.included,
      departments: payloadToSave.departments,
      imageUrl: payloadToSave.imageUrl,
      imagePublicId: payloadToSave.imagePublicId,
    });
    return res.status(201).json({ success: true, data: newItem });
  } catch (error) {
    console.error('Create package error:', error);
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid ID' });
  }

  try {
    const existing = await Package.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Not Found' });
    }

    const { data, error } = validatePayload(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error,
      });
    }

    const payloadToSave = { ...existing.toObject(), ...data };
    const departments = payloadToSave.departments?.length ? payloadToSave.departments : existing.departments;

    const slugInput = payloadToSave.slug || existing.slug;
    if (!slugInput) {
      return res.status(400).json({ success: false, message: 'Slug is required' });
    }
    const slug = slugify(slugInput, { lower: true, strict: true });
    if (!slug) {
      return res.status(400).json({ success: false, message: 'Unable to generate slug' });
    }
    payloadToSave.slug = slug;

    if (!Array.isArray(departments) || departments.length === 0) {
      return res.status(400).json({ success: false, message: 'Select at least one department' });
    }

    if (req.file) {
      if (existing.imagePublicId) {
        await deleteImage(existing.imagePublicId);
      }
      const fileStr = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      const uploadRes = await uploadImage(fileStr, 'packages');
      payloadToSave.imageUrl = uploadRes?.secure_url || uploadRes?.url;
      payloadToSave.imagePublicId = uploadRes?.public_id;
    }

    const updated = await Package.findByIdAndUpdate(
      id,
      { ...payloadToSave, departments },
      { new: true }
    ).populate('departments', 'name slug');
    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Update package error:', error);
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
    console.error('Delete package error:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};
const slugify = require('slugify');
