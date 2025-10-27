import { PartialType } from '@nestjs/mapped-types';
import { CreateUserFeaturePermissionDto } from './create-user-feature-permission.dto';

export class UpdateUserFeaturePermissionDto extends PartialType(CreateUserFeaturePermissionDto) {}
