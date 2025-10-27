import { z } from 'zod';

export const enterpriseSchema = z.object({
  firstName: z.string().min(1, 'First Name is required'),
  lastName: z.string().min(1, 'Last Name is required'),
  email: z.string().email('Invalid email'),
  countryCode: z.string().min(1, 'Country code is required'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  enterpriseName: z.string().min(1, 'Enterprise Name is required'),
  description: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  features: z.array(
    z.object({
      featureId: z.string(),
      permissions: z.object({
        read: z.boolean().optional(),
        write: z.boolean().optional(),
        admin: z.boolean().optional(),
      }),
    })
  ).optional(),
});

export type EnterpriseSchemaType = z.infer<typeof enterpriseSchema>;

export const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .nonempty('New password is required')
      .min(6, 'Password must be at least 6 characters'),
    confirmNewPassword: z
      .string()
      .nonempty('Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  });

export type ResetPasswordSchemaType = z.infer<typeof resetPasswordSchema>;