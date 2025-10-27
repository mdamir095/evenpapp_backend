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

export const employeeSchema = z.object({
  firstName: z.string().min(1, 'First Name is required'),
  lastName: z.string().min(1, 'Last Name is required'),
  email: z
    .string()
    .nonempty('Email is required')
    .email('Invalid email address'),
  organizationName: z.string().optional(),
  countryCode: z.string().min(1, 'Country code is required'),
  phoneNumber: z
    .string()
    .min(1, 'Phone Number is required'),
    isActive: z.boolean().optional(),
    isEmailVerified: z.boolean().optional(),
  features: z.array(featurePermissionSchema),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
});

export type EmployeeSchemaType = z.infer<typeof employeeSchema>;
