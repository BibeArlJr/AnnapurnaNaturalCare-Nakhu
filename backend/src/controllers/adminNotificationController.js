const RetreatBooking = require('../models/RetreatBooking');
const PackageBooking = require('../models/PackageBooking');
const HealthProgramBooking = require('../models/HealthProgramBooking');
const CourseBooking = require('../models/CourseBooking');

exports.getCounts = async (_req, res) => {
  try {
    const [retreatBookings, healthPackages, healthPrograms, courses] = await Promise.all([
      RetreatBooking.countDocuments({ unseen: true }),
      PackageBooking.countDocuments({ unseen: true }),
      HealthProgramBooking.countDocuments({ unseen: true }),
      CourseBooking.countDocuments({ unseen: true }),
    ]);

    return res.json({
      success: true,
      data: { retreatBookings, healthPackages, healthPrograms, courses },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load counts' });
  }
};

exports.markSeen = async (req, res) => {
  const { type } = req.query || {};
  const map = {
    retreatBookings: RetreatBooking,
    healthPackages: PackageBooking,
    healthPrograms: HealthProgramBooking,
    courses: CourseBooking,
  };
  const Model = map[type];
  if (!Model) return res.status(400).json({ success: false, message: 'Invalid type' });

  try {
    await Model.updateMany({ unseen: true }, { unseen: false });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to mark seen' });
  }
};
