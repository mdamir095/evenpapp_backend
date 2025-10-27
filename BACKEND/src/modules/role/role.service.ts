import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { Role } from './entities/role.entity';
import { Feature } from '@modules/feature/entities/feature.entity';
import { CreateRoleDto } from './dto/request/create-role.dto';
import { UpdateRoleDto } from './dto/request/update-role.dto';
import { ObjectId } from 'mongodb';
import { UserFeaturePermissionService } from '@modules/user-feature-permission/user-feature-permission.service';
import { CreateFeaturePermissionDto } from './dto/request/create-feature-permission.dto';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role, 'mongo')
    private readonly roleRepository: MongoRepository<Role>,
    @InjectRepository(Feature, 'mongo')
    private readonly featureRepository: MongoRepository<Feature>,
    private readonly userFeaturePermission: UserFeaturePermissionService,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    try {
      const existingRole = await this.roleRepository.findOne({
        where: { name: createRoleDto.name },
      });

      if (existingRole) {
        throw new ConflictException(
          `Role '${createRoleDto.name}' already exists`,
        );
      }
      // 1. Create Role
      const featureIds = createRoleDto.featurePermissions.map(
        (fp) => new ObjectId(fp.featureId),
      );
      const existingFeatures = await this.featureRepository.find({
        where: {
          _id: { $in: featureIds },
        },
      });
      if (existingFeatures.length !== featureIds.length) {
        throw new BadRequestException('One or more featureIds are invalid.');
      }
      const newRole = this.roleRepository.create({
        name: createRoleDto.name,
        featureIds: featureIds,
      });

      const savedRole = await this.roleRepository.save(newRole);

      // 2. Create Feature Permissions
      if (createRoleDto.featurePermissions?.length) {
        await this.userFeaturePermission.bulkInsert(
          savedRole.id.toString(),
          createRoleDto,
        );
      }
      return savedRole;
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error(error);
      throw new BadRequestException('Failed to create role');
    }
  }

  async findAll(filters: { name?: string; page: number; limit: number }) {
    try {
      const { name, page, limit } = filters;

      const match: any = {};
      if (name) {
        match.name = { $regex: name, $options: 'i' };
      }

      const pipeline = [
      { $match: match },
      {
        $lookup: {
          from: 'user_feature_permissions',
          let: { roleIdStr: { $toString: '$_id' } },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$$roleIdStr', '$roleId'] },
              },
            },
            {
              $lookup: {
                from: 'features',
                let: { featureObjId: { $toObjectId: '$featureId' } },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ['$_id', '$$featureObjId'],
                      },
                    },
                  },
                ],
                as: 'feature',
              },
            },
            {
              $unwind: {
                path: '$feature',
                preserveNullAndEmptyArrays: true,
              },
            },
          ],
          as: 'featurePermissionsRaw',
        },
      },
      { $sort: { created: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
      {
        $project: {
          id: { $toString: '$_id' },
          _id: 0,
          name: 1,
          featurePermissions: {
            $map: {
              input: '$featurePermissionsRaw',
              as: 'fp',
              in: {
                featureId: '$$fp.featureId',
                featureName: '$$fp.feature.name',
                permissions: {
                  read: '$$fp.read',
                  write: '$$fp.write',
                  admin: '$$fp.admin',
                },
              },
            },
          },
        },
      },
      ];
      const [data, total] = await Promise.all([
        this.roleRepository.aggregate(pipeline).toArray(),
        this.roleRepository.countDocuments(match),
      ]);

      return {
        data,
        pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
      };
    } catch (error) {
      throw new BadRequestException('Failed to fetch roles');
    }
  }
  async getRoleList() {
    try {
      const pipeline = [
        { $sort: { name: 1 } },
        {
          $project: {
            id: '$_id',
            _id: 0,
            name: 1,
            featureIds: 1,
          },
        },
      ];
      return await this.roleRepository.aggregate(pipeline).toArray();
    } catch (error) {
      throw new BadRequestException('Failed to fetch roles');
    }
  }

  async findOne(id: string): Promise<Role> {
    try {
      if (!ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid role ID format');
      }

    const [role] = await this.roleRepository.aggregate([
      {
        $match: { _id: new ObjectId(id) },
      },
      {
        $lookup: {
          from: 'user_feature_permissions',
          let: { roleIdStr: { $toString: '$_id' } },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$$roleIdStr', '$roleId'] },
              },
            },
          ],
          as: 'featurePermissionsRaw',
        },
      },
      {
        $project: {
          _id: 0,
          name: 1,
          featurePermissions: {
            $map: {
              input: '$featurePermissionsRaw',
              as: 'fp',
              in: {
                featureId: '$$fp.featureId',
                permissions: {
                  write: '$$fp.write',
                  read: '$$fp.read',
                  admin: '$$fp.admin',
                },
              },
            },
          },
        },
      },
    ]).toArray();


      if (!role) {
        throw new NotFoundException(`Role with ID '${id}' not found`);
      }

      return role;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch role');
    }
  }

  async findByName(name: string): Promise<any> {
    try {
      return await this.roleRepository.findOne({
        where: { name },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch role');
    }
  }

  async update(
    roleId: string,
    updateRoleDto: UpdateRoleDto,
  ): Promise<{ message: string }> {
    try {
      const role = await this.roleRepository.findOneBy({
        _id: new ObjectId(roleId),
      });
      if (!role) throw new NotFoundException('Role not found');

      // Update role name if provided
      if (updateRoleDto.name) {
        role.name = updateRoleDto.name;
      }

      // Handle featureIds update - only if featurePermissions are provided
      if (updateRoleDto.featurePermissions && updateRoleDto.featurePermissions.length > 0) {
        const validFeaturePermissions = updateRoleDto.featurePermissions.filter(fp =>
          fp.permissions.read || fp.permissions.write || fp.permissions.admin
        );

        if (validFeaturePermissions.length > 0) {
          const newFeatureIds = validFeaturePermissions.map(fp => new ObjectId(fp.featureId));
          
          // Validate that all new feature IDs exist
          const existingFeatures = await this.featureRepository.find({
            where: { _id: { $in: newFeatureIds } },
          });

          if (existingFeatures.length !== newFeatureIds.length) {
            throw new BadRequestException('One or more featureIds are invalid.');
          }

          // Merge with existing featureIds - add new ones, keep existing ones
          const existingFeatureIds = role.featureIds || [];
          const mergedFeatureIds = [...existingFeatureIds];
          
          // Add new feature IDs that don't already exist
          newFeatureIds.forEach(newId => {
            const exists = mergedFeatureIds.some(existingId => 
              existingId.toString() === newId.toString()
            );
            if (!exists) {
              mergedFeatureIds.push(newId);
            }
          });

          role.featureIds = mergedFeatureIds;
        }

        // Update permissions for the provided features
        await this.userFeaturePermission.bulkUpdate(
          role.id.toString(),
          updateRoleDto,
        );
      }

      await this.roleRepository.save(role);
      return { message: 'Role updated successfully' };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to update role');
    }
  }

  async removeFeatureFromRole(
    roleId: string,
    featureId: string,
  ): Promise<{ message: string }> {
    try {
      const role = await this.roleRepository.findOneBy({
        _id: new ObjectId(roleId),
      });
      if (!role) throw new NotFoundException('Role not found');

      if (!ObjectId.isValid(featureId)) {
        throw new BadRequestException('Invalid feature ID format');
      }

      // Remove the feature from role.featureIds
      const featureObjectId = new ObjectId(featureId);
      role.featureIds = (role.featureIds || []).filter(
        id => id.toString() !== featureObjectId.toString()
      );

      await this.roleRepository.save(role);

      // Also remove the corresponding permissions
      await this.userFeaturePermission.deleteSpecificPermission(roleId, featureId);

      return { message: 'Feature removed from role successfully' };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to remove feature from role');
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    try {
      if (!ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid role ID format');
      }

      // Check if role exists
      await this.findOne(id);

      // Delete the role
      const result = await this.roleRepository.delete({ id: new ObjectId(id) });

      if (result.affected === 0) {
        throw new NotFoundException(`Role with ID '${id}' not found`);
      }

      return { message: 'Role deleted successfully' };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to delete role');
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      if (!ObjectId.isValid(id)) {
        return false;
      }

      const count = await this.roleRepository.count({
        where: { _id: id as any },
      });

      return count > 0;
    } catch (error) {
      return false;
    }
  }

  async findByIds(ids: ObjectId[]): Promise<Role[]> {
    try {
      if (!ids || ids.length === 0) {
        return [];
      }

      const roles: any = await this.roleRepository.find({
        where: {
          _id: { $in: ids },
        },
      });

      // Populate features for each role
      for (const role of roles) {
        if (role.featureIds && role.featureIds.length > 0) {
          const features = await this.featureRepository.find({
            where: {
              _id: { $in: role.featureIds },
            },
          });
          role.featureIds = features.map((feature) => ({
            name: feature.name,
            id: feature.id,
          }));
        }
      }

      return roles;
    } catch (error) {
      throw new BadRequestException('Failed to fetch roles by IDs');
    }
  }

  async save(role: any): Promise<Role> {
    try {
      return await this.roleRepository.save(role);
    } catch (error) {
      throw new BadRequestException('Failed to save role');
    }
  }
  async getRoleById(id: string) {
    return this.roleRepository.findOneBy({ _id: new ObjectId(id) });
  }

  async deleteRole(id: string) {
    const result = await this.roleRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Role not found');
    }
    await this.userFeaturePermission.deleteMany(id);
    return { message: 'Role deleted successfully' };
  }

  async createEnterpriseRole(roleName: string, features: CreateFeaturePermissionDto[]) {
    const role = await this.roleRepository.findOne({
      where: { name: roleName },
    });
    if (role) {
      throw new ConflictException('Role already exists');
    }

    const featureIds = features.map(feature => new ObjectId(feature.featureId));

    const newRole = this.roleRepository.create({
      name: roleName,
      featureIds,
      isInternal: true,
    });
    const savedRole = await this.roleRepository.save(newRole);
    await this.userFeaturePermission.bulkInsert(
      savedRole.id.toString(),
      {
        name: roleName,
        featurePermissions: features,
      }
    );
    const featurePermissions = await this.userFeaturePermission.findByRoleId(savedRole.id.toString());
    const userFeaturePermissions = featurePermissions.map(fp => ({
      id: fp.id,
      featureId: fp.featureId,
      permissions: {
        read: fp.read,
        write: fp.write,
        admin: fp.admin,
      },
    }));
    return {savedRole, userFeaturePermissions};
  }

  async updateEnterpriseRole(roleId: string, roleName: string, features: CreateFeaturePermissionDto[]) {
    const featureIds = features.map(feature => new ObjectId(feature.featureId));
    await this.roleRepository.updateOne({ _id: new ObjectId(roleId) }, { $set: { featureIds, isInternal: true, name: roleName } });
    await this.userFeaturePermission.bulkUpdate(
      roleId,
      {
        featurePermissions: features,
      }
    );
    const featurePermissions = await this.userFeaturePermission.findByRoleId(roleId);
    const featurePermissionIds = featurePermissions.map(fp => new ObjectId(fp.id));
    return {featurePermissionIds};
  }

  async deleteEnterpriseRole(roleName: string) {
    const role = await this.roleRepository.findOne({
      where: { name: roleName },
    });
    if (!role) throw new NotFoundException('Role not found');
    await this.roleRepository.delete(role.id.toString());
    await this.userFeaturePermission.deleteMany(role.id.toString());
    return { message: 'Role deleted successfully' };
  }
}