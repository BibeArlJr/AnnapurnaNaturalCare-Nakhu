const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Department = require('../models/Department');
const { sendAppointmentEmail } = require('../utils/mailer');

exports.createAppointment = async (req, res) => {
  try {
    const {
      patientName,
      patientEmail,
      patientPhone,
      service,
      doctor,
      doctorId,
      doctorName,
      departmentId,
      departmentName,
      date,
      time,
      message,
    } = req.body;

    if (!patientName || !patientPhone || !date) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    const payload = {
      patientName,
      patientEmail,
      patientPhone,
      service,
      doctor: doctorName || doctor,
      doctorName: doctorName || doctor,
      date,
      time,
      message,
    };

    // attach department if provided
    if (departmentId && mongoose.Types.ObjectId.isValid(departmentId)) {
      payload.departmentId = departmentId;
      if (!payload.departmentName) {
        const dep = await Department.findById(departmentId);
        if (dep) {
          payload.departmentName = dep.name;
          if (!payload.service) payload.service = dep.name;
        }
      }
    }

    // hydrate doctor data if doctorId provided
    if (doctorId && mongoose.Types.ObjectId.isValid(doctorId)) {
      const doc = await Doctor.findById(doctorId).populate('departmentId');
      if (doc) {
        payload.doctorId = doc._id;
        payload.doctor = payload.doctor || doc.name;
        payload.doctorName = payload.doctorName || doc.name;
        if (!payload.departmentId && doc.departmentId?._id) {
          payload.departmentId = doc.departmentId._id;
        }
        if (!payload.departmentName && doc.departmentId?.name) {
          payload.departmentName = doc.departmentId.name;
        }
        if (!payload.service && doc.departmentId?.name) {
          payload.service = doc.departmentId.name;
        }
      }
    }

    const appointment = await Appointment.create(payload);

    return res.status(201).json(appointment);
  } catch (err) {
    console.error('Create appointment error:', err);
    return res.status(500).json({ message: 'Server error creating appointment.' });
  }
};

exports.getAll = async (req, res) => {
  const { doctorId, status, date } = req.query;

  const query = {};

  if (doctorId) {
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ success: false, message: 'Invalid doctor ID' });
    }
    query.doctorId = doctorId;
  }

  if (status) {
    query.status = status;
  }

  if (date) {
    query.date = date;
  }

  try {
    const items = await Appointment.find(query)
      .populate('doctorId', 'name')
      .populate('departmentId', 'name')
      .sort({ createdAt: -1 });
    return res.json({ success: true, data: items });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getOne = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid ID' });
  }

  try {
    const item = await Appointment.findById(id);

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
    const newItem = await Appointment.create(req.body);
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
    const updated = await Appointment.findByIdAndUpdate(id, req.body, { new: true });
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
    const removed = await Appointment.findByIdAndDelete(id);
    if (!removed) {
      return res.status(404).json({ success: false, message: 'Not Found' });
    }
    return res.json({ success: true, data: removed });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.bookAppointment = async (req, res) => {
  const { doctorId, patientName, patientEmail, patientPhone, date, time } = req.body;

  if (!mongoose.Types.ObjectId.isValid(doctorId)) {
    return res.status(400).json({ success: false, message: 'Invalid doctor ID' });
  }

  if (!date || !time || !patientName || !patientEmail || !patientPhone) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) {
    return res.status(400).json({ success: false, message: 'Invalid date format' });
  }

  const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const weekday = weekdayNames[parsedDate.getUTCDay()];

  try {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    const daySchedule = (doctor.schedule || []).find((entry) => entry.day === weekday);
    const availableSlots = daySchedule?.slots || [];

    if (!availableSlots.includes(time)) {
      return res.status(400).json({ success: false, message: 'Requested time not in doctor schedule' });
    }

    const existing = await Appointment.findOne({ doctorId, date, time });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Slot already booked' });
    }

    const newAppointment = await Appointment.create({ doctorId, patientName, patientEmail, patientPhone, date, time });
    return res.status(201).json({ success: true, data: newAppointment });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status, adminMessage, notifyPatient } = req.body;

  const allowedStatuses = ['pending', 'confirmed', 'cancelled', 'completed', 'rescheduled'];

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid ID' });
  }

  if (!status || !allowedStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  try {
    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status, adminMessage },
      { new: true }
    );
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Not Found' });
    }

    const shouldNotify = notifyPatient !== false;
    if (shouldNotify && appointment.patientEmail) {
      try {
        console.log('[updateStatus] sending email to', appointment.patientEmail);
        await sendAppointmentEmail(appointment.patientEmail, appointment);
      } catch (mailErr) {
        console.error('Appointment email send failed:', mailErr);
      }
    }

    return res.json({ success: true, data: appointment });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.reschedule = async (req, res) => {
  const { id } = req.params;
  const { date, time, status, adminMessage, notifyPatient } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid ID' });
  }

  if (!date && !time) {
    return res.status(400).json({ success: false, message: 'Date or time required' });
  }

  try {
    const update = {};
    if (date) update.date = date;
    if (time) update.time = time;
    if (status) update.status = status;
    if (adminMessage) update.adminMessage = adminMessage;

    const appointment = await Appointment.findByIdAndUpdate(id, update, { new: true });
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Not Found' });
    }

    console.log('[reschedule] route hit', { id, date, time, status, notifyPatient: !!notifyPatient });

    if (notifyPatient && appointment.patientEmail) {
      try {
        console.log('[reschedule] sending email to', appointment.patientEmail);
        await sendAppointmentEmail(appointment.patientEmail, appointment);
        console.log('[reschedule] email sent');
      } catch (mailErr) {
        console.error('Appointment email send failed:', mailErr);
      }
    }

    return res.json({ success: true, data: appointment });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// alias for clarity if needed
exports.updateAppointmentStatus = exports.updateStatus;
