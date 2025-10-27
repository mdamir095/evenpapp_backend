import { z } from 'zod';
import type { Permission } from '../../../types/User';

export const permissionKeys: Permission[] = ['read', 'write', 'admin'];

export const featurePermissionSchema = z.object({
  featureId: z.string(),
  permissions: z.object({
    read: z.boolean().optional(),
    write: z.boolean().optional(),
    admin: z.boolean().optional(),
  }),
});

export const roleSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  featurePermissions: z.array(featurePermissionSchema),
});

export type RoleSchemaType = z.infer<typeof roleSchema>;
