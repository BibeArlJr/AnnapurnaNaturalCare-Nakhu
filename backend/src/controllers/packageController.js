const mongoose = require('mongoose');
const Package = require('../models/Package');
const TreatmentType = require('../models/TreatmentType');
const { uploadImage, deleteImage } = require('../services/cloudinary');
const { createPackageSchema } = require('../utils/validation');
const slugify = require('slugify');

function normalizeIncluded(included) {
  if (!included) return [];
  const blocklist = ['a', 'h', 'b', 'c', 'd', 'e'];
  const clean = (arr) =>
    arr
      .filter(Boolean)
      .map((i) => i.toString().trim())
      .filter((i) => i && !blocklist.includes(i.toLowerCase()));

  if (Array.isArray(included)) return clean(included);
  return included
    .toString()
    .split(/\r?\n|,/)
    .map((i) => i.trim())
    .filter((i) => i && !blocklist.includes(i.toLowerCase()));
}

function normalizeStringArray(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.filter(Boolean).map((v) => v.toString().trim()).filter(Boolean);
  }
  const val = raw['0'] ? Object.values(raw) : raw;
  if (Array.isArray(val)) {
    return val.filter(Boolean).map((v) => v.toString().trim()).filter(Boolean);
  }
  return raw
    .toString()
    .split(/[,\\n]+/)
    .map((v) => v.trim())
    .filter(Boolean);
}

function normalizePromoVideos(raw, fallbackVideoUrl) {
  const list = [];
  const pushVideo = (url, type) => {
    if (!url) return;
    const clean = url.toString().trim();
    if (!clean) return;
    list.push({ type: type || 'url', url: clean });
  };

  if (Array.isArray(raw)) {
    raw.forEach((item) => {
      if (!item) return;
      if (typeof item === 'string') {
        pushVideo(item, 'url');
      } else if (typeof item === 'object' && item.url) {
        pushVideo(item.url, item.type || 'url');
      }
    });
  } else if (raw) {
    pushVideo(raw, 'url');
  }

  if (fallbackVideoUrl) {
    pushVideo(fallbackVideoUrl, 'url');
  }

  // ensure max 3
  return list.slice(0, 3);
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
  if (typeof payload.durationDays === 'string') payload.durationDays = Number(payload.durationDays);
  if (typeof payload.departments === 'string') payload.departments = [payload.departments];
  if (typeof payload.included === 'string') payload.included = [payload.included];
  if (typeof payload.department === 'undefined' && Array.isArray(payload.departments) && payload.departments.length) {
    payload.department = payload.departments[0];
  }

  const parsed = createPackageSchema.safeParse(payload);
  if (!parsed.success) {
    console.error('Package validation error:', parsed.error.format());
    return { error: parsed.error.format() };
  }

  const parsedData = parsed.data;

  const includedRaw = parsedData.included ?? payload['included[]'];
  parsedData.included = normalizeIncluded(includedRaw);

  const departmentsRaw = parsedData.departments ?? payload['departments[]'];
  const normalizedDepartments = normalizeDepartments(departmentsRaw);
  parsedData.departments = normalizedDepartments.length
    ? normalizedDepartments
    : parsedData.department
    ? [parsedData.department]
    : [];

  if (!parsedData.durationDays && parsedData.duration) {
    parsedData.durationDays = parsedData.duration;
  }

  const galleryRaw = parsedData.galleryImages ?? payload['galleryImages[]'] ?? payload.galleryImages;
  parsedData.galleryImages = normalizeStringArray(galleryRaw);
  const promoVideosRaw =
    parsedData.promoVideos ??
    payload['promoVideos[]'] ??
    payload.promoVideos ??
    parsedData.promoVideo ??
    payload.videoUrl;
  parsedData.promoVideos = normalizePromoVideos(promoVideosRaw, payload.videoUrl);
  parsedData.promoVideo = (parsedData.promoVideo || '').toString().trim();

  return { data: parsedData };
}

exports.getAll = async (req, res) => {
  try {
    const {
      minPrice,
      maxPrice,
      minDays,
      maxDays,
      treatmentType,
      department,
      status,
      includeDrafts,
    } = req.query || {};

    const query = {};

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (minDays || maxDays) {
      query.durationDays = {};
      if (minDays) query.durationDays.$gte = Number(minDays);
      if (maxDays) query.durationDays.$lte = Number(maxDays);
    }

    if (treatmentType) {
      query.treatmentType = treatmentType;
    }

    if (department) {
      query.$or = [{ department }, { departments: department }];
    }

    if (includeDrafts === 'true' || status === 'all') {
      // no status filter
    } else if (status) {
      query.status = status;
    } else {
      query.status = 'published';
    }

    const items = await Package.find(query)
      .populate('department', 'name slug')
      .populate('treatmentType', 'name slug')
      .populate('departments', 'name slug');
    const normalized = items.map((item) => {
      const obj = item.toObject();
      const videos = Array.isArray(obj.promoVideos) ? obj.promoVideos : [];
      obj.promoVideos = videos.map((v) => (typeof v === 'string' ? { type: 'url', url: v } : v)).filter((v) => v && v.url);
      if ((!obj.promoVideos || obj.promoVideos.length === 0) && obj.promoVideo) {
        obj.promoVideos = [{ type: 'url', url: obj.promoVideo }];
      }
      return obj;
    });
    return res.json({ success: true, data: normalized });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getOne = async (req, res) => {
  const { id } = req.params;

  try {
    const includeDrafts = req.query?.includeDrafts === 'true' || req.query?.status === 'all';
    let item = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      item = await Package.findById(id)
        .populate('departments', 'name slug')
        .populate('department', 'name slug')
        .populate('treatmentType', 'name slug');
    }
    if (!item) {
      item = await Package.findOne({ slug: id })
        .populate('departments', 'name slug')
        .populate('department', 'name slug')
        .populate('treatmentType', 'name slug');
    }
    if (!item || (!includeDrafts && item.status !== 'published')) {
      return res.status(404).json({ success: false, message: 'Not Found' });
    }

    const obj = item.toObject();
    const videos = Array.isArray(obj.promoVideos) ? obj.promoVideos : [];
    obj.promoVideos = videos.map((v) => (typeof v === 'string' ? { type: 'url', url: v } : v)).filter((v) => v && v.url);
    if ((!obj.promoVideos || obj.promoVideos.length === 0) && obj.promoVideo) {
      obj.promoVideos = [{ type: 'url', url: obj.promoVideo }];
    }
    return res.json({ success: true, data: obj });
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

    const departmentList =
      Array.isArray(payloadToSave.departments) && payloadToSave.departments.length
        ? payloadToSave.departments
        : payloadToSave.department
        ? [payloadToSave.department]
        : [];
    if (!departmentList.length) {
      return res.status(400).json({ success: false, message: 'Select at least one department' });
    }
    payloadToSave.departments = departmentList;
    if (!payloadToSave.treatmentType) {
      return res.status(400).json({ success: false, message: 'Select a treatment type' });
    }

    const coverFile = req.files?.coverImage?.[0] || req.files?.image?.[0] || req.file;
    if (coverFile) {
      const fileStr = `data:${coverFile.mimetype};base64,${coverFile.buffer.toString('base64')}`;
      const uploadRes = await uploadImage(fileStr, 'packages');
      payloadToSave.imageUrl = uploadRes?.secure_url || uploadRes?.url;
      payloadToSave.imagePublicId = uploadRes?.public_id;
    }

    if (req.files?.galleryImages?.length) {
      const uploadedGallery = [];
      for (const file of req.files.galleryImages) {
        const fileStr = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
        const uploadRes = await uploadImage(fileStr, 'packages/gallery');
        if (uploadRes?.secure_url || uploadRes?.url) {
          uploadedGallery.push(uploadRes.secure_url || uploadRes.url);
        }
      }
      payloadToSave.galleryImages = [...(payloadToSave.galleryImages || []), ...uploadedGallery];
    }

    const promoList = [...(payloadToSave.promoVideos || [])];
    if (payloadToSave.promoVideo) {
      promoList.push({ type: 'url', url: payloadToSave.promoVideo });
    }
    if (req.files?.promoVideo?.[0]) {
      const vid = req.files.promoVideo[0];
      const fileStr = `data:${vid.mimetype};base64,${vid.buffer.toString('base64')}`;
      const uploadRes = await uploadImage(fileStr, 'packages/videos', { resource_type: 'video' });
      const uploadedVideo = uploadRes?.secure_url || uploadRes?.url;
      if (uploadedVideo) promoList.push({ type: 'file', url: uploadedVideo });
    }
    payloadToSave.promoVideos = promoList.filter((v) => v && v.url);

    console.log('SAVING SLUG:', payloadToSave.slug);

    const newItem = await Package.create({
      name: payloadToSave.name,
      slug: payloadToSave.slug,
      price: payloadToSave.price,
      duration: payloadToSave.duration,
      durationDays: payloadToSave.durationDays || payloadToSave.duration,
      treatmentType: payloadToSave.treatmentType,
      department: payloadToSave.department || departmentList[0],
      shortDescription: payloadToSave.shortDescription,
      longDescription: payloadToSave.longDescription,
      description: payloadToSave.longDescription || payloadToSave.description,
      included: payloadToSave.included,
      departments: departmentList,
      imageUrl: payloadToSave.imageUrl,
      imagePublicId: payloadToSave.imagePublicId,
      galleryImages: payloadToSave.galleryImages,
      promoVideos: payloadToSave.promoVideos,
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
    const departmentList =
      Array.isArray(payloadToSave.departments) && payloadToSave.departments.length
        ? payloadToSave.departments
        : payloadToSave.department
        ? [payloadToSave.department]
        : existing.departments && existing.departments.length
        ? existing.departments
        : [];
    if (!departmentList.length) {
      return res.status(400).json({ success: false, message: 'Select at least one department' });
    }

    const slugInput = payloadToSave.slug || existing.slug;
    if (!slugInput) {
      return res.status(400).json({ success: false, message: 'Slug is required' });
    }
    const slug = slugify(slugInput, { lower: true, strict: true });
    if (!slug) {
      return res.status(400).json({ success: false, message: 'Unable to generate slug' });
    }
    payloadToSave.slug = slug;

    const coverFile = req.files?.coverImage?.[0] || req.files?.image?.[0] || req.file;
    if (coverFile) {
      if (existing.imagePublicId) {
        await deleteImage(existing.imagePublicId);
      }
      const fileStr = `data:${coverFile.mimetype};base64,${coverFile.buffer.toString('base64')}`;
      const uploadRes = await uploadImage(fileStr, 'packages');
      payloadToSave.imageUrl = uploadRes?.secure_url || uploadRes?.url;
      payloadToSave.imagePublicId = uploadRes?.public_id;
    }

    const incomingGallery =
      payloadToSave.galleryImages && payloadToSave.galleryImages.length
        ? payloadToSave.galleryImages
        : existing.galleryImages || [];

    let uploadedGallery = [];
    if (req.files?.galleryImages?.length) {
      for (const file of req.files.galleryImages) {
        const fileStr = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
        const uploadRes = await uploadImage(fileStr, 'packages/gallery');
        if (uploadRes?.secure_url || uploadRes?.url) {
          uploadedGallery.push(uploadRes.secure_url || uploadRes.url);
        }
      }
    }

    const promoList = [
      ...(Array.isArray(payloadToSave.promoVideos) ? payloadToSave.promoVideos : []),
      ...(Array.isArray(existing.promoVideos) ? existing.promoVideos : []),
    ];
    if (payloadToSave.promoVideo) {
      promoList.push({ type: 'url', url: payloadToSave.promoVideo });
    }
    if (req.files?.promoVideo?.[0]) {
      const vid = req.files.promoVideo[0];
      const fileStr = `data:${vid.mimetype};base64,${vid.buffer.toString('base64')}`;
      const uploadRes = await uploadImage(fileStr, 'packages/videos', { resource_type: 'video' });
      const uploadedVideo = uploadRes?.secure_url || uploadRes?.url;
      if (uploadedVideo) promoList.push({ type: 'file', url: uploadedVideo });
    }
    const uniquePromoVideos = promoList
      .filter((p) => p && (p.url || typeof p === 'string'))
      .map((p) =>
        typeof p === 'string'
          ? { type: 'url', url: p }
          : { type: p.type || 'url', url: p.url, thumbnail: p.thumbnail }
      )
      .filter((p) => p.url);

    const updated = await Package.findByIdAndUpdate(
      id,
      {
        ...payloadToSave,
        departments: departmentList,
        department: payloadToSave.department || departmentList[0],
        durationDays: payloadToSave.durationDays || payloadToSave.duration,
        treatmentType: payloadToSave.treatmentType || existing.treatmentType,
        galleryImages: [...incomingGallery, ...uploadedGallery],
        promoVideos: uniquePromoVideos,
      },
      { new: true }
    )
      .populate('departments', 'name slug')
      .populate('department', 'name slug')
      .populate('treatmentType', 'name slug');
    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Update package error:', error);
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
    const updated = await Package.findByIdAndUpdate(id, { status }, { new: true })
      .populate('departments', 'name slug')
      .populate('department', 'name slug')
      .populate('treatmentType', 'name slug');
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Not Found' });
    }
    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Update package status error:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
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
