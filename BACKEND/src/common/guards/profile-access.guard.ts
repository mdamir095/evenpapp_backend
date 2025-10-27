import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Profile Access Guard
 * 
 * This guard ensures that profile-related endpoints are accessible to all authenticated users
 * regardless of their role or feature permissions. It only verifies JWT authentication.
 * 
 * Usage: Apply this guard to profile endpoints that should be universally accessible
 * to all user types (SUPER_ADMIN, ADMIN, USER, ENTERPRISE_ADMIN, ENTERPRISE_USER)
 */
@Injectable()
export class ProfileAccessGuard extends AuthGuard('jwt') implements CanActivate {
  
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // First, validate JWT authentication
    const isAuthenticated = await super.canActivate(context);
    
    if (!isAuthenticated) {
      throw new UnauthorizedException('Authentication required for profile access');
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Ensure user object exists and has required properties
    if (!user || !user.id) {
      throw new UnauthorizedException('Invalid user session');
    }

    // Allow access for all authenticated users
    // No role or feature permission checks needed for profile access
    return true;
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid authentication for profile access');
    }
    return user;
  }
}
