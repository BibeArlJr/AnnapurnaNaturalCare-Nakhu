const mongoose = require('mongoose');
const Blog = require('../models/Blog');
const BlogCategory = require('../models/BlogCategory');
const { uploadImage } = require('../services/cloudinary');

const ALLOWED_CATEGORIES = ['Wellness', 'Therapy', 'Rehab', 'Lifestyle', 'Ayurveda', 'Yoga'];

function toArrayField(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean).map((v) => v.toString().trim()).filter(Boolean);
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.filter(Boolean).map((v) => v.toString().trim()).filter(Boolean);
    } catch (_) {
      // not JSON, fall back to splitting
    }
    return value
      .split(/[\n,]+/)
      .map((v) => v.trim())
      .filter(Boolean);
  }
  return [];
}

function dedupe(list = []) {
  return [...new Set(list.filter(Boolean))];
}

async function uploadFiles(files = [], folder, resourceType = 'image') {
  if (!files.length) return [];
  const options = resourceType === 'video' ? { resource_type: 'video' } : {};
  const uploads = await Promise.all(
    files.map(async (file) => {
      const fileStr = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      const uploaded = await uploadImage(fileStr, folder, options);
      return uploaded?.secure_url || uploaded?.url;
    })
  );
  return uploads.filter(Boolean);
}

exports.getAll = async (req, res) => {
  try {
    const items = await Blog.find().populate('categoryId', 'name slug');
    return res.json({ success: true, data: items });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getOne = async (req, res) => {
  const { id } = req.params;

  try {
    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const item = isObjectId
      ? await Blog.findById(id).populate('categoryId', 'name slug')
      : await Blog.findOne({ slug: id }).populate('categoryId', 'name slug');

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
    const category =
      typeof payload.category === 'string' && payload.category.trim() ? payload.category.trim() : undefined;
    const hasCategory = Boolean(category);
    if (hasCategory && !ALLOWED_CATEGORIES.includes(category)) {
      return res.status(400).json({ success: false, message: 'Invalid category' });
    }

    let categoryIdToUse = null;
    if (payload.categoryId) {
      const exists = await BlogCategory.findById(payload.categoryId);
      if (!exists) {
        return res.status(400).json({ success: false, message: 'Invalid category' });
      }
      categoryIdToUse = payload.categoryId;
    }

    const providedImages = toArrayField(payload.images);
    const providedVideos = toArrayField(payload.videos);
    const youtubeLinks = toArrayField(payload.youtubeLinks);

    let uploadedImages = [];
    let uploadedVideos = [];
    try {
      uploadedImages = await uploadFiles(req.files?.imageFiles, 'blogs');
      uploadedVideos = await uploadFiles(req.files?.videoFiles, 'blogs/videos', 'video');
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Media upload failed' });
    }

    const newItem = await Blog.create({
      title: payload.title,
      slug: payload.slug,
      categoryId: categoryIdToUse,
      category,
      images: dedupe([...providedImages, ...uploadedImages]),
      videos: dedupe([...providedVideos, ...uploadedVideos]),
      youtubeLinks,
      shortDescription: payload.shortDescription || '',
      content: payload.content,
      status: payload.status,
    });
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
    const category =
      typeof payload.category === 'string' && payload.category.trim() ? payload.category.trim() : undefined;
    const hasCategory = Boolean(category);
    if (hasCategory && !ALLOWED_CATEGORIES.includes(category)) {
      return res.status(400).json({ success: false, message: 'Invalid category' });
    }

    let categoryIdToUse = null;
    if (payload.categoryId) {
      const exists = await BlogCategory.findById(payload.categoryId);
      if (!exists) {
        return res.status(400).json({ success: false, message: 'Invalid category' });
      }
      categoryIdToUse = payload.categoryId;
    }

    const existing = await Blog.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Not Found' });
    }

    const providedImages = toArrayField(payload.images);
    const providedVideos = toArrayField(payload.videos);
    const providedYoutubeLinks = toArrayField(payload.youtubeLinks);
    const newYoutubeLinks = toArrayField(payload.newYoutubeLinks);

    const removeExistingImages = new Set(toArrayField(payload.removeExistingImages));
    const removeExistingVideos = new Set(toArrayField(payload.removeExistingVideos));
    const removeExistingYoutubeLinks = new Set(toArrayField(payload.removeExistingYoutubeLinks));

    let uploadedImages = [];
    let uploadedVideos = [];
    try {
      uploadedImages = await uploadFiles(req.files?.imageFiles, 'blogs');
      uploadedVideos = await uploadFiles(req.files?.videoFiles, 'blogs/videos', 'video');
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Media upload failed' });
    }

    let images = providedImages.length ? providedImages : existing.images || [];
    if (removeExistingImages.size) {
      images = images.filter((url) => !removeExistingImages.has(url));
    }
    images = dedupe([...images, ...uploadedImages]);

    let videos = providedVideos.length ? providedVideos : existing.videos || [];
    if (removeExistingVideos.size) {
      videos = videos.filter((url) => !removeExistingVideos.has(url));
    }
    videos = dedupe([...videos, ...uploadedVideos]);

    let youtubeLinks = providedYoutubeLinks.length ? providedYoutubeLinks : existing.youtubeLinks || [];
    if (removeExistingYoutubeLinks.size) {
      youtubeLinks = youtubeLinks.filter((url) => !removeExistingYoutubeLinks.has(url));
    }
    youtubeLinks = dedupe([...youtubeLinks, ...newYoutubeLinks]);

    const updatePayload = {
      title: payload.title ?? existing.title,
      slug: payload.slug ?? existing.slug,
      categoryId: categoryIdToUse ?? existing.categoryId,
      category: category ?? existing.category,
      content: payload.content,
      shortDescription: payload.shortDescription ?? existing.shortDescription,
      images,
      videos,
      youtubeLinks,
      status: payload.status ?? existing.status,
    };

    const updated = await Blog.findByIdAndUpdate(id, updatePayload, { new: true });
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
    const removed = await Blog.findByIdAndDelete(id);
    if (!removed) {
      return res.status(404).json({ success: false, message: 'Not Found' });
    }
    return res.json({ success: true, data: removed });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};
