import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository, ObjectLiteral } from 'typeorm';
import { VenueCategory } from './entity/venue-category.entity';
import { CreateVenueCategoryDto } from './dto/request/create-venue-category.dto';
import { UpdateVenueCategoryDto } from './dto/request/update-venue-category.dto';
import { VenueCategoryResponseDto } from './dto/response/venue-category.dto';
import { plainToInstance } from 'class-transformer';
import { ObjectId } from 'mongodb';
import { IPagination } from '@common/interfaces/pagination.interface';
import { IPaginationMeta } from '@common/interfaces/paginationMeta.interface';
import { FormService } from '@modules/form/form.service';

@Injectable()
export class VenueCategoryService {
  constructor(
    @InjectRepository(VenueCategory, 'mongo')
    private readonly repo: MongoRepository<VenueCategory>,
  ) {}

  async create(dto: CreateVenueCategoryDto): Promise<VenueCategoryResponseDto> {
    const venueCategory = this.repo.create(dto);
    const savedVenueCategory = await this.repo.save(venueCategory);
    return plainToInstance(VenueCategoryResponseDto, savedVenueCategory, {
      excludeExtraneousValues: true,
    });
  }

  async findAll(
    page: number,
    limit: number,
    search: string,
  ): Promise<IPagination<VenueCategoryResponseDto>> {
    const skip = (page - 1) * limit;

    const query: any = {
      isDeleted: false,
    };

    if (search) {
      query.name = { $regex: new RegExp(search, 'i') }; 
    }

    // Fetch total count first
    const total = await this.repo.count(query);

    // Fetch paginated data
    const venueCategories = await this.repo.find({
      where: query,
      skip,
      take: limit,
      order: { name: 'ASC' },
    });

    // Transform to response DTO
    const data = plainToInstance(VenueCategoryResponseDto, venueCategories, {
      excludeExtraneousValues: true,
    });
    const pagination: IPaginationMeta = {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
    return {
      data,
      pagination,
    };
  }

  async findOne(id: string): Promise<VenueCategoryResponseDto> {
    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid venue category id format: ${id}`);
    }

    const results = await this.repo
      .aggregate([
        { $match: { _id: new ObjectId(id) } },
        {
          $addFields: {
            formIdObj: { $toObjectId: '$formId' },
          },
        },
        {
          $lookup: {
            from: 'forms',
            localField: 'formIdObj',
            foreignField: '_id',
            as: 'formData',
          },
        },
        { $unwind: { path: '$formData', preserveNullAndEmptyArrays: true } },
        { $addFields: { id: { $toString: '$_id' } } },
        { $project: { _id: 0, id: 1, name: 1, formId: 1, description: 1, formName: "$formData.name" } },
      ])
      .toArray();

    if (!results.length) {
      throw new NotFoundException('Vendor Category not found');
    }

    return plainToInstance(VenueCategoryResponseDto, results[0]);
  }

  async update(
    id: string,
    dto: UpdateVenueCategoryDto,
  ): Promise<VenueCategoryResponseDto> {
    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid venue category id format: ${id}`);
    }

    const venueCategory = await this.repo.findOne({
      where: { _id: new ObjectId(id), isDeleted: false },
    });
    if (!venueCategory) {
      throw new NotFoundException(`Venue category not found with id: ${id}`);
    }
    Object.assign(venueCategory, dto);
    const savedVenueCategory = await this.repo.save(venueCategory);
    return plainToInstance(VenueCategoryResponseDto, savedVenueCategory, {
      excludeExtraneousValues: true,
    });
  }

  async delete(id: string): Promise<{ message: string }> {
    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid venue category id format: ${id}`);
    }

    const result = await this.repo.updateOne(
      { _id: new ObjectId(id) },
      { $set: { isActive: false, isDeleted: true, updatedAt: new Date()} },
    );
    if (result.modifiedCount === 0) {
      throw new NotFoundException(`Venue category not found with id: ${id}`);
    }
    return { message: 'Venue category deleted successfully' };
  }

  async updateStatus(id: string, isActive: boolean): Promise<{ message: string }> {
    if (!ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid venue category id format: ${id}`);
    }
    const result = await this.repo.updateOne(
      { _id: new ObjectId(id) },
      { $set: { isActive, updatedAt: new Date() } },
    );
    if (result.modifiedCount === 0) {
      throw new NotFoundException(`Venue category not found with id: ${id}`);
    }
    return { message: 'Venue category status updated successfully' };
  }
}
