const mongoose = require('mongoose');
const PatientReview = require('../models/PatientReview');
const { uploadImage } = require('../services/cloudinary');

function toArrayField(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean).map((v) => v.toString().trim()).filter(Boolean);
  if (typeof value === 'string') return value.split(/[\n,]+/).map((v) => v.trim()).filter(Boolean);
  return [];
}

function normalizeImages(raw) {
  if (!raw) return [];
  let parsed = raw;
  if (typeof raw === 'string') {
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      parsed = raw.split(',').map((url) => ({ url: url.trim() })).filter((i) => i.url);
    }
  }
  if (!Array.isArray(parsed)) return [];
  return parsed
    .map((item) => {
      if (!item) return null;
      if (typeof item === 'string') return { url: item };
      return { url: item.url || item.src || '', caption: item.caption || '' };
    })
    .filter((item) => item && item.url)
    .slice(0, 10);
}

exports.getAll = async (req, res) => {
  try {
    const query = {};
    const statusQuery = req.query.status;
    if (statusQuery && statusQuery !== 'all') {
      query.status = statusQuery;
    } else if (!statusQuery) {
      query.status = 'published';
    }
    const items = await PatientReview.find(query).sort({ publishedAt: -1, createdAt: -1 });
    return res.json({ success: true, data: items });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getOne = async (req, res) => {
  try {
    const { id } = req.params;
    const allowDraft = req.query.includeDrafts === 'true' || req.query.status === 'all';
    let item = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      item = await PatientReview.findById(id);
    }
    if (!item) {
      item = await PatientReview.findOne({ slug: id });
    }
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    if (!allowDraft && item.status !== 'published') {
      return res.status(404).json({ success: false, message: 'Not found' });
    }
    return res.json({ success: true, data: item });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.create = async (req, res) => {
  try {
    const payload = { ...req.body };
    let photo = payload.photo;
    if (req.file) {
      const fileStr = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      const uploaded = await uploadImage(fileStr, 'patient-reviews');
      photo = uploaded?.secure_url || uploaded?.url || photo;
    }

    const images = normalizeImages(payload.images);
    const coverImage = payload.coverImage || '';
    const videoUrl = payload.videoUrl || '';
    const videoCoverImage = payload.videoCoverImage || '';
    const associatedProgram = payload.associatedProgram || '';
    const associatedId = payload.associatedId || undefined;
    const associatedType = ['retreat', 'health'].includes(payload.associatedType) ? payload.associatedType : undefined;

    const newItem = await PatientReview.create({
      patientName: payload.patientName,
      country: payload.country,
      photo,
      coverImage,
      headline: payload.headline,
      fullReview: payload.fullReview,
      rating: Number(payload.rating) || 5,
      associatedProgram,
      associatedId,
      associatedType,
      images,
      videoUrl,
      videoCoverImage,
      publishedAt: payload.publishedAt || (payload.status === 'published' ? new Date() : undefined),
      status: payload.status || 'draft',
    });
    return res.status(201).json({ success: true, data: newItem });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID' });
    }
    const existing = await PatientReview.findById(id);
    if (!existing) return res.status(404).json({ success: false, message: 'Not found' });

    let photo = req.body.photo ?? existing.photo;
    if (req.file) {
      const fileStr = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      const uploaded = await uploadImage(fileStr, 'patient-reviews');
      photo = uploaded?.secure_url || uploaded?.url || photo;
    }

    const images = normalizeImages(req.body.images ?? existing.images);
    const coverImage = req.body.coverImage ?? existing.coverImage;
    const videoUrl = req.body.videoUrl ?? existing.videoUrl;
    const videoCoverImage = req.body.videoCoverImage ?? existing.videoCoverImage;
    const associatedProgram = req.body.associatedProgram ?? existing.associatedProgram;
    const associatedId =
      req.body.associatedId === ''
        ? undefined
        : req.body.associatedId ?? existing.associatedId;
    const associatedType = ['retreat', 'health'].includes(req.body.associatedType)
      ? req.body.associatedType
      : req.body.associatedType === ''
      ? undefined
      : existing.associatedType;

    const updated = await PatientReview.findByIdAndUpdate(
      id,
      {
        patientName: req.body.patientName ?? existing.patientName,
        country: req.body.country ?? existing.country,
        photo,
        coverImage,
        headline: req.body.headline ?? existing.headline,
        fullReview: req.body.fullReview ?? existing.fullReview,
        rating: req.body.rating ?? existing.rating,
        associatedProgram,
        associatedId,
        associatedType,
        images,
        videoUrl,
        videoCoverImage,
        publishedAt:
          req.body.publishedAt ??
          (existing.publishedAt ? existing.publishedAt : req.body.status === 'published' ? new Date() : existing.publishedAt),
        status: req.body.status ?? existing.status,
      },
      { new: true }
    );
    return res.json({ success: true, data: updated });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID' });
    }
    const removed = await PatientReview.findByIdAndDelete(id);
    if (!removed) return res.status(404).json({ success: false, message: 'Not found' });
    return res.json({ success: true, data: removed });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
