import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository, ObjectLiteral } from 'typeorm';
import { ServiceCategory } from './entity/service-category.entity';
import { CreateServiceCategoryDto } from './dto/request/create-service-category.dto';
import { UpdateServiceCategoryDto } from './dto/request/update-service-category.dto';
import { ServiceCategoryResponseDto } from './dto/response/service-category.dto';
import { plainToInstance } from 'class-transformer';
import { ObjectId } from 'mongodb';
import { IPagination } from '@common/interfaces/pagination.interface';
import { IPaginationMeta } from '@common/interfaces/paginationMeta.interface';
import { Form } from '@modules/form/entity/form.entity';
import { FormResponseDto } from '@modules/form/dto/response/form.dto';

@Injectable()
export class ServiceCategoryService {
  constructor(
    @InjectRepository(ServiceCategory, 'mongo')
    private readonly repo: MongoRepository<ServiceCategory>,
    @InjectRepository(Form, 'mongo')
    private readonly formRepo: MongoRepository<Form>,
  ) {}

  async create(dto: CreateServiceCategoryDto): Promise<ServiceCategoryResponseDto> {
    console.log('Creating service category with DTO:', dto); // Debug log
    const serviceCategory = this.repo.create(dto);
    const savedServiceCategory = await this.repo.save(serviceCategory);
    console.log('Saved service category:', savedServiceCategory); // Debug log
    
    // Fetch form data if formId exists
    let form = null;
    if (savedServiceCategory.formId) {
      try {
        form = await this.formRepo.findOneBy({
          _id: new ObjectId(savedServiceCategory.formId)
        });
        console.log('Found form in create:', form); // Debug log
      } catch (error) {
        console.log('Form not found for formId:', savedServiceCategory.formId);
      }
    }

    // Create response object with form data
    const responseData = {
      ...savedServiceCategory,
      form: form ? plainToInstance(FormResponseDto, form, { excludeExtraneousValues: true }) : null
    };

    return plainToInstance(ServiceCategoryResponseDto, responseData, { excludeExtraneousValues: true });
  }

  async findAll(page: number, limit: number, search: string): Promise<IPagination<ServiceCategoryResponseDto>> {
     const skip = (page - 1) * limit;
  
      const query: ObjectLiteral = {
        //isDeleted: false,
      };
  
      if (search) {
        query.name = { $regex: new RegExp(search, 'i') }; // case-insensitive search
      }

         // Fetch total count first
      const total = await this.repo.count(query);
  
      // Fetch paginated data
      const serviceCategories = await this.repo.find({
        where: query,
        skip,
        take: limit,
        order: { createdAt: 'desc' },
      });

      // Fetch form data for each category
      const serviceCategoriesWithForms = await Promise.all(
        serviceCategories.map(async (category) => {
          let form = null;
          if (category.formId) {
            try {
              form = await this.formRepo.findOneBy({
                _id: new ObjectId(category.formId)
              });
              console.log('Found form for category:', category.name, form); // Debug log
            } catch (error) {
              console.log('Form not found for formId:', category.formId);
            }
          }
          return {
            ...category,
            form: form ? plainToInstance(FormResponseDto, form, { excludeExtraneousValues: true }) : null
          };
        })
      );

            // Transform to response DTO
      const data = plainToInstance(ServiceCategoryResponseDto, serviceCategoriesWithForms, {
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

  async findOne(id: string): Promise<ServiceCategoryResponseDto> {
    if (!ObjectId.isValid(id)) {
          throw new NotFoundException(`Invalid service category id format: ${id}`);
        }
        const serviceCategory = await this.repo.findOneBy({
          _id: new ObjectId(id)
        });
    
        if (!serviceCategory) {
          throw new NotFoundException(`Service category not found with id: ${id}`);
        }

        // Fetch form data if formId exists
        let form = null;
        if (serviceCategory.formId) {
          try {
            console.log('Looking for form with ID:', serviceCategory.formId);
            console.log('ObjectId:', new ObjectId(serviceCategory.formId));
            
            form = await this.formRepo.findOneBy({
              _id: new ObjectId(serviceCategory.formId)
            });
            console.log('Found form:', form); // Debug log
            console.log('Form fields:', form?.fields); // Debug log
          } catch (error) {
            console.log('Form not found for formId:', serviceCategory.formId);
            console.log('Error:', error);
          }
        }

        // Create response object with form data
        const responseData = {
          ...serviceCategory,
          form: form ? plainToInstance(FormResponseDto, form, { excludeExtraneousValues: true }) : null
        };

        return plainToInstance(ServiceCategoryResponseDto, responseData, {
          excludeExtraneousValues: true,
        });
  }

  async update(id: string, dto: UpdateServiceCategoryDto): Promise<ServiceCategoryResponseDto> {
    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid service category id format: ${id}`);
    }
    const serviceCategory = await this.repo.findOne({
      where: {
        _id: new ObjectId(id),
      }
    });
    if (!serviceCategory) {
      throw new NotFoundException(`Service category not found with id: ${id}`);
    }

    console.log('Updating service category with DTO:', dto); // Debug log
    console.log('Current service category:', serviceCategory); // Debug log
    
    Object.assign(serviceCategory, dto);
    const savedServiceCategory = await this.repo.save(serviceCategory);
    console.log('Updated service category:', savedServiceCategory); // Debug log
    
    // Fetch form data if formId exists
    let form = null;
    if (savedServiceCategory.formId) {
      try {
        form = await this.formRepo.findOneBy({
          _id: new ObjectId(savedServiceCategory.formId)
        });
        console.log('Found form in update:', form); // Debug log
      } catch (error) {
        console.log('Form not found for formId:', savedServiceCategory.formId);
      }
    }

    // Create response object with form data
    const responseData = {
      ...savedServiceCategory,
      form: form ? plainToInstance(FormResponseDto, form, { excludeExtraneousValues: true }) : null
    };
    
    return plainToInstance(ServiceCategoryResponseDto, responseData, { excludeExtraneousValues: true });
  } 

  async delete(id: string): Promise<{ message: string }> {
    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid service category id format: ${id}`);
    }

    const result = await this.repo.updateOne({ _id: new ObjectId(id) }, { $set: { isActive: false, isDeleted: true } });
    if (result.modifiedCount === 0) {
      throw new NotFoundException(`Service category not found with id: ${id}`);
    }
    return { message: 'Service category deleted successfully' };
  }

  async updateStatus(id: string, isActive: boolean): Promise<{ message: string }> {
    if (!ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid service category id format: ${id}`);
    }
    const result = await this.repo.updateOne(
      { _id: new ObjectId(id) },
      { $set: { isActive, updatedAt: new Date() } },
    );
    if (result.modifiedCount === 0) {
      throw new NotFoundException(`Service category not found with id: ${id}`);
    }
    return { message: 'Service category status updated successfully' };
  }
}
