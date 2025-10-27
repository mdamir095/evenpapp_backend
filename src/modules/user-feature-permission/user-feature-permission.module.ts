import { Module } from '@nestjs/common';
import { UserFeaturePermissionService } from './user-feature-permission.service';
import { UserFeaturePermissionController } from './user-feature-permission.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserFeaturePermission } from './entities/user-feature-permission.entity';

@Module({
      controllers: [UserFeaturePermissionController],
      providers: [
          UserFeaturePermissionService
      ],
      exports: [
          UserFeaturePermissionService
          
      ],
      imports: [
          TypeOrmModule.forFeature([UserFeaturePermission], 'mongo'),
      ],
})
export class UserFeaturePermissionModule {}
