import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository, ObjectLiteral } from 'typeorm';
import { AdditionalService } from './entity/additional-service.entity';
import { CreateAdditionalServiceDto } from './dto/request/create-additional-service.dto';
import { UpdateAdditionalServiceDto } from './dto/request/update-additional-service.dto';
import { AdditionalServiceResponseDto } from './dto/response/additional-service.dto';
import { plainToInstance } from 'class-transformer';
import { ObjectId } from 'mongodb';
import { IPagination } from '@common/interfaces/pagination.interface';
import { IPaginationMeta } from '@common/interfaces/paginationMeta.interface';

@Injectable()
export class AdditionalServiceService {
  constructor(
    @InjectRepository(AdditionalService, 'mongo')
    private readonly repo: MongoRepository<AdditionalService>,
  ) {}

  async create(dto: CreateAdditionalServiceDto): Promise<AdditionalServiceResponseDto> {
    const entity = this.repo.create(dto);
    const saved = await this.repo.save(entity);
    return plainToInstance(AdditionalServiceResponseDto, saved, { excludeExtraneousValues: true });
  }

  async findAll(page: number, limit: number, search: string): Promise<IPagination<AdditionalServiceResponseDto>> {
    const skip = (page - 1) * limit;
    const query: ObjectLiteral = {};
    if (search) {
      query.name = { $regex: new RegExp(search, 'i') };
    }
    const total = await this.repo.count(query);
    const items = await this.repo.find({ where: query, skip, take: limit, order: { createdAt: 'desc' } });
    const data = plainToInstance(AdditionalServiceResponseDto, items, { excludeExtraneousValues: true });
    const pagination: IPaginationMeta = { total, page, limit, totalPages: Math.ceil(total / limit) };
    return { data, pagination };
  }

  async findOne(id: string): Promise<AdditionalServiceResponseDto> {
    if (!ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid additional service id format: ${id}`);
    }
    const entity = await this.repo.findOneBy({ _id: new ObjectId(id) });
    if (!entity) {
      throw new NotFoundException(`Additional service not found with id: ${id}`);
    }
    return plainToInstance(AdditionalServiceResponseDto, entity, { excludeExtraneousValues: true });
  }

  async update(id: string, dto: UpdateAdditionalServiceDto): Promise<AdditionalServiceResponseDto> {
    if (!ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid additional service id format: ${id}`);
    }
    const entity = await this.repo.findOne({ where: { _id: new ObjectId(id) } });
    if (!entity) {
      throw new NotFoundException(`Additional service not found with id: ${id}`);
    }
    Object.assign(entity, dto);
    const saved = await this.repo.save(entity);
    return plainToInstance(AdditionalServiceResponseDto, saved, { excludeExtraneousValues: true });
  }

  async delete(id: string): Promise<{ message: string }> {
    if (!ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid additional service id format: ${id}`);
    }
    const result = await this.repo.updateOne({ _id: new ObjectId(id) }, { $set: { isActive: false, isDeleted: true, updatedAt: new Date() } });
    if (result.modifiedCount === 0) {
      throw new NotFoundException(`Additional service not found with id: ${id}`);
    }
    return { message: 'Additional service deleted successfully' };
  }

  async updateStatus(id: string, isActive: boolean): Promise<{ message: string }> {
    if (!ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid additional service id format: ${id}`);
    }
    const result = await this.repo.updateOne({ _id: new ObjectId(id) }, { $set: { isActive, updatedAt: new Date() } });
    if (result.modifiedCount === 0) {
      throw new NotFoundException(`Additional service not found with id: ${id}`);
    }
    return { message: 'Additional service status updated successfully' };
  }
}
