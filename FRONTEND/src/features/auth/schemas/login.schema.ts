import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .nonempty('Email is required'),
  password: z.string().nonempty('Password is required'),
  rememberMe: z.boolean().optional(),
});

export type LoginSchemaType = z.infer<typeof loginSchema>;

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


export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .nonempty('Email is required')
    .email('Invalid email address'),
});

export type ForgotPasswordSchemaType = z.infer<typeof forgotPasswordSchema>;

export const updateProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  countryCode: z.string().min(1, 'Country code is required'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  organizationName: z.string().min(1, 'Organization name is required'),
  profileImage: z.string().optional(),
});

export type UpdateProfileSchemaType = z.infer<typeof updateProfileSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .nonempty('Old password is required')
      .min(6, 'Password must be at least 6 characters'),
    newPassword: z
      .string()
      .nonempty('New password is required')
      .min(6, 'Password must be at least 6 characters'),
    confirmPassword: z
      .string()
      .nonempty('Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  });

export type ChangePasswordSchemaType = z.infer<typeof changePasswordSchema>;
