import { SetMetadata } from '@nestjs/common';

export type Action = 'read' | 'write' | 'admin' ;

export const Permissions = (feature: string, permission: Action) => {
  return (target: any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor) => {
    SetMetadata('feature', feature)(target, propertyKey!, descriptor!);
    SetMetadata('permission', permission)(target, propertyKey!, descriptor!);
  };
};
export const Features = (...features: string[]) => SetMetadata('features', features);
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
