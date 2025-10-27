import { z } from 'zod';

export const featureSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  isActive: z.boolean().optional(),
});

export type FeatureSchemaType = z.infer<typeof featureSchema>;
