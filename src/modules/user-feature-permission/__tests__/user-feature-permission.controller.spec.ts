import { Test, TestingModule } from '@nestjs/testing';
import { UserFeaturePermissionController } from './user-feature-permission.controller';
import { UserFeaturePermissionService } from './user-feature-permission.service';

describe('UserFeaturePermissionController', () => {
  let controller: UserFeaturePermissionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserFeaturePermissionController],
      providers: [UserFeaturePermissionService],
    }).compile();

    controller = module.get<UserFeaturePermissionController>(UserFeaturePermissionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
