import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository, ObjectLiteral } from 'typeorm';
import { ServingStyle } from './entity/serving-style.entity';
import { CreateServingStyleDto } from './dto/request/create-serving-style.dto';
import { UpdateServingStyleDto } from './dto/request/update-serving-style.dto';
import { ServingStyleResponseDto } from './dto/response/serving-style.dto';
import { plainToInstance } from 'class-transformer';
import { ObjectId } from 'mongodb';
import { IPagination } from '@common/interfaces/pagination.interface';
import { IPaginationMeta } from '@common/interfaces/paginationMeta.interface';

@Injectable()
export class ServingStyleService {
  constructor(
    @InjectRepository(ServingStyle, 'mongo')
    private readonly repo: MongoRepository<ServingStyle>,
  ) {}

  async create(dto: CreateServingStyleDto): Promise<ServingStyleResponseDto> {
    const entity = this.repo.create(dto);
    const saved = await this.repo.save(entity);
    return plainToInstance(ServingStyleResponseDto, saved, { excludeExtraneousValues: true });
  }

  async findAll(page: number, limit: number, search: string): Promise<IPagination<ServingStyleResponseDto>> {
    const skip = (page - 1) * limit;
    const query: ObjectLiteral = {};
    if (search) {
      query.name = { $regex: new RegExp(search, 'i') };
    }
    const total = await this.repo.count(query);
    const items = await this.repo.find({ where: query, skip, take: limit, order: { createdAt: 'desc' } });
    const data = plainToInstance(ServingStyleResponseDto, items, { excludeExtraneousValues: true });
    const pagination: IPaginationMeta = { total, page, limit, totalPages: Math.ceil(total / limit) };
    return { data, pagination };
  }

  async findOne(id: string): Promise<ServingStyleResponseDto> {
    if (!ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid serving style id format: ${id}`);
    }
    const entity = await this.repo.findOneBy({ _id: new ObjectId(id) });
    if (!entity) {
      throw new NotFoundException(`Serving style not found with id: ${id}`);
    }
    return plainToInstance(ServingStyleResponseDto, entity, { excludeExtraneousValues: true });
  }

  async update(id: string, dto: UpdateServingStyleDto): Promise<ServingStyleResponseDto> {
    if (!ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid serving style id format: ${id}`);
    }
    const entity = await this.repo.findOne({ where: { _id: new ObjectId(id) } });
    if (!entity) {
      throw new NotFoundException(`Serving style not found with id: ${id}`);
    }
    Object.assign(entity, dto);
    const saved = await this.repo.save(entity);
    return plainToInstance(ServingStyleResponseDto, saved, { excludeExtraneousValues: true });
  }

  async delete(id: string): Promise<{ message: string }> {
    if (!ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid serving style id format: ${id}`);
    }
    const result = await this.repo.updateOne({ _id: new ObjectId(id) }, { $set: { isActive: false, isDeleted: true, updatedAt: new Date() } });
    if (result.modifiedCount === 0) {
      throw new NotFoundException(`Serving style not found with id: ${id}`);
    }
    return { message: 'Serving style deleted successfully' };
  }

  async updateStatus(id: string, isActive: boolean): Promise<{ message: string }> {
    if (!ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid serving style id format: ${id}`);
    }
    const result = await this.repo.updateOne({ _id: new ObjectId(id) }, { $set: { isActive, updatedAt: new Date() } });
    if (result.modifiedCount === 0) {
      throw new NotFoundException(`Serving style not found with id: ${id}`);
    }
    return { message: 'Serving style status updated successfully' };
  }
}


