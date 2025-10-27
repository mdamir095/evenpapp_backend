import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { Banner } from './entity/banner.entity';
import { CreateBannerDto } from './dto/request/create-banner.dto';
import { UpdateBannerDto } from './dto/request/update-banner.dto';
import { ObjectId } from 'mongodb';


@Injectable()
export class BannerService {
  constructor(
    @InjectRepository(Banner, 'mongo')
    private readonly repo: MongoRepository<Banner>,
  ) {}

  async create(dto: CreateBannerDto): Promise<Banner> {
    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  async findAll(page = 1, limit = 10, isActive?: boolean) {
    const where: any = {};
    if (typeof isActive === 'boolean') where.isActive = isActive;
    const [data, total] = await this.repo.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { data, total, page, limit };
  }

  async findActiveForMobile() {
    return this.repo.find({
      where: {
        isActive: true,
      },
      order: { createdAt: 'DESC'},
    });
  }

  async findOne(id: string) {
    const entity = await this.repo.findOne({ where: { _id: new ObjectId(id) } });
    if (!entity) throw new NotFoundException('Banner not found');
    return entity;
  }

  async update(id: string, dto: UpdateBannerDto) {
    const entity = await this.findOne(id);
    Object.assign(entity, dto);
    return this.repo.save(entity);
  }

  async remove(id: string) {
    const entity = await this.findOne(id);
    await this.repo.delete(entity.id as any);
    return { message: 'Banner deleted successfully' };
  }
}

