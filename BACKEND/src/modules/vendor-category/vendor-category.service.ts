import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { VendorCategory } from './entity/vendor-category.entity';
import { CreateVendorCategoryDto } from './dto/request/create-vendor-category.dto';
import { VendorCategoryResponseDto } from './dto/response/vendor-category.dto';
import { plainToInstance } from 'class-transformer';
import { ObjectId } from 'mongodb';
import { IPagination } from '@common/interfaces/pagination.interface';
import { IPaginationMeta } from '@common/interfaces/paginationMeta.interface';
import { UpdateVendorCategoryDto } from './dto/request/update-vendor-category.dto';

@Injectable()
export class VendorCategoryService {
  constructor(
    @InjectRepository(VendorCategory, 'mongo')
    private readonly repo: MongoRepository<VendorCategory>,
  ) {}

  async create(
    dto: CreateVendorCategoryDto,
  ): Promise<VendorCategoryResponseDto> {
    const vendorCategory = this.repo.create(dto);
    const savedCategory = await this.repo.save(vendorCategory);
    return plainToInstance(VendorCategoryResponseDto, savedCategory);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search: string = '',
  ): Promise<IPagination<VendorCategoryResponseDto>> {
    const skip = (page - 1) * limit;

    const query: any = {};
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const [data, total] = await this.repo.findAndCount({
      where: query,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    const totalPages = Math.ceil(total / limit);

    const meta: IPaginationMeta = {
      page,
      limit,
      total,
      totalPages,
    };

    const transformedData = plainToInstance(VendorCategoryResponseDto, data);

    return {
      data: transformedData,
      pagination: meta,
    };
  }

  async findOne(id: string): Promise<VendorCategoryResponseDto> {
    if (!ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid vendor category ID');
    }

    //const vendorCategory = await this.repo.findOneBy({ _id: new ObjectId(id)});
    const results = await this.repo
      .aggregate([
        { $match: { _id: new ObjectId(id) } },
        {
          $addFields: {
            formIdObj: { $toObjectId: "$formId" } 
          }
        },
        {
          $lookup: {
            from: "forms",
            localField: "formIdObj",
            foreignField: "_id",
            as: "formData"
          }
        },
        { $unwind: { path: "$formData", preserveNullAndEmptyArrays: true } },
        { $addFields: { id: { $toString: "$_id" } } },
        { $project: { _id: 0, id: 1, name: 1, formId: 1, description: 1, formName: "$formData.name" } }
      ])
      .toArray();

    if (!results.length) {
      throw new NotFoundException('Vendor Category not found');
    }

    return plainToInstance(VendorCategoryResponseDto, results[0]);
  }

  async update(
    id: string,
    dto: UpdateVendorCategoryDto,
  ): Promise<VendorCategoryResponseDto> {
    if (!ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid vendor category ID');
    }

    const vendorCategory = await this.repo.findOneBy({ _id: new ObjectId(id) });

    if (!vendorCategory) {
      throw new NotFoundException('Vendor Category not found');
    }

    Object.assign(vendorCategory, dto);
    const updatedCategory = await this.repo.save(vendorCategory);
    return plainToInstance(VendorCategoryResponseDto, updatedCategory);
  }

  async delete(id: string): Promise<{ message: string }> {
    if (!ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid vendor category ID');
    }

    const result = await this.repo.delete({ id: new ObjectId(id) });

    if (result.affected === 0) {
      throw new NotFoundException('Vendor Category not found');
    }

    return { message: 'Vendor Category deleted successfully' };
  }

  async updateStatus(id: string, isActive: boolean): Promise<{ message: string }> {
    if (!ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid vendor category ID');
    }
    const result = await this.repo.updateOne(
      { _id: new ObjectId(id) },
      { $set: { isActive, updatedAt: new Date() } },
    );
    if (result.modifiedCount === 0) {
      throw new NotFoundException('Vendor Category not found');
    }
    return { message: 'Vendor Category status updated successfully' };
  }
}
