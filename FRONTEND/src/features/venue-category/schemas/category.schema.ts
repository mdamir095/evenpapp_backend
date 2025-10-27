import { z } from 'zod';

export const VenueCategorySchema = z.object({
  name: z
    .string()
    .nonempty('Category name is required')
    .min(2, 'Category name must be at least 2 characters')
    .max(50, 'Category name must not exceed 50 characters'),
  description: z
    .string()
    .nonempty('Description is required')
    .min(5, 'Description must be at least 5 characters')
    .max(500, 'Description must not exceed 500 characters'),
  icon: z
    .string()
    .optional(),
  formId: z
    .string()
    .nonempty('Form selection is required'),
  // color: z
  //   .string()
  //   .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid color format. Please use hex color code.')
  //   .optional(),
  isActive: z
    .boolean()
    .optional()
    .default(true),
});
export type VenueCategorySchemaType = z.infer<typeof VenueCategorySchema>;
