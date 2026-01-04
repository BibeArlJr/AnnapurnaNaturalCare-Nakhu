const HealthProgram = require('../models/HealthProgram');
const slugify = require('slugify');

const normalizeArray = (raw) => {
  if (!raw) return [];
  const list = Array.isArray(raw) ? raw : [raw];
  return list
    .map((i) => (typeof i === 'string' ? i.trim() : i))
    .filter(Boolean);
};

const normalizePromoVideos = (raw, videoUrl) => {
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
      if (typeof item === 'string') pushVideo(item, 'url');
      else if (item.url) pushVideo(item.url, item.type || 'url');
    });
  } else if (raw) {
    pushVideo(raw, 'url');
  }
  if (videoUrl) pushVideo(videoUrl, 'url');
  return list.slice(0, 3);
};

exports.listPublic = async (_req, res) => {
  try {
    const items = await HealthProgram.find({ isPublished: true }).sort({ createdAt: -1 });
    const data = items.map((i) => mapPromoVideos(i));
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.list = async (_req, res) => {
  try {
    const items = await HealthProgram.find().sort({ createdAt: -1 });
    const data = items.map((i) => mapPromoVideos(i));
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getBySlug = async (req, res) => {
  try {
    const item = await HealthProgram.findOne({ slug: req.params.slug, isPublished: true });
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    return res.json({ success: true, data: mapPromoVideos(item) });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.create = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (payload.title && !payload.slug) {
      payload.slug = slugify(payload.title, { lower: true, strict: true });
    }
    payload.modesAvailable = normalizeArray(payload.modesAvailable);
    payload.inclusions = normalizeArray(payload.inclusions);
    payload.outcomes = normalizeArray(payload.outcomes);
    payload.promoVideos = normalizePromoVideos(payload.promoVideos, payload.videoUrl);
    const item = await HealthProgram.create(payload);
    return res.status(201).json({ success: true, data: mapPromoVideos(item) });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = { ...req.body };
    if (payload.title && !payload.slug) {
      payload.slug = slugify(payload.title, { lower: true, strict: true });
    }
    if (payload.modesAvailable) payload.modesAvailable = normalizeArray(payload.modesAvailable);
    if (payload.inclusions) payload.inclusions = normalizeArray(payload.inclusions);
    if (payload.outcomes) payload.outcomes = normalizeArray(payload.outcomes);
    if (payload.promoVideos || payload.videoUrl) {
      payload.promoVideos = normalizePromoVideos(payload.promoVideos, payload.videoUrl);
    }
    const item = await HealthProgram.findByIdAndUpdate(id, payload, { new: true });
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    return res.json({ success: true, data: mapPromoVideos(item) });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await HealthProgram.findByIdAndDelete(req.params.id);
    return res.json({ success: true });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

function mapPromoVideos(item) {
  if (!item) return item;
  const obj = item.toObject ? item.toObject() : item;
  const videos = Array.isArray(obj.promoVideos) ? obj.promoVideos : [];
  obj.promoVideos = videos.map((v) => (typeof v === 'string' ? { type: 'url', url: v } : v)).filter((v) => v && v.url);
  return obj;
}
