import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { ContentPolicy } from './entity/content-policy.entity';
import { CreateContentPolicyDto } from './dto/request/create-content-policy.dto';
import { UpdateContentPolicyDto } from './dto/request/update-content-policy.dto';
import { ContentPolicyResponseDto } from './dto/response/content-policy.dto';
import { plainToInstance } from 'class-transformer';
import { ObjectId } from 'mongodb';
import { IPagination } from '@common/interfaces/pagination.interface';
import { IPaginationMeta } from '@common/interfaces/paginationMeta.interface';

@Injectable()
export class ContentPolicyService {
  constructor(
    @InjectRepository(ContentPolicy, 'mongo')
    private readonly repo: MongoRepository<ContentPolicy>,
  ) {}

  async create(dto: CreateContentPolicyDto): Promise<ContentPolicyResponseDto> {
    // Convert effectiveDate string to Date object
    if(dto.category){
      const category = await this.repo.findOne({
        where: {
          category: dto.category,
          isActive: true,
        }
      });
      if(category){
        throw new BadRequestException('Category already exists');
      }
    }
    const createData = {
      ...dto,
      effectiveDate: new Date(dto.effectiveDate)
    };

    const contentPolicy = this.repo.create(createData);
    const savedContentPolicy = await this.repo.save(contentPolicy);
    return plainToInstance(ContentPolicyResponseDto, savedContentPolicy, { excludeExtraneousValues: true });
  }

  async findAll(page: number, limit: number, title: string): Promise<IPagination<ContentPolicyResponseDto>> {
    const skip = (page - 1) * limit;

    // Build match stage for filtering
    const matchStage: any = {
      $and: [
        {
          $or: [
            { isDeleted: { $ne: true } },
            { isDeleted: { $exists: false } },
            { isDeleted: null }
          ]
        }
      ]
    };

    if (title) {
      matchStage.$and.push({
        title: { $regex: new RegExp(title, 'i') }
      });
    }

    // Count pipeline for total records
    const countPipeline = [
      { $match: matchStage }
    ];

    // Data pipeline with pagination and sorting
    const dataPipeline = [
      { $match: matchStage },
      {
        $project: {
          _id: 1,
          id: '$_id',
          title: 1,
          content: 1,
          category: 1,
          isActive: 1,
          effectiveDate: 1,
          lastReviewDate: 1,
          createdAt: 1,
          updatedAt: 1,
          key: 1
        }
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    ];

    // Execute both pipelines in parallel
    const [countResult, dataResult] = await Promise.all([
      this.repo.aggregate([...countPipeline, { $count: 'total' }]).toArray(),
      this.repo.aggregate(dataPipeline).toArray()
    ]);

    const total = countResult.length > 0 ? countResult[0].total : 0;

    // Transform to response DTO
    const data = plainToInstance(ContentPolicyResponseDto, dataResult, {
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

  async findOne(id: string): Promise<ContentPolicyResponseDto> {
    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid content policy id format: ${id}`);
    }

    const contentPolicy = await this.repo.findOne({
      where: {
        _id: new ObjectId(id)
      }
    });

    if (!contentPolicy) {
      throw new NotFoundException(`Content policy not found with id: ${id}`);
    }

    return plainToInstance(ContentPolicyResponseDto, contentPolicy, {
      excludeExtraneousValues: true,
    });
  }

  async findByCategory(category: string): Promise<ContentPolicyResponseDto> {
    const contentPolicy = await this.repo.findOne({
      where: {
        category: category,
        isActive: true,
        $or: [
          { isDeleted: { $ne: true } },
          { isDeleted: { $exists: false } },
          { isDeleted: null }
        ]
      },
      order: { createdAt: 'DESC' }
    });

    if (!contentPolicy) {
      throw new NotFoundException(`No active policy found for category: ${category}`);
    }

    return plainToInstance(ContentPolicyResponseDto, contentPolicy, {
      excludeExtraneousValues: true,
    });
  }

  async update(id: string, dto: UpdateContentPolicyDto): Promise<ContentPolicyResponseDto> {
    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid content policy id format: ${id}`);
    }

    const contentPolicy = await this.repo.findOne({
      where: {
        _id: new ObjectId(id),
        $or: [
          { isDeleted: { $ne: true } },
          { isDeleted: { $exists: false } },
          { isDeleted: null }
        ]
      }
    });

    if (!contentPolicy) {
      throw new NotFoundException(`Content policy not found with id: ${id}`);
    }

    // Convert effectiveDate if provided
    const updateData = { ...dto };
    if (dto.effectiveDate) {
      (updateData as any).effectiveDate = new Date(dto.effectiveDate);
    }

    Object.assign(contentPolicy, updateData);
    const savedContentPolicy = await this.repo.save(contentPolicy);
    return plainToInstance(ContentPolicyResponseDto, savedContentPolicy, { excludeExtraneousValues: true });
  }

  async delete(id: string): Promise<{ message: string }> {
    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid content policy id format: ${id}`);
    }

    const result = await this.repo.updateOne(
      { _id: new ObjectId(id) },
      { $set: { isActive: false, isDeleted: true } }
    );

    if (result.modifiedCount === 0) {
      throw new NotFoundException(`Content policy not found with id: ${id}`);
    }

    return { message: 'Content policy deleted successfully' };
  }

  async getCategories(): Promise<{ categories: { key: string; value: string }[] }> {
      return {
        categories: 
        [
          { "key": "privacy-policy", "value": "Privacy Policy" },
          { "key": "terms-of-service", "value": "Terms of Service" },
          { "key": "cookie-policy", "value": "Cookie Policy" },
          { "key": "data-protection", "value": "Data Protection" },
          { "key": "user-agreement", "value": "User Agreement" },
          { "key": "about-us", "value": "About Us" }
        ]
      };
  }


}
