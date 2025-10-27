import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { Testimonial } from './entity/testimonial.entity';
import { CreateTestimonialDto } from './dto/request/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/request/update-testimonial.dto';
import { ObjectId } from 'mongodb';

@Injectable()
export class TestimonialService {
  constructor(
    @InjectRepository(Testimonial, 'mongo')
    private readonly repo: MongoRepository<Testimonial>,
  ) {}

  async create(dto: CreateTestimonialDto) {
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
      order: { createdAt: 'DESC' as any },
    });
    return { data, total, page, limit };
  }

  async findActiveForMobile() {
    return this.repo.find({
      where: { isActive: true } ,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const entity = await this.repo.findOne({ where: { _id: new ObjectId(id) } });
    if (!entity) throw new NotFoundException('Testimonial not found');
    return entity;
  }

  async update(id: string, dto: UpdateTestimonialDto) {
    const entity = await this.findOne(id);
    Object.assign(entity, dto);
    return this.repo.save(entity);
  }

  async remove(id: string) {
    const entity = await this.findOne(id);
    await this.repo.delete(entity.id as any);
    return { message: 'Testimonial deleted successfully' };
  }
}

