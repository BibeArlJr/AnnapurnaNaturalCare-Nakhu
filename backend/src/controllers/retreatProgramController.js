const mongoose = require('mongoose');
const RetreatProgram = require('../models/RetreatProgram');
const slugify = require('slugify');
const { uploadImage } = require('../services/cloudinary');

function normalizeStringArray(raw) {
  if (!raw) return [];
  const pushTo = [];
  const add = (val) => {
    if (!val) return;
    const str = val.toString().trim();
    if (str) pushTo.push(str);
  };
  if (Array.isArray(raw)) {
    raw.forEach(add);
  } else if (typeof raw === 'string') {
    raw
      .split(/[\n,]+/)
      .map((p) => p.trim())
      .forEach(add);
  }
  return pushTo;
}

function normalizeIdArray(raw) {
  if (!raw) return [];
  const pushTo = [];
  const add = (val) => {
    if (!val) return;
    const str = val.toString().trim();
    if (str) pushTo.push(str);
  };
  if (Array.isArray(raw)) {
    raw.forEach(add);
  } else {
    add(raw);
  }
  return pushTo;
}

const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj || {}, key);

function buildPayload(body) {
  const {
    title,
    slug,
    descriptionShort,
    descriptionLong,
    programType,
    durationDays,
    pricePerPersonUSD,
    allowAccommodationChoice,
    accommodationOptions,
    accommodationPricing,
    hospitalPremiumPrice,
    destinations,
    included,
    alwaysIncludesAirportPickup,
    coverImage,
    galleryImages,
    promoVideo,
    isActive,
    status,
  } = body || {};

  const payload = {};

  if (typeof title !== 'undefined') {
    payload.title = title;
  }

  const slugInputProvided = typeof slug !== 'undefined';
  if (slugInputProvided) {
    payload.slug = slug ? slugify(slug, { lower: true, strict: true }) : '';
  } else if (typeof title !== 'undefined') {
    payload.slug = title ? slugify(title, { lower: true, strict: true }) : '';
  }

  if (typeof descriptionShort !== 'undefined') {
    payload.descriptionShort = descriptionShort;
  }
  if (typeof descriptionLong !== 'undefined') {
    payload.descriptionLong = descriptionLong;
  }
  if (typeof programType !== 'undefined') {
    payload.programType = programType;
  }
  if (typeof durationDays !== 'undefined') {
    payload.durationDays = durationDays === '' ? undefined : Number(durationDays);
  }
  if (typeof pricePerPersonUSD !== 'undefined') {
    payload.pricePerPersonUSD = pricePerPersonUSD === '' ? undefined : Number(pricePerPersonUSD);
  }

  const hasAccommodation =
    typeof allowAccommodationChoice !== 'undefined' ||
    typeof accommodationOptions !== 'undefined' ||
    typeof hospitalPremiumPrice !== 'undefined';
  if (hasAccommodation) {
    payload.accommodation = {
      allowAccommodationChoice: Boolean(allowAccommodationChoice),
      options: normalizeStringArray(accommodationOptions),
      hospitalPremiumPrice:
        hospitalPremiumPrice === '' || typeof hospitalPremiumPrice === 'undefined'
          ? undefined
          : Number(hospitalPremiumPrice),
    };
  }

  if (typeof hospitalPremiumPrice !== 'undefined' || Array.isArray(accommodationPricing)) {
    const priceVal =
      hospitalPremiumPrice !== '' && typeof hospitalPremiumPrice !== 'undefined'
        ? Number(hospitalPremiumPrice)
        : (() => {
            const raw = (accommodationPricing || []).find?.((p) => p?.key === 'hospital_premium');
            if (!raw) return undefined;
            return raw.pricePerPersonUSD !== undefined ? Number(raw.pricePerPersonUSD) : undefined;
          })();

    payload.accommodationPricing =
      priceVal !== undefined && !Number.isNaN(priceVal)
        ? [
            {
              key: 'hospital_premium',
              label: 'Hospital premium',
              pricePerPersonUSD: priceVal,
            },
          ]
        : [];
  }

  if (hasOwn(body, 'destinations') || hasOwn(body, 'destinations[]')) {
    payload.destinations = normalizeIdArray(destinations || body?.['destinations[]']);
  }
  if (typeof included !== 'undefined') {
    payload.included = normalizeStringArray(included);
  }
  if (typeof alwaysIncludesAirportPickup !== 'undefined') {
    payload.alwaysIncludesAirportPickup = Boolean(alwaysIncludesAirportPickup);
  }
  if (typeof coverImage !== 'undefined') {
    payload.coverImage = coverImage;
  }
  if (hasOwn(body, 'galleryImages') || hasOwn(body, 'galleryImages[]')) {
    payload.galleryImages = normalizeStringArray(galleryImages || body?.['galleryImages[]']);
  }
  if (typeof promoVideo !== 'undefined') {
    payload.promoVideo = typeof promoVideo === 'string' ? promoVideo.trim() : promoVideo;
  }
  if (typeof isActive !== 'undefined') {
    payload.isActive = Boolean(isActive);
  }
  if (typeof status !== 'undefined') {
    payload.status = status;
  }

  return payload;
}

exports.getAll = async (_req, res) => {
  try {
    const { status, includeDrafts } = _req.query || {};
    const query = {};

    if (includeDrafts === 'true' || status === 'all') {
      // no status filter
    } else if (status) {
      query.status = status;
    } else {
      query.status = 'published';
    }

    const items = await RetreatProgram.find(query)
      .populate('destinations', 'name type')
      .sort({ createdAt: -1 });
    return res.json({ success: true, data: items });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getOne = async (req, res) => {
  try {
    const { slug } = req.params;
    const includeDrafts = req.query?.includeDrafts === 'true' || req.query?.status === 'all';
    const item = await RetreatProgram.findOne({ slug }).populate('destinations', 'name type');
    if (!item || (!includeDrafts && item.status !== 'published')) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }
    return res.json({ success: true, data: item });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

async function uploadSingle(file) {
  if (!file) return null;
  const fileStr = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
  const uploadRes = await uploadImage(fileStr, 'retreat-programs');
  return uploadRes?.secure_url || uploadRes?.url;
}

async function uploadMultiple(files = []) {
  const results = [];
  for (const file of files) {
    const url = await uploadSingle(file);
    if (url) results.push(url);
  }
  return results;
}

async function uploadVideo(file) {
  if (!file) return null;
  const fileStr = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
  const uploadRes = await uploadImage(fileStr, 'retreat-programs/videos', { resource_type: 'video' });
  return uploadRes?.secure_url || uploadRes?.url;
}

exports.create = async (req, res) => {
  try {
    const payload = buildPayload(req.body);
    if (!payload.title) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }
    if (!payload.slug) {
      return res.status(400).json({ success: false, message: 'Unable to generate slug' });
    }

    if (req.files?.coverImage?.[0]) {
      const url = await uploadSingle(req.files.coverImage[0]);
      if (url) payload.coverImage = url;
    }
    if (req.files?.galleryImages?.length) {
      const uploaded = await uploadMultiple(req.files.galleryImages);
      payload.galleryImages = [...(payload.galleryImages || []), ...uploaded];
    }

    const uploadedVideo = await uploadVideo(req.files?.promoVideo?.[0]);
    if (uploadedVideo) payload.promoVideo = uploadedVideo;

    const item = await RetreatProgram.create(payload);
    const populated = await RetreatProgram.findById(item._id).populate('destinations', 'name type');
    return res.status(201).json({ success: true, data: populated || item });
  } catch (err) {
    console.error('Create retreat program error:', err);
    return res.status(400).json({ success: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await RetreatProgram.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }

    const payload = buildPayload(req.body);
    if (payload.title && !payload.slug) {
      payload.slug = slugify(payload.title, { lower: true, strict: true });
    }

    const coverUrl =
      (req.files?.coverImage?.[0] && (await uploadSingle(req.files.coverImage[0]))) ||
      payload.coverImage ||
      existing.coverImage;

    const uploadedVideo = await uploadVideo(req.files?.promoVideo?.[0]);
    const promoVideoUrl =
      uploadedVideo ??
      (payload.promoVideo === '' ? null : payload.promoVideo || existing.promoVideo);

    const incomingGallery = payload.galleryImages?.length ? payload.galleryImages : existing.galleryImages || [];
    const uploadedGallery = req.files?.galleryImages?.length ? await uploadMultiple(req.files.galleryImages) : [];
    const galleryImages = [...incomingGallery, ...uploadedGallery];

    const updated = await RetreatProgram.findByIdAndUpdate(
      id,
      { ...payload, coverImage: coverUrl, galleryImages, promoVideo: promoVideoUrl },
      { new: true }
    ).populate('destinations', 'name type');
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }
    return res.json({ success: true, data: updated });
  } catch (err) {
    console.error('Update retreat program error:', err);
    return res.status(400).json({ success: false, message: err.message });
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
    const updated = await RetreatProgram.findByIdAndUpdate(id, { status }, { new: true }).populate(
      'destinations',
      'name type'
    );
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }
    return res.json({ success: true, data: updated });
  } catch (err) {
    console.error('Update retreat program status error:', err);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.remove = async (req, res) => {
  try {
    await RetreatProgram.findByIdAndDelete(req.params.id);
    return res.json({ success: true });
  } catch (err) {
    console.error('Delete retreat program error:', err);
    return res.status(400).json({ success: false, message: err.message });
  }
};
