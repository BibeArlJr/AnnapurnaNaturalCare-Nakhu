require('dotenv').config();
const connectDB = require('../config/db');
const Package = require('../models/Package');

async function migratePackages() {
  await connectDB();
  const packages = await Package.find();

  for (const pkg of packages) {
    if (pkg.department && (!pkg.departments || pkg.departments.length === 0)) {
      pkg.departments = [pkg.department];
      pkg.department = undefined;
      await pkg.save();
      console.log(`Migrated package ${pkg._id}`);
    }
  }

  console.log('Package migration complete');
  process.exit(0);
}

migratePackages().catch((err) => {
  console.error('Migration failed', err);
  process.exit(1);
});
