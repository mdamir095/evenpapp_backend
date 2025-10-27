import { z } from 'zod';

export const venueSchema = z.object({
  name: z.string().min(1, 'Venue Title is required'),
  description: z.string().optional(),
  serviceCategoryId: z.string().min(1, 'Service Category is required'),
  enterpriseId: z.string().optional(),
  enterpriseName: z.string().optional(),
  // city: z.string().min(1, 'City is required'),
  // state: z.string().min(1, 'State is required'),
  // fullAddress: z.string().min(1, 'Full Address is required'),
});

// Create a conditional schema for admin users
export const createVenueSchema = (isAdminUser: boolean) => {
  if (isAdminUser) {
    return venueSchema.extend({
      enterpriseId: z.string().min(1, 'Enterprise selection is required'),
    });
  }
  return venueSchema;
};
export type VenueSchemaType = z.infer<typeof venueSchema>