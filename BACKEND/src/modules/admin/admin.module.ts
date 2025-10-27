import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { RoleModule } from '@modules/role/role.module';
import { UserModule } from '@modules/user/user.module';
import { FeatureModule } from '@modules/feature/feature.module';
import { UserFeaturePermissionModule } from '@modules/user-feature-permission/user-feature-permission.module';


@Module({
  imports: [UserModule, RoleModule,
  FeatureModule, UserFeaturePermissionModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {} 