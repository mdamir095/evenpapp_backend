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
    
    // Fetch form data if formId exists and is not empty
    let form = null;
    if (savedServiceCategory.formId && savedServiceCategory.formId.trim() !== '') {
      try {
        if (ObjectId.isValid(savedServiceCategory.formId)) {
          form = await this.formRepo.findOneBy({
            _id: new ObjectId(savedServiceCategory.formId)
          });
          console.log('Found form in create:', form); // Debug log
          
          // Add actualValue to each field if it doesn't exist
          if (form && form.fields && Array.isArray(form.fields)) {
            form.fields = form.fields.map((field: any) => {
              // Only initialize actualValue if it doesn't exist
              // Preserve existing actualValue from database (especially for MultiImageUpload with URLs)
              if (!field.hasOwnProperty('actualValue')) {
                // For MultiImageUpload, initialize as empty array
                if (field.type === 'MultiImageUpload') {
                  field.actualValue = [];
                } else {
                  // For other fields, use defaultValue from metadata or empty string
                  field.actualValue = field.metadata?.defaultValue || '';
                }
              } else {
                // actualValue exists - preserve it (could be URLs for MultiImageUpload)
                // For MultiImageUpload, ensure it's an array
                if (field.type === 'MultiImageUpload' && !Array.isArray(field.actualValue)) {
                  // If it's a string, try to parse it or convert to array
                  if (typeof field.actualValue === 'string') {
                    try {
                      field.actualValue = JSON.parse(field.actualValue);
                    } catch {
                      // If parsing fails, wrap in array
                      field.actualValue = field.actualValue ? [field.actualValue] : [];
                    }
                  } else {
                    field.actualValue = [];
                  }
                }
              }
              return field;
            });
          }
        } else {
          console.log('Invalid ObjectId format for formId:', savedServiceCategory.formId);
        }
      } catch (error) {
        console.log('Form not found for formId:', savedServiceCategory.formId);
        console.log('Error:', error);
      }
    }

    // Create response object with form data
    // Ensure actualValue is preserved in fields after transformation
    let transformedForm = null;
    if (form) {
      transformedForm = plainToInstance(FormResponseDto, form, { excludeExtraneousValues: true });
      // After transformation, ensure actualValue is still present in fields
      if (transformedForm && transformedForm.fields && Array.isArray(transformedForm.fields)) {
        transformedForm.fields = transformedForm.fields.map((field: any, index: number) => {
          // Get the original field to preserve actualValue
          const originalField = form.fields[index] as any;
          if (originalField && originalField.hasOwnProperty('actualValue')) {
            field.actualValue = originalField.actualValue;
          } else if (!field.hasOwnProperty('actualValue')) {
            // If actualValue is missing, initialize it
            field.actualValue = field.type === 'MultiImageUpload' ? [] : '';
          }
          return field;
        });
      }
    }
    
    const responseData = {
      ...savedServiceCategory,
      form: transformedForm
    };

    return plainToInstance(ServiceCategoryResponseDto, responseData, { excludeExtraneousValues: true });
  }

  async findAll(page: number, limit: number, search: string): Promise<IPagination<ServiceCategoryResponseDto>> {
    try {
      const skip = (page - 1) * limit;
  
      // Build aggregation pipeline to join categories with forms and filter by form type 'vendor-service'
      const pipeline: any[] = [
        // Match categories (optionally filter by search and ensure isDeleted is false)
        {
          $match: {
            isDeleted: { $ne: true },
            ...(search ? { name: { $regex: search, $options: 'i' } } : {})
          }
        },
        // Convert formId to ObjectId for lookup (only if formId is valid)
        {
          $addFields: {
            formIdObj: {
              $cond: {
                if: { 
                  $and: [
                    { $ne: ['$formId', null] }, 
                    { $ne: ['$formId', ''] },
                    { $ne: ['$formId', undefined] }
                  ] 
                },
                then: {
                  $cond: {
                    if: { $eq: [{ $type: '$formId' }, 'string'] },
                    then: {
                      $cond: {
                        if: { $eq: [{ $strLenCP: '$formId' }, 24] },
                        then: { $toObjectId: '$formId' },
                        else: null
                      }
                    },
                    else: null
                  }
                },
                else: null
              }
            }
          }
        },
        // Filter out categories with invalid formIdObj before lookup
        {
          $match: {
            formIdObj: { $ne: null }
          }
        },
        // Join with forms collection
        {
          $lookup: {
            from: 'forms',
            localField: 'formIdObj',
            foreignField: '_id',
            as: 'formData'
          }
        },
        // Unwind form data (only keep categories that have a form)
        {
          $unwind: {
            path: '$formData',
            preserveNullAndEmptyArrays: false
          }
        },
        // Filter to only include categories with forms of type 'vendor-service' (exclude venue-category)
        {
          $match: {
            'formData.type': 'vendor-service',
            'formData.isDeleted': { $ne: true }
          }
        },
        // Sort by createdAt descending
        {
          $sort: { createdAt: -1 }
        }
      ];

      // Get total count (before pagination)
      const countPipeline = [...pipeline, { $count: 'total' }];
      const countResult = await this.repo.aggregate(countPipeline).toArray();
      const total = countResult.length > 0 ? countResult[0].total : 0;

      // Add pagination
      pipeline.push(
        { $skip: skip },
        { $limit: limit }
      );

      // Execute aggregation
      const serviceCategoriesWithForms = await this.repo.aggregate(pipeline).toArray();

      // Process form fields to add actualValue
      const processedCategories = serviceCategoriesWithForms.map((category: any) => {
        let form = category.formData;
        
        if (form && form.fields && Array.isArray(form.fields)) {
          form.fields = form.fields.map((field: any) => {
            // Only initialize actualValue if it doesn't exist
            // Preserve existing actualValue from database (especially for MultiImageUpload with URLs)
            if (!field.hasOwnProperty('actualValue')) {
              // For MultiImageUpload, initialize as empty array
              if (field.type === 'MultiImageUpload') {
                field.actualValue = [];
              } else {
                // For other fields, use defaultValue from metadata or empty string
                field.actualValue = field.metadata?.defaultValue || '';
              }
            } else {
              // actualValue exists - preserve it (could be URLs for MultiImageUpload)
              // For MultiImageUpload, ensure it's an array
              if (field.type === 'MultiImageUpload' && !Array.isArray(field.actualValue)) {
                // If it's a string, try to parse it or convert to array
                if (typeof field.actualValue === 'string') {
                  try {
                    field.actualValue = JSON.parse(field.actualValue);
                  } catch {
                    // If parsing fails, wrap in array
                    field.actualValue = field.actualValue ? [field.actualValue] : [];
                  }
                } else {
                  field.actualValue = [];
                }
              }
            }
            return field;
          });
        }

        // Transform form to DTO format
        let transformedForm = null;
        if (form) {
          transformedForm = plainToInstance(FormResponseDto, form, { excludeExtraneousValues: true });
          // After transformation, ensure actualValue is still present in fields
          if (transformedForm && transformedForm.fields && Array.isArray(transformedForm.fields)) {
            transformedForm.fields = transformedForm.fields.map((field: any, index: number) => {
              // Get the original field to preserve actualValue
              const originalField = form.fields[index] as any;
              if (originalField && originalField.hasOwnProperty('actualValue')) {
                field.actualValue = originalField.actualValue;
              } else if (!field.hasOwnProperty('actualValue')) {
                // If actualValue is missing, initialize it
                field.actualValue = field.type === 'MultiImageUpload' ? [] : '';
              }
              return field;
            });
          }
        }

        // Convert _id to id string and prepare response
        return {
          id: category._id.toString(),
          key: category.key,
          name: category.name,
          description: category.description,
          formId: category.formId,
          form: transformedForm,
          isActive: category.isActive,
          createdAt: category.createdAt,
          updatedAt: category.updatedAt
        };
      });

      // Transform to response DTO
      const data = plainToInstance(ServiceCategoryResponseDto, processedCategories, {
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
    } catch (error) {
      console.error('Error in findAll service-category:', error);
      throw new NotFoundException(`Failed to fetch service categories: ${error.message}`);
    }
  }

  async findOne(id: string, type?: string): Promise<ServiceCategoryResponseDto> {
    if (!ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid service category id format: ${id}`);
    }

    // Determine form types to filter based on type parameter
    let formTypes: string[] = ['vendor-service', 'venue-category'];
    if (type === 'vendor') {
      formTypes = ['vendor-service'];
    } else if (type === 'venue') {
      formTypes = ['venue-category'];
    }

    // Use aggregation to join category with forms and filter by form type
    const results = await this.repo
      .aggregate([
        { $match: { _id: new ObjectId(id) } },
        {
          $addFields: {
            formIdObj: {
              $cond: {
                if: { $and: [{ $ne: ['$formId', null] }, { $ne: ['$formId', ''] }] },
                then: { $toObjectId: '$formId' },
                else: null
              }
            }
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
        { 
          $unwind: { 
            path: '$formData', 
            preserveNullAndEmptyArrays: false 
          } 
        },
        // Filter to only include categories with forms of the specified type(s)
        {
          $match: {
            'formData.type': { $in: formTypes }
          }
        },
        {
          $addFields: {
            id: { $toString: '$_id' }
          }
        }
      ])
      .toArray();

    if (!results.length) {
      // Check if category exists but form type is wrong
      let serviceCategory = null;
      try {
        serviceCategory = await this.repo.findOneBy({ _id: new ObjectId(id) });
      } catch (error) {
        // Try alternative query methods
        try {
          serviceCategory = await this.repo.findOne({
            where: { _id: new ObjectId(id) }
          });
        } catch (err) {
          // Try with id field
          try {
            serviceCategory = await this.repo.findOne({
              where: { id: id }
            });
          } catch (e) {
            // Category doesn't exist
          }
        }
      }

      if (!serviceCategory) {
        throw new NotFoundException(`Service category not found with id: ${id}`);
      }
      
      if (!serviceCategory.formId || serviceCategory.formId.trim() === '') {
        throw new NotFoundException('Service category does not have a valid formId');
      }

      // Check if form exists but has wrong type
      if (ObjectId.isValid(serviceCategory.formId)) {
        const form = await this.formRepo.findOneBy({ _id: new ObjectId(serviceCategory.formId) });
        if (!form) {
          throw new NotFoundException(`Form with ID ${serviceCategory.formId} not found in forms table`);
        }
        
        // Provide specific error message based on type parameter
        if (type === 'vendor' && form.type !== 'vendor-service') {
          throw new NotFoundException(`Service category is linked to a form with type '${form.type}'. Only categories with forms of type 'vendor-service' are allowed when type=vendor.`);
        } else if (type === 'venue' && form.type !== 'venue-category') {
          throw new NotFoundException(`Service category is linked to a form with type '${form.type}'. Only categories with forms of type 'venue-category' are allowed when type=venue.`);
        } else if (form.type !== 'vendor-service' && form.type !== 'venue-category') {
          throw new NotFoundException(`Service category is linked to a form with type '${form.type}'. Only categories with forms of type 'vendor-service' or 'venue-category' are allowed.`);
        }
      }
      
      // If we get here, the category exists but doesn't match the type filter
      const expectedTypes = type === 'vendor' ? 'vendor-service' : type === 'venue' ? 'venue-category' : 'vendor-service or venue-category';
      throw new NotFoundException(`Service category not found or does not have a valid ${expectedTypes} form`);
    }

    const categoryResult = results[0];
    let form = categoryResult.formData;

    // Process form fields to add actualValue (similar to findAll)
    if (form && form.fields && Array.isArray(form.fields)) {
      form.fields = form.fields.map((field: any) => {
        // Always ensure actualValue exists - initialize if missing
        const hasActualValue = field.hasOwnProperty('actualValue') && 
                              field.actualValue !== null && 
                              field.actualValue !== undefined;
        
        // Initialize or preserve actualValue
        if (!hasActualValue) {
          // For MultiImageUpload, initialize as empty array
          if (field.type === 'MultiImageUpload') {
            field.actualValue = [];
          } else {
            // For other fields, use defaultValue from metadata or empty string
            field.actualValue = field.metadata?.defaultValue || '';
          }
        } else {
          // actualValue exists in database - preserve it exactly as stored
          if (field.type === 'MultiImageUpload') {
            // If it's already an array, keep it as is
            if (Array.isArray(field.actualValue)) {
              // Keep the array structure - it may contain objects with url.imageUrl
            } else if (typeof field.actualValue === 'string') {
              // If it's a string, try to parse it as JSON
              try {
                field.actualValue = JSON.parse(field.actualValue);
              } catch {
                // If parsing fails, wrap in array
                field.actualValue = field.actualValue ? [field.actualValue] : [];
              }
            } else if (field.actualValue === null || field.actualValue === undefined) {
              // If it's null or undefined, convert to empty array
              field.actualValue = [];
            }
          }
        }
        
        // Ensure actualValue is always present in the response
        if (!field.hasOwnProperty('actualValue')) {
          field.actualValue = field.type === 'MultiImageUpload' ? [] : '';
        }
        
        return field;
      });
    }

    // Transform form to DTO format
    let transformedForm = null;
    if (form) {
      transformedForm = plainToInstance(FormResponseDto, form, { excludeExtraneousValues: true });
      // After transformation, ensure actualValue is still present in fields
      if (transformedForm && transformedForm.fields && Array.isArray(transformedForm.fields)) {
        transformedForm.fields = transformedForm.fields.map((field: any, index: number) => {
          // Get the original field to preserve actualValue
          const originalField = form.fields[index] as any;
          if (originalField && originalField.hasOwnProperty('actualValue')) {
            field.actualValue = originalField.actualValue;
          } else if (!field.hasOwnProperty('actualValue')) {
            // If actualValue is missing, initialize it
            field.actualValue = field.type === 'MultiImageUpload' ? [] : '';
          }
          return field;
        });
      }
    }

    // Prepare response with form data
    const responseData = {
      id: categoryResult.id,
      key: categoryResult.key,
      name: categoryResult.name,
      description: categoryResult.description,
      formId: categoryResult.formId,
      isActive: categoryResult.isActive,
      createdAt: categoryResult.createdAt,
      updatedAt: categoryResult.updatedAt,
      form: transformedForm
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
    
    // Fetch form data if formId exists and is not empty
    let form = null;
    if (savedServiceCategory.formId && savedServiceCategory.formId.trim() !== '') {
      try {
        if (ObjectId.isValid(savedServiceCategory.formId)) {
          form = await this.formRepo.findOneBy({
            _id: new ObjectId(savedServiceCategory.formId)
          });
          console.log('Found form in update:', form); // Debug log
          
          // Add actualValue to each field if it doesn't exist
          if (form && form.fields && Array.isArray(form.fields)) {
            form.fields = form.fields.map((field: any) => {
              // Only initialize actualValue if it doesn't exist
              // Preserve existing actualValue from database (especially for MultiImageUpload with URLs)
              if (!field.hasOwnProperty('actualValue')) {
                // For MultiImageUpload, initialize as empty array
                if (field.type === 'MultiImageUpload') {
                  field.actualValue = [];
                } else {
                  // For other fields, use defaultValue from metadata or empty string
                  field.actualValue = field.metadata?.defaultValue || '';
                }
              } else {
                // actualValue exists - preserve it (could be URLs for MultiImageUpload)
                // For MultiImageUpload, ensure it's an array
                if (field.type === 'MultiImageUpload' && !Array.isArray(field.actualValue)) {
                  // If it's a string, try to parse it or convert to array
                  if (typeof field.actualValue === 'string') {
                    try {
                      field.actualValue = JSON.parse(field.actualValue);
                    } catch {
                      // If parsing fails, wrap in array
                      field.actualValue = field.actualValue ? [field.actualValue] : [];
                    }
                  } else {
                    field.actualValue = [];
                  }
                }
              }
              return field;
            });
          }
        } else {
          console.log('Invalid ObjectId format for formId:', savedServiceCategory.formId);
        }
      } catch (error) {
        console.log('Form not found for formId:', savedServiceCategory.formId);
        console.log('Error:', error);
      }
    }

    // Create response object with form data
    // Ensure actualValue is preserved in fields after transformation
    let transformedForm = null;
    if (form) {
      transformedForm = plainToInstance(FormResponseDto, form, { excludeExtraneousValues: true });
      // After transformation, ensure actualValue is still present in fields
      if (transformedForm && transformedForm.fields && Array.isArray(transformedForm.fields)) {
        transformedForm.fields = transformedForm.fields.map((field: any, index: number) => {
          // Get the original field to preserve actualValue
          const originalField = form.fields[index] as any;
          if (originalField && originalField.hasOwnProperty('actualValue')) {
            field.actualValue = originalField.actualValue;
          } else if (!field.hasOwnProperty('actualValue')) {
            // If actualValue is missing, initialize it
            field.actualValue = field.type === 'MultiImageUpload' ? [] : '';
          }
          return field;
        });
      }
    }
    
    const responseData = {
      ...savedServiceCategory,
      form: transformedForm
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
