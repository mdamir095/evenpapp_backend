import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository, ObjectLiteral } from 'typeorm';
import { Cuisine } from './entity/cuisine.entity';
import { CreateCuisineDto } from './dto/request/create-cuisine.dto';
import { UpdateCuisineDto } from './dto/request/update-cuisine.dto';
import { CuisineResponseDto } from './dto/response/cuisine.dto';
import { plainToInstance } from 'class-transformer';
import { ObjectId } from 'mongodb';
import { IPagination } from '@common/interfaces/pagination.interface';
import { IPaginationMeta } from '@common/interfaces/paginationMeta.interface';

@Injectable()
export class CuisineService {
  constructor(
    @InjectRepository(Cuisine, 'mongo')
    private readonly repo: MongoRepository<Cuisine>,
  ) {}

  async create(dto: CreateCuisineDto): Promise<CuisineResponseDto> {
    const entity = this.repo.create(dto);
    const saved = await this.repo.save(entity);
    return plainToInstance(CuisineResponseDto, saved, { excludeExtraneousValues: true });
  }

  async findAll(page: number, limit: number, search: string): Promise<IPagination<CuisineResponseDto>> {
    const skip = (page - 1) * limit;
    const query: ObjectLiteral = {};
    if (search) {
      query.name = { $regex: new RegExp(search, 'i') };
    }
    const total = await this.repo.count(query);
    const items = await this.repo.find({ where: query, skip, take: limit, order: { createdAt: 'desc' } });
    const data = plainToInstance(CuisineResponseDto, items, { excludeExtraneousValues: true });
    const pagination: IPaginationMeta = { total, page, limit, totalPages: Math.ceil(total / limit) };
    return { data, pagination };
  }

  async findOne(id: string): Promise<CuisineResponseDto> {
    if (!ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid cuisine id format: ${id}`);
    }
    const entity = await this.repo.findOneBy({ _id: new ObjectId(id) });
    if (!entity) {
      throw new NotFoundException(`Cuisine not found with id: ${id}`);
    }
    return plainToInstance(CuisineResponseDto, entity, { excludeExtraneousValues: true });
  }

  async update(id: string, dto: UpdateCuisineDto): Promise<CuisineResponseDto> {
    if (!ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid cuisine id format: ${id}`);
    }
    const entity = await this.repo.findOne({ where: { _id: new ObjectId(id) } });
    if (!entity) {
      throw new NotFoundException(`Cuisine not found with id: ${id}`);
    }
    Object.assign(entity, dto);
    const saved = await this.repo.save(entity);
    return plainToInstance(CuisineResponseDto, saved, { excludeExtraneousValues: true });
  }

  async delete(id: string): Promise<{ message: string }> {
    if (!ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid cuisine id format: ${id}`);
    }
    const result = await this.repo.updateOne({ _id: new ObjectId(id) }, { $set: { isActive: false, isDeleted: true, updatedAt: new Date() } });
    if (result.modifiedCount === 0) {
      throw new NotFoundException(`Cuisine not found with id: ${id}`);
    }
    return { message: 'Cuisine deleted successfully' };
  }

  async updateStatus(id: string, isActive: boolean): Promise<{ message: string }> {
    if (!ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid cuisine id format: ${id}`);
    }
    const result = await this.repo.updateOne({ _id: new ObjectId(id) }, { $set: { isActive, updatedAt: new Date() } });
    if (result.modifiedCount === 0) {
      throw new NotFoundException(`Cuisine not found with id: ${id}`);
    }
    return { message: 'Cuisine status updated successfully' };
  }
}


