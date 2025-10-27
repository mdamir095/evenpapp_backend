import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { UserModule } from '@modules/user/user.module';

/**
 * Profile Module
 * 
 * This module provides universal profile management functionality
 * accessible to all authenticated users regardless of their role or permissions.
 * 
 * Features:
 * - Profile viewing and editing
 * - Password management
 * - Profile image upload
 * 
 * Access Control: Universal (all authenticated users)
 */
@Module({
  imports: [UserModule],
  controllers: [ProfileController],
  providers: [],
  exports: [],
})
export class ProfileModule {}
