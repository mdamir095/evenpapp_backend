import { z } from 'zod';

export const vendorCategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  formId: z.string().optional(),
});

export type VendorCategorySchemaType = z.infer<typeof vendorCategorySchema>;
