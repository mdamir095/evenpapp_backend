import { ApiProperty } from '@nestjs/swagger';

export class FeaturePermissionDto {
  @ApiProperty({ description: 'Read permission', example: true })
  read: boolean;

  @ApiProperty({ description: 'Write permission', example: true })
  write: boolean;

  @ApiProperty({ description: 'Admin permission', example: false })
  admin: boolean;
}

export class FeatureWithPermissionDto {
  @ApiProperty({ description: 'Feature ID', example: '507f1f77bcf86cd799439013' })
  id: string;

  @ApiProperty({ description: 'Feature name', example: 'User Management' })
  name: string;

  @ApiProperty({ description: 'User permissions for this feature', type: FeaturePermissionDto })
  permissions: FeaturePermissionDto;
}

export class RoleWithFeaturesDto {
  @ApiProperty({ description: 'Role ID', example: '507f1f77bcf86cd799439012' })
  id: string;

  @ApiProperty({ description: 'Role name', example: 'Admin' })
  name: string;

  @ApiProperty({ 
    description: 'Features associated with this role', 
    type: [FeatureWithPermissionDto] 
  })
  features: FeatureWithPermissionDto[];
}

export class UserDataDto {
  @ApiProperty({ description: 'User ID', example: '507f1f77bcf86cd799439011' })
  id: string;

  @ApiProperty({ description: 'First name', example: 'John' })
  firstName: string;

  @ApiProperty({ description: 'Last name', example: 'Doe' })
  lastName: string;

  @ApiProperty({ description: 'Email address', example: 'john@example.com' })
  email: string;

  @ApiProperty({ description: 'Organization name', example: 'ABC Corp', required: false })
  organizationName?: string;

  @ApiProperty({ description: 'User active status', example: true })
  isActive: boolean;

  @ApiProperty({ description: 'Enterprise ID', example: '507f1f77bcf86cd799439014', required: false })
  enterpriseId?: string;

  @ApiProperty({ 
    description: 'User roles with features and permissions', 
    type: [RoleWithFeaturesDto] 
  })
  roles: RoleWithFeaturesDto[];

  @ApiProperty({ description: 'Creation date', example: '2023-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date', example: '2023-01-01T00:00:00.000Z' })
  updatedAt: Date;
}

export class GetUserByIdResponseDto {
  @ApiProperty({ description: 'Success status', example: true })
  success: boolean;

  @ApiProperty({ description: 'Response message', example: 'User details retrieved successfully' })
  message: string;

  @ApiProperty({ description: 'User data with complete role and permission details', type: UserDataDto })
  data: UserDataDto;
}

