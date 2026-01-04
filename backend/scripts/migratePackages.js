require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

const Package = require('../src/models/Package');
const Department = require('../src/models/Department');
const TreatmentType = require('../src/models/TreatmentType');

async function ensureTreatmentTypes() {
  const defaults = ['Yoga', 'Ayurveda', 'Naturopathy', 'Detox'];
  const existing = await TreatmentType.find({});
  const existingMap = new Map(existing.map((t) => [t.name.toLowerCase(), t]));

  const toCreate = defaults.filter((name) => !existingMap.has(name.toLowerCase()));
  if (toCreate.length) {
    const created = await TreatmentType.insertMany(
      toCreate.map((name) => ({ name, slug: name.toLowerCase() }))
    );
    created.forEach((t) => existingMap.set(t.name.toLowerCase(), t));
  }
  return existingMap;
}

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const defaultDepartment = await Department.findOne();
    if (!defaultDepartment) {
      throw new Error('Create at least one department first');
    }

    const typeMap = await ensureTreatmentTypes();
    const defaultType = typeMap.get('naturopathy') || Array.from(typeMap.values())[0];

    await Package.updateMany(
      { department: { $exists: false } },
      {
        $set: {
          department: defaultDepartment._id,
        },
      }
    );

    // Backfill treatment type to reference IDs
    const packages = await Package.find({
      $or: [{ treatmentType: { $exists: false } }, { treatmentType: { $type: 'string' } }],
    });

    for (const pkg of packages) {
      const current = pkg.treatmentType;
      const matched =
        (typeof current === 'string' && typeMap.get(current.toLowerCase())) || defaultType;
      pkg.treatmentType = matched?._id;
      await pkg.save();
    }

    await Package.updateMany(
      { durationDays: { $exists: false }, duration: { $exists: true } },
      [
        {
          $set: {
            durationDays: '$duration',
          },
        },
      ]
    );

    // Keep legacy "departments" array in sync for older consumers
    await Package.updateMany(
      { departments: { $exists: true }, department: { $exists: true } },
      [
        {
          $set: {
            departments: {
              $cond: [
                { $gt: [{ $size: '$departments' }, 0] },
                '$departments',
                ['$department'],
              ],
            },
          },
        },
      ]
    );

    console.log('✅ Packages migrated');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

run();
