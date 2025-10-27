import { z } from 'zod';

// Feature permission schema (same as role module)
export const featurePermissionSchema = z.object({
  featureId: z.string(),
  permissions: z.object({
    read: z.boolean().optional(),
    write: z.boolean().optional(),
    admin: z.boolean().optional(),
  }),
});

export const userSchema = z.object({
  firstName: z.string().min(1, 'First Name is required'),
  lastName: z.string().min(1, 'Last Name is required'),
  email: z
    .string()
    .nonempty('Email is required')
    .email('Invalid email address'),
  organizationName: z.string().min(1, 'Organization Name is required'),
  countryCode: z.string().min(1, 'Country code is required'),
  phoneNumber: z
    .string()
    .min(1, 'Phone Number is required'),
    isActive: z.boolean().optional(),
    isEmailVerified: z.boolean().optional(),
  features: z.array(featurePermissionSchema), // ✅ Replaced roleIds with features
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  password: z.string().optional(),
});

export type UserSchemaType = z.infer<typeof userSchema>;
