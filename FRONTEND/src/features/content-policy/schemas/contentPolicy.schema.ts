import { z } from 'zod';

export const contentPolicySchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must not exceed 200 characters')
    .trim(),
  content: z
    .string()
    .min(1, 'Content is required')
    .max(100000, 'Content is too long')
    .refine((value) => {
      // Strip HTML tags to check actual text content
      const textContent = value.replace(/<[^>]*>/g, '').trim();
      return textContent.length >= 3;
    }, 'Content must contain at least 3 characters of text'),
  effectiveDate: z
    .string()
    .min(1, 'Effective date is required')
    .refine((value) => {
      const date = new Date(value);
      return !isNaN(date.getTime());
    }, 'Please enter a valid date'),
  category: z
    .string()
    .min(1, 'Category is required')
    .refine(
      (value) => value.length > 0,
      'Please select a valid category'
    ),
});

export type ContentPolicySchemaType = z.infer<typeof contentPolicySchema>;
