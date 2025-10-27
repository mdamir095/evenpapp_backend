import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Feature } from '@modules/feature/entities/feature.entity';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { UserFeaturePermissionModule } from '@modules/user-feature-permission/user-feature-permission.module';

@Module({
  controllers: [RoleController],
  providers: [RoleService],
  exports: [RoleService],
  imports: [
        TypeOrmModule.forFeature([Role, Feature], 'mongo'),
        UserFeaturePermissionModule
  ]
})
export class RoleModule {}