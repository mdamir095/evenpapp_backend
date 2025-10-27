import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../modules/role/entities/role.entity';
import { UserFeaturePermission } from '../../modules/user-feature-permission/entities/user-feature-permission.entity';
import { Permissions } from '../decorators/permission.decorator';
import { RoleType } from '@shared/enums/roleType';

@Injectable()
export class FeatureGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  private readonly FEATURE_KEY = 'features';
  canActivate(context: ExecutionContext): boolean {
    // TEMPORARY: Disable FeatureGuard entirely for testing
    console.log('FeatureGuard: DISABLED for testing - allowing all requests');
    return true;
  }
}