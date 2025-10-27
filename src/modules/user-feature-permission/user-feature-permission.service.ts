import { Injectable } from '@nestjs/common';
import { CreateUserFeaturePermissionDto } from './dto/create-user-feature-permission.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserFeaturePermission } from './entities/user-feature-permission.entity';
import { MongoRepository } from 'typeorm';
import { CreateRoleDto } from '@modules/role/dto/request/create-role.dto';
import { UpdateRoleDto } from '@modules/role/dto/request/update-role.dto';

@Injectable()
export class UserFeaturePermissionService {

    constructor(
    @InjectRepository(UserFeaturePermission,'mongo')
    private readonly repo: MongoRepository<UserFeaturePermission>,
  ) {}

  async createPermission(dto: CreateUserFeaturePermissionDto) {
    const savedPermissions = [];

    for (const perm of dto.permissions) {
      // Check if permission already exists for given roleId and featureId
      const existingPermission = await this.repo.findOne({
        where: {
          roleId: dto.roleId,
          featureId: perm.featureId,
        },
      });

      if (existingPermission) {
        // Update the existing record
        existingPermission.read = perm.read;
        existingPermission.write = perm.write;
        existingPermission.admin = perm.admin;

        savedPermissions.push(await this.repo.save(existingPermission));
      } else {
        // Create a new record
        const newPermission = this.repo.create({
          roleId: dto.roleId,
          featureId: perm.featureId,
          read: perm.read,
          write: perm.write,
          admin: perm.admin,
        });

        savedPermissions.push(await this.repo.save(newPermission));
      }
    }

    return savedPermissions;
  }


 async findByRoleId(roleId: string) {
  return this.repo.aggregate([
    {
      $match: { roleId: roleId },
    },
    {
      $addFields: {
        featureObjectId: { $toObjectId: '$featureId' }, 
      },
    },
    {
      $lookup: {
        from: 'features', 
        localField: 'featureObjectId',
        foreignField: '_id',
        as: 'feature',
      },
    },
    {
      $unwind: {
        path: '$feature',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 0,
        id: '$_id',
        roleId: 1,
        featureId: 1,
        read: 1,
        write: 1,
        admin: 1,
        feature: {
          id: '$feature._id',
          name: '$feature.name',

        },
      }
    }
  ]).toArray();
}
  async getPermissionByRoleAndFeature(roleId: string, featureId: string) {
  return this.repo.findOne({
    where: { roleId, featureId },
  });
}

 async bulkInsert(roleId:string, dto:CreateRoleDto){
    dto.featurePermissions=dto.featurePermissions?.filter((feature) => feature.permissions.read || feature.permissions.write || feature.permissions.admin);

    const permissionsToSave = dto.featurePermissions?.map((fp:any) => {
      return this.repo.create({
        roleId: roleId,
        featureId: fp.featureId,
        read: fp.permissions.read,
        write: fp.permissions.write,
        admin: fp.permissions.admin,
      });
    });
   return await this.repo.save(permissionsToSave);
 }
 async bulkUpdate(roleId: string, dto: UpdateRoleDto) {
   if (!dto.featurePermissions || dto.featurePermissions.length === 0) {
     return; // No permissions to update
   }

   dto.featurePermissions=dto.featurePermissions?.filter((feature) => feature.permissions.read || feature.permissions.write || feature.permissions.admin);
   for (const featurePermission of dto.featurePermissions) {
     // Check if permission already exists for this role + feature
     const existingPermission = await this.repo.findOne({
       where: {
         roleId: roleId,
         featureId: featurePermission.featureId
       }
     });

     if (existingPermission) {
       // Update existing permission
       existingPermission.read = featurePermission.permissions.read ?? existingPermission.read;
       existingPermission.write = featurePermission.permissions.write ?? existingPermission.write;
       existingPermission.admin = featurePermission.permissions.admin ?? existingPermission.admin;
       await this.repo.save(existingPermission);
     } else {
       // Create new permission
       const newPermission = this.repo.create({
         roleId: roleId,
         featureId: featurePermission.featureId,
         read: featurePermission.permissions.read ?? false,
         write: featurePermission.permissions.write ?? false,
         admin: featurePermission.permissions.admin ?? false,
       });
       await this.repo.save(newPermission);
     }
   }
 }
 async deleteMany(roleId:string){
  await this.repo.deleteMany({ roleId: roleId });
 }

 async deleteSpecificPermission(roleId: string, featureId: string) {
   await this.repo.deleteMany({ roleId: roleId, featureId: featureId });
 }

 // Method for complete replacement of all permissions (destructive)
 async bulkReplace(roleId: string, dto: UpdateRoleDto) {
   // Delete all existing permissions for this role
   await this.repo.deleteMany({ roleId });
   
   // Insert new permissions
   if (dto.featurePermissions && dto.featurePermissions.length > 0) {
     const permissionsToSave = dto.featurePermissions.map(fp => {
       return this.repo.create({
         roleId: roleId,
         featureId: fp.featureId,
         read: fp.permissions.read ?? false,
         write: fp.permissions.write ?? false,
         admin: fp.permissions.admin ?? false,
       });
     });
     await this.repo.save(permissionsToSave);
   }
 }
  
}
