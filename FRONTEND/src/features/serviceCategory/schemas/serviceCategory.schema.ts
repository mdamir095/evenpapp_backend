import { z } from 'zod';

export const serviceCategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  formId: z.string().optional(),
});

export type ServiceCategorySchemaType = z.infer<typeof serviceCategorySchema>;
