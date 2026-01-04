const { z } = require('zod');

// Package creation validation (relaxed to accept FormData strings)
const createPackageSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  price: z.coerce.number({ invalid_type_error: 'Price must be a number' }),
  durationDays: z
    .coerce.number({ invalid_type_error: 'Duration must be a number' })
    .int()
    .positive()
    .optional(),
  duration: z
    .coerce.number({ invalid_type_error: 'Duration must be a number' })
    .int()
    .positive()
    .optional(),
  treatmentType: z.string().optional(),
  department: z.string().min(1, 'Select a department'),
  shortDescription: z.string().optional(),
  longDescription: z.string().optional(),
  description: z.string().optional(),
  included: z.array(z.string()).optional(),
  departments: z
    .preprocess((val) => (Array.isArray(val) ? val : val ? [val] : []), z.array(z.string()))
    .optional(),
  galleryImages: z.array(z.string()).optional(),
  promoVideo: z.string().optional(),
  promoVideos: z
    .array(
      z.union([
        z.string(),
        z.object({
          type: z.enum(['file', 'url']).optional(),
          url: z.string().min(1, 'Video url required'),
          thumbnail: z.string().optional(),
        }),
      ])
    )
    .optional(),
  videoUrl: z.string().optional(),
});

module.exports = {
  createPackageSchema,
};
