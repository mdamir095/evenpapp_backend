import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { ServiceCategoryFormInput } from './entity/service-category-form-input.entity';
import { CreateServiceCategoryFormInputDto } from './dto/request/create-service-category-form-input.dto';
import { UpdateServiceCategoryFormInputDto } from './dto/request/update-service-category-form-input.dto';
import { ObjectId } from 'mongodb';

@Injectable()
export class ServiceCategoryFormInputsService {
  constructor(
    @InjectRepository(ServiceCategoryFormInput, 'mongo')
    private readonly repo: MongoRepository<ServiceCategoryFormInput>,
  ) {}

  async create(dto: CreateServiceCategoryFormInputDto) {
    const entity = this.repo.create({
      ...dto,
      active: dto.active ?? true,
    });
    return this.repo.save(entity);
  }

  async findAll(categoryId?: string) {
    const where = categoryId ? { categoryId } : {};
    return this.repo.find({ where, order: { createdAt: 'DESC' } as any });
  }

  async findOne(id: string) {
    if (!ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid form input id format: ${id}`);
    }
    const entity = await this.repo.findOneBy({ _id: new ObjectId(id) });
    if (!entity) throw new NotFoundException('Form input not found');
    return entity;
  }

  async update(id: string, dto: UpdateServiceCategoryFormInputDto) {
    const entity = await this.findOne(id);
    Object.assign(entity, dto);
    return this.repo.save(entity);
  }

  async remove(id: string) {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
    return { success: true };
  }
}
