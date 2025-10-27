import { UserService } from '@modules/user/user.service';
import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserFeaturePermissionService } from '@modules/user-feature-permission/user-feature-permission.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly userService: UserService,
    private readonly permissionService: UserFeaturePermissionService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredFeature = this.reflector.get<string>('feature', context.getHandler());
    const requiredPermission = this.reflector.get<string>('permission', context.getHandler());

    if (!requiredFeature || !requiredPermission) {
      return true; // No specific feature or permission required
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user || !user.roles || user?.roles?.length === 0) {
      throw new ForbiddenException('You do not have the required permissions');
    }

    let userDetails:any = await this.userService.findOneWithRoles({ id: user.id });
    if (!userDetails || !userDetails?.roleIds || userDetails?.roleIds?.length === 0) {
      throw new ForbiddenException(`User does not have any roles assigned`);
    }
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if(requiredRoles?.length){
      const hasRole = userDetails?.roles?.some((role:any) => requiredRoles.includes(role.name));
      if (!hasRole) {
        throw new ForbiddenException(`You do not have the required role(s): ${requiredRoles.join(', ')}`);
      }
    }

    let hasPermission = false;
    if (userDetails?.roles) {
      for (const role of userDetails.roles) {
        if (role.featureIds) {
          for (const feature of role.featureIds) {
            if (feature.name !== requiredFeature) continue;
            const userPermissions: any = await this.permissionService.getPermissionByRoleAndFeature(role?.id.toString(), feature?.id.toString());
            switch (requiredPermission) {
              case 'read':
                if (userPermissions?.read) {
                  hasPermission = true;
                  break;
                }
                break;
              case 'write':
                if (userPermissions?.write) {
                  hasPermission = true;
                  break;
                }
                break;
              case 'admin':
                if (userPermissions?.admin) {
                  hasPermission = true;
                  break;
                }
                break;
              default:
                break;
            }
            if (hasPermission) break;
          }
        }
        if (hasPermission) break;
      }
    }
    if (!hasPermission) {
      throw new ForbiddenException(`You do not have the required permission: ${requiredPermission} for feature: ${requiredFeature}`);
    }
    return true;
  }
}
