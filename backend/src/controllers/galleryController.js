const mongoose = require('mongoose');
const Gallery = require('../models/Gallery');

function normalizeMediaArray(arr = []) {
  return (arr || [])
    .map((item) => {
      if (!item) return null;
      if (typeof item === 'string') return item;
      if (typeof item === 'object' && (item.secure_url || item.url)) {
        return item.secure_url || item.url;
      }
      return null;
    })
    .filter(Boolean);
}

function normalizeLinks(arr = []) {
  return (arr || [])
    .map((item) => (item || '').toString().trim())
    .filter(Boolean);
}

exports.getAll = async (req, res) => {
  try {
    const items = await Gallery.find().sort({ createdAt: -1 });
    return res.json({ success: true, data: items });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getOne = async (req, res) => {
  const { id } = req.params;

  try {
    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const item = isObjectId ? await Gallery.findById(id) : await Gallery.findOne({ slug: id });

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
    const images = normalizeMediaArray(payload.images);
    const videos = normalizeMediaArray(payload.videos);
    const youtubeLinks = normalizeLinks(payload.youtubeLinks);

    if (!payload.title) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }
    if (!images.length && !videos.length && !youtubeLinks.length) {
      return res.status(400).json({
        success: false,
        message: 'Provide at least one image, video, or YouTube link',
      });
    }

    const newItem = await Gallery.create({
      title: payload.title,
      slug: payload.slug,
      description: payload.description || '',
      images,
      videos,
      youtubeLinks,
    });

    return res.status(201).json({ success: true, data: newItem });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  const { id } = req.params;

  try {
    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const existing = isObjectId ? await Gallery.findById(id) : await Gallery.findOne({ slug: id });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Not Found' });
    }

    const payload = { ...req.body };
    const images = normalizeMediaArray(payload.images ?? existing.images);
    const videos = normalizeMediaArray(payload.videos ?? existing.videos);
    const youtubeLinks = normalizeLinks(payload.youtubeLinks ?? existing.youtubeLinks);

    if (!payload.title && !existing.title) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }
    if (!images.length && !videos.length && !youtubeLinks.length) {
      return res.status(400).json({
        success: false,
        message: 'Provide at least one image, video, or YouTube link',
      });
    }

    existing.title = payload.title ?? existing.title;
    existing.slug = payload.slug ?? existing.slug;
    existing.description = payload.description ?? existing.description;
    existing.images = images;
    existing.videos = videos;
    existing.youtubeLinks = youtubeLinks;

    const updated = await existing.save();

    return res.json({ success: true, data: updated });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.remove = async (req, res) => {
  const { id } = req.params;

  try {
    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const item = isObjectId ? await Gallery.findById(id) : await Gallery.findOne({ slug: id });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Not Found' });
    }

    await Gallery.deleteOne({ _id: item._id });
    return res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};
