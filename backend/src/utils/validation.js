const { z } = require('zod');

// Package creation validation (relaxed to accept FormData strings)
const createPackageSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  price: z.coerce.number({ invalid_type_error: 'Price must be a number' }),
  duration: z
    .coerce.number({ invalid_type_error: 'Duration must be a number' })
    .int()
    .positive()
    .optional(),
  shortDescription: z.string().optional(),
  longDescription: z.string().optional(),
  description: z.string().optional(),
  included: z.array(z.string()).optional(),
  departments: z.preprocess(
    (val) => (Array.isArray(val) ? val : val ? [val] : []),
    z.array(z.string()).min(1, 'Select at least one department')
  ),
});

module.exports = {
  createPackageSchema,
};
