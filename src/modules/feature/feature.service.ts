import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Feature } from './entities/feature.entity';
import { MongoRepository} from 'typeorm';
import { CreateFeatureDto } from './dto/request/create-feature.dto';
import { ObjectId } from 'mongodb';

@Injectable()
export class FeatureService {
     constructor(
    @InjectRepository(Feature, 'mongo')
    private featureRepo: MongoRepository<Feature>
  ) {}

  async create(dto: CreateFeatureDto): Promise<Feature> {
    const uniqueId = dto.name.toLowerCase().replace(/ /g, '_');
    const existing = await this.featureRepo.findOne({ where: { name: dto.name, uniqueId: uniqueId } });
    if (existing) throw new ConflictException('Feature already exists');

    const feature = this.featureRepo.create(dto);
    feature.uniqueId = uniqueId;
    return this.featureRepo.save(feature);
  }

  async findAll(page = 1, limit = 10) {
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    this.featureRepo.find({
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    }),
    this.featureRepo.count(),
  ]);

  return {
    data,
    pagination: {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  }
  };
  }


  async findByName(name: string): Promise<Feature | null> {
    return this.featureRepo.findOne({ where: { name } });
  }

  async update(id: string, dto: CreateFeatureDto): Promise<Feature> {
    const feature = await this.featureRepo.findOneBy({ _id: new ObjectId(id) });
    if (!feature) throw new NotFoundException('Feature not found');
    Object.assign(feature, dto);
    return this.featureRepo.save(feature);
  }

  async delete(id: string): Promise<{ message: string }> {
    const result = await this.featureRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Feature not found');
    }
    return { message: 'Feature deleted successfully' };
  }
  async getFeatureById(id: string): Promise<Feature> {
    const feature = await this.featureRepo.findOneBy({ _id: new ObjectId(id) });
    if (!feature) throw new NotFoundException('Feature not found');
    return feature;
  }
}
