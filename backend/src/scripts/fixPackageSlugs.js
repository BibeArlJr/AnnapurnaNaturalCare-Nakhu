require('dotenv').config();
const mongoose = require('mongoose');
const slugify = require('slugify');
const Package = require('../models/Package');

async function run() {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI not set');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');

  // Remove or fix bad slugs
  const badSelector = { $or: [{ slug: null }, { slug: '' }, { slug: { $exists: false } }] };
  const badDocs = await Package.find(badSelector);
  if (badDocs.length) {
    console.log(`Found ${badDocs.length} packages with bad slug. Deleting them.`);
    await Package.deleteMany(badSelector);
  } else {
    console.log('No bad slug documents found.');
  }

  // Drop old index if present
  try {
    await Package.collection.dropIndex('slug_1');
    console.log('Dropped slug_1 index');
  } catch (err) {
    if (err.codeName === 'IndexNotFound') {
      console.log('slug_1 index not found, skipping drop');
    } else {
      console.warn('Drop index warning:', err.message);
    }
  }

  // Recreate unique index
  await Package.collection.createIndex({ slug: 1 }, { unique: true });
  console.log('Recreated unique index on slug');

  await mongoose.disconnect();
  console.log('Done');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
