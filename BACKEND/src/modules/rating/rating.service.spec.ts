import { Test, TestingModule } from '@nestjs/testing';
import { RatingService } from './rating.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Rating } from './entity/rating.entity';

describe('RatingService', () => {
  let service: RatingService;

  const mockRatingRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RatingService,
        {
          provide: getRepositoryToken(Rating, 'mongo'),
          useValue: mockRatingRepository,
        },
      ],
    }).compile();

    service = module.get<RatingService>(RatingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
