import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository, ObjectLiteral } from 'typeorm';
import { MealType } from './entity/meal-type.entity';
import { CreateMealTypeDto } from './dto/request/create-meal-type.dto';
import { UpdateMealTypeDto } from './dto/request/update-meal-type.dto';
import { MealTypeResponseDto } from './dto/response/meal-type.dto';
import { plainToInstance } from 'class-transformer';
import { ObjectId } from 'mongodb';
import { IPagination } from '@common/interfaces/pagination.interface';
import { IPaginationMeta } from '@common/interfaces/paginationMeta.interface';

@Injectable()
export class MealTypeService {
  constructor(
    @InjectRepository(MealType, 'mongo')
    private readonly repo: MongoRepository<MealType>,
  ) {}

  async create(dto: CreateMealTypeDto): Promise<MealTypeResponseDto> {
    const entity = this.repo.create(dto);
    const saved = await this.repo.save(entity);
    return plainToInstance(MealTypeResponseDto, saved, { excludeExtraneousValues: true });
  }

  async findAll(page: number, limit: number, search: string): Promise<IPagination<MealTypeResponseDto>> {
    const skip = (page - 1) * limit;
    const query: ObjectLiteral = {};
    if (search) {
      query.name = { $regex: new RegExp(search, 'i') };
    }
    const total = await this.repo.count(query);
    const items = await this.repo.find({ where: query, skip, take: limit, order: { createdAt: 'desc' } });
    const data = plainToInstance(MealTypeResponseDto, items, { excludeExtraneousValues: true });
    const pagination: IPaginationMeta = { total, page, limit, totalPages: Math.ceil(total / limit) };
    return { data, pagination };
  }

  async findOne(id: string): Promise<MealTypeResponseDto> {
    if (!ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid meal type id format: ${id}`);
    }
    const entity = await this.repo.findOneBy({ _id: new ObjectId(id) });
    if (!entity) {
      throw new NotFoundException(`Meal type not found with id: ${id}`);
    }
    return plainToInstance(MealTypeResponseDto, entity, { excludeExtraneousValues: true });
  }

  async update(id: string, dto: UpdateMealTypeDto): Promise<MealTypeResponseDto> {
    if (!ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid meal type id format: ${id}`);
    }
    const entity = await this.repo.findOne({ where: { _id: new ObjectId(id) } });
    if (!entity) {
      throw new NotFoundException(`Meal type not found with id: ${id}`);
    }
    Object.assign(entity, dto);
    const saved = await this.repo.save(entity);
    return plainToInstance(MealTypeResponseDto, saved, { excludeExtraneousValues: true });
  }

  async delete(id: string): Promise<{ message: string }> {
    if (!ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid meal type id format: ${id}`);
    }
    const result = await this.repo.updateOne({ _id: new ObjectId(id) }, { $set: { isActive: false, isDeleted: true, updatedAt: new Date() } });
    if (result.modifiedCount === 0) {
      throw new NotFoundException(`Meal type not found with id: ${id}`);
    }
    return { message: 'Meal type deleted successfully' };
  }

  async updateStatus(id: string, isActive: boolean): Promise<{ message: string }> {
    if (!ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid meal type id format: ${id}`);
    }
    const result = await this.repo.updateOne({ _id: new ObjectId(id) }, { $set: { isActive, updatedAt: new Date() } });
    if (result.modifiedCount === 0) {
      throw new NotFoundException(`Meal type not found with id: ${id}`);
    }
    return { message: 'Meal type status updated successfully' };
  }
}


