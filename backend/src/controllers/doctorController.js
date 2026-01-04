const mongoose = require('mongoose');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const { uploadImage } = require('../services/cloudinary');

function toArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith('data:')) return [trimmed];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed.filter(Boolean);
    } catch (_) {
      // not JSON array, fallback to split
    }
    return trimmed.split(/[,\n]+/).map((v) => v.trim()).filter(Boolean);
  }
  return [];
}

exports.getAll = async (req, res) => {
  try {
    const { status, includeDrafts } = req.query || {};
    const query = {};

    if (includeDrafts === 'true' || status === 'all') {
      // no status filter
    } else if (status) {
      query.status = status;
    } else {
      query.status = 'published';
    }

    const items = await Doctor.find(query).populate('departmentId', 'name');
    return res.json({ success: true, data: items });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};
// Alias to satisfy consumers expecting getDoctors
exports.getDoctors = exports.getAll;

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
    const updated = await Doctor.findByIdAndUpdate(id, { status }, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Not Found' });
    }
    return res.json({ success: true, data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getOne = async (req, res) => {
  const { id } = req.params;

  try {
    const includeDrafts = req.query?.includeDrafts === 'true' || req.query?.status === 'all';
    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const item = isObjectId
      ? await Doctor.findById(id).populate('departmentId', 'name')
      : await Doctor.findOne({ slug: id }).populate('departmentId', 'name');

    if (!item || (!includeDrafts && item.status !== 'published')) {
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
    const { imageData, experience, videoData } = payload;

    if (experience !== undefined) {
      const numExp = Number(experience);
      if (!Number.isNaN(numExp)) {
        payload.experienceYears = numExp;
      }
    }

    if (imageData) {
      try {
        const uploadedUrl = await uploadImage(imageData, 'doctors');
        payload.photo = uploadedUrl?.secure_url || uploadedUrl?.url || payload.photo;
      } catch (err) {
        return res.status(500).json({ success: false, message: 'Image upload failed' });
      }
    }

    if (payload.photo && typeof payload.photo === 'object') {
      payload.photo = payload.photo.secure_url || payload.photo.url || '';
    }

    // Normalize media fields
    const incomingGallery = toArray(payload.galleryImages);
    const galleryImageData = toArray(payload.galleryImageData);
    const uploadedGallery = [];
    for (const img of galleryImageData) {
      try {
        const uploaded = await uploadImage(img, 'doctors/gallery');
        if (uploaded?.secure_url || uploaded?.url) {
          uploadedGallery.push(uploaded.secure_url || uploaded.url);
        }
      } catch (err) {
        console.error('Gallery upload failed', err);
      }
    }
    payload.galleryImages = [...incomingGallery, ...uploadedGallery];
    payload.videoUrl = (payload.videoUrl || '').toString().trim();

    if (videoData) {
      try {
        const uploadedVideo = await uploadImage(videoData, 'doctors/videos', { resource_type: 'video' });
        payload.videoUrl = uploadedVideo?.secure_url || uploadedVideo?.url || payload.videoUrl;
      } catch (err) {
        console.error('Video upload failed', err);
      }
    }

    const qualifications = Array.isArray(payload.medicalQualifications) ? payload.medicalQualifications : [];
    payload.medicalQualifications = qualifications
      .map((q) => (typeof q === 'string' ? { degree: q } : q))
      .filter((q) => q && q.degree);

    delete payload.imageData;
    delete payload.videoData;
    delete payload.galleryImageData;
    delete payload.experience;

    const newItem = await Doctor.create(payload);
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
    const { imageData, experience, videoData } = payload;

    if (experience !== undefined) {
      const numExp = Number(experience);
      if (!Number.isNaN(numExp)) {
        payload.experienceYears = numExp;
      }
    }

    if (imageData) {
      try {
        const uploadedUrl = await uploadImage(imageData, 'doctors');
        payload.photo = uploadedUrl?.secure_url || uploadedUrl?.url || payload.photo;
      } catch (err) {
        return res.status(500).json({ success: false, message: 'Image upload failed' });
      }
    }

    if (payload.photo && typeof payload.photo === 'object') {
      payload.photo = payload.photo.secure_url || payload.photo.url || '';
    }

    // Normalize media fields
    const incomingGallery = toArray(payload.galleryImages);
    const galleryImageData = toArray(payload.galleryImageData);
    const uploadedGallery = [];
    for (const img of galleryImageData) {
      try {
        const uploaded = await uploadImage(img, 'doctors/gallery');
        if (uploaded?.secure_url || uploaded?.url) {
          uploadedGallery.push(uploaded.secure_url || uploaded.url);
        }
      } catch (err) {
        console.error('Gallery upload failed', err);
      }
    }
    if (incomingGallery.length || uploadedGallery.length) {
      payload.galleryImages = [...incomingGallery, ...uploadedGallery];
    }
    payload.videoUrl = (payload.videoUrl || '').toString().trim();

    if (videoData) {
      try {
        const uploadedVideo = await uploadImage(videoData, 'doctors/videos', { resource_type: 'video' });
        payload.videoUrl = uploadedVideo?.secure_url || uploadedVideo?.url || payload.videoUrl;
      } catch (err) {
        console.error('Video upload failed', err);
      }
    }

    const qualifications = Array.isArray(payload.medicalQualifications) ? payload.medicalQualifications : [];
    payload.medicalQualifications = qualifications
      .map((q) => (typeof q === 'string' ? { degree: q } : q))
      .filter((q) => q && q.degree);

    delete payload.imageData;
    delete payload.videoData;
    delete payload.galleryImageData;
    delete payload.experience;

    const updated = await Doctor.findByIdAndUpdate(id, payload, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Not Found' });
    }
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
    const removed = await Doctor.findByIdAndDelete(id);
    if (!removed) {
      return res.status(404).json({ success: false, message: 'Not Found' });
    }
    return res.json({ success: true, data: removed });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getAvailability = async (req, res) => {
  const { id } = req.params;
  const { date } = req.query;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid ID' });
  }

  if (!date) {
    return res.status(400).json({ success: false, message: 'Date is required' });
  }

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) {
    return res.status(400).json({ success: false, message: 'Invalid date format' });
  }

  const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const weekday = weekdayNames[parsedDate.getUTCDay()];

  try {
    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Not Found' });
    }

    const daySchedule = (doctor.schedule || []).find((entry) => entry.day === weekday);
    if (!daySchedule || !Array.isArray(daySchedule.slots)) {
      return res.json({ success: true, data: [] });
    }

    const existingAppointments = await Appointment.find({ doctorId: id, date });
    const bookedTimes = new Set(existingAppointments.map((appt) => appt.time));

    const availableSlots = daySchedule.slots.filter((slot) => !bookedTimes.has(slot));

    return res.json({ success: true, data: availableSlots });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.uploadImageOnly = async (req, res) => {
  const { imageData } = req.body || {};
  if (!imageData) {
    return res.status(400).json({ success: false, message: 'No image provided' });
  }

  try {
    const uploadedUrl = await uploadImage(imageData, 'doctors');
    return res.json({ success: true, url: uploadedUrl });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Image upload failed' });
  }
};
