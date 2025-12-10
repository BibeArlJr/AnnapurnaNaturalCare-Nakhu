const mongoose = require('mongoose');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const { uploadImage } = require('../services/cloudinary');

exports.getAll = async (req, res) => {
  try {
    const items = await Doctor.find().populate('departmentId', 'name');
    return res.json({ success: true, data: items });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};
// Alias to satisfy consumers expecting getDoctors
exports.getDoctors = exports.getAll;

exports.getOne = async (req, res) => {
  const { id } = req.params;

  try {
    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const item = isObjectId
      ? await Doctor.findById(id).populate('departmentId', 'name')
      : await Doctor.findOne({ slug: id }).populate('departmentId', 'name');

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
    const { imageData, experience } = payload;

    if (experience !== undefined) {
      const numExp = Number(experience);
      if (!Number.isNaN(numExp)) {
        payload.experienceYears = numExp;
      }
    }

    if (imageData) {
      try {
        const uploadedUrl = await uploadImage(imageData, 'doctors');
        payload.photo = uploadedUrl;
      } catch (err) {
        return res.status(500).json({ success: false, message: 'Image upload failed' });
      }
    }

    delete payload.imageData;
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
    const { imageData, experience } = payload;

    if (experience !== undefined) {
      const numExp = Number(experience);
      if (!Number.isNaN(numExp)) {
        payload.experienceYears = numExp;
      }
    }

    if (imageData) {
      try {
        const uploadedUrl = await uploadImage(imageData, 'doctors');
        payload.photo = uploadedUrl;
      } catch (err) {
        return res.status(500).json({ success: false, message: 'Image upload failed' });
      }
    }

    delete payload.imageData;
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
