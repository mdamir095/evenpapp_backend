import { Test, TestingModule } from '@nestjs/testing';
import { UserFeaturePermissionService } from '../user-feature-permission.service';

describe('UserFeaturePermissionService', () => {
  let service: UserFeaturePermissionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserFeaturePermissionService],
    }).compile();

    service = module.get<UserFeaturePermissionService>(UserFeaturePermissionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
