import { z } from 'zod';

export const vendorSchema = z.object({
  name: z.string().min(1, 'Vendor name is required'),
  description: z.string().optional(),
  serviceCategoryId: z.string().min(1, 'Service category is required'),
  enterpriseId: z.string().optional(),
  enterpriseName: z.string().optional(),
});

// Create a conditional schema for admin users
export const createVendorSchema = (isAdminUser: boolean) => {
  if (isAdminUser) {
    return vendorSchema.extend({
      enterpriseId: z.string().min(1, 'Enterprise selection is required'),
    });
  }
  return vendorSchema;
};

export type VendorSchemaType = z.infer<typeof vendorSchema>;
