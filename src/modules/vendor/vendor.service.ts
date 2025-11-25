import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository, ObjectLiteral } from 'typeorm';
import { ObjectId } from 'mongodb';
import { plainToInstance } from 'class-transformer';
import * as path from 'path';
import * as fs from 'fs';
import { Vendor } from './entity/vendor.entity';
import { VendorCategory } from '../vendor-category/entity/vendor-category.entity';
import { ServiceCategory } from '../service-category/entity/service-category.entity';
import { Form } from '../form/entity/form.entity';
import { CreateVendorDto } from './dto/request/create-vendor.dto';
import { UpdateVendorDto } from './dto/request/update-vendor.dto';
import { VendorResponseDto } from './dto/response/vendor-response.dto';
import { VendorDetailResponseDto } from './dto/response/vendor-detail-response.dto';
import { VendorPaginatedResponseDto } from './dto/response/vendor-paginated.dto';
import { VendorPaginationDto } from './dto/request/vendor-pagination.dto';
import { IPaginationMeta } from '@common/interfaces/paginationMeta.interface';
import { VendorFormValidator } from './helpers/vendor-form-validator';
import { CategoryPricingHelper } from './helpers/category-pricing.helper';
import { LocationService } from '@modules/location/location.service';
import { Rating } from '../rating/entity/rating.entity'; // New import
import { User } from '../user/entities/user.entity';

@Injectable()
export class VendorService {
  constructor(
    @InjectRepository(Vendor, 'mongo') private readonly vendorRepo: MongoRepository<Vendor>,
    @InjectRepository(Rating, 'mongo') private readonly ratingRepo: MongoRepository<Rating>, // Injected
    @InjectRepository(User, 'mongo') private readonly userRepo: MongoRepository<User>,
    @InjectRepository(VendorCategory, 'mongo') private readonly vendorCategoryRepo: MongoRepository<VendorCategory>,
    @InjectRepository(ServiceCategory, 'mongo') private readonly serviceCategoryRepo: MongoRepository<ServiceCategory>,
    @InjectRepository(Form, 'mongo') private readonly formRepo: MongoRepository<Form>,
    private readonly locationService: LocationService,
  ) {}

  async create(createDto: CreateVendorDto, user: any): Promise<VendorResponseDto> {
    try {
      // Validate and sanitize form data
      VendorFormValidator.validateFormData(createDto.formData);
      const sanitizedFormData = VendorFormValidator.sanitizeFormData(createDto.formData);

      // Determine enterprise information based on user type
      let enterpriseId = createDto.enterpriseId;
      let enterpriseName = createDto.enterpriseName;

      // Check if user is an enterprise user (has enterpriseId in token)
      if (user.enterpriseId) {
        // Enterprise user - use their enterprise information
        enterpriseId = user.enterpriseId;
        enterpriseName = user.organizationName || 'Unknown Enterprise';
      } else {
        // Admin user - enterprise information should be provided in the request
        if (!enterpriseId) {
          throw new BadRequestException('Enterprise ID is required for admin users');
        }
        if (!enterpriseName) {
          throw new BadRequestException('Enterprise name is required for admin users');
        }
      }

      // Check if vendor name already exists for the same category and enterprise
      const existingVendor = await this.vendorRepo.findOne({
        where: {
          name: createDto.name,
          categoryId: createDto.categoryId,
          enterpriseId: enterpriseId,
          isDeleted: false
        }
      });

      if (existingVendor) {
        throw new BadRequestException('Vendor with this name already exists in the selected category for this enterprise');
      }

      // Get category information for pricing generation
      let categoryName = 'General Service';
      if (createDto.categoryId && ObjectId.isValid(createDto.categoryId)) {
        try {
          const category = await this.serviceCategoryRepo.findOneBy({ _id: new ObjectId(createDto.categoryId) });
          if (category && !category.isDeleted) {
            categoryName = category.name;
          }
        } catch (error) {
          console.log('Category lookup failed, using default category name');
        }
      }

      // Generate category-specific pricing
      const categoryPricing = CategoryPricingHelper.generateCategoryPricing(categoryName);
      
      // Add pricing to formData if not already present
      if (!sanitizedFormData.pricing) {
        sanitizedFormData.pricing = categoryPricing;
      }

      // Process albums if provided
      let processedAlbums: Array<{
        id: string;
        name: string;
        images: string[];
        imageCount: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
      }> = [];
      
      if (createDto.albums && createDto.albums.length > 0) {
        processedAlbums = createDto.albums.map(album => ({
          id: new ObjectId().toString(),
          name: album.name,
          images: album.images,
          imageCount: album.images.length,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }));
      }

      const vendor = this.vendorRepo.create({
        categoryId: createDto.categoryId,
        name: createDto.name,
        title: createDto.title,
        description: createDto.description,
        longDescription: createDto.longDescription || `We are a professional ${createDto.title.toLowerCase()} service provider with years of experience in delivering exceptional quality services. Our team is dedicated to providing comprehensive solutions tailored to meet your specific needs. We pride ourselves on our attention to detail, customer satisfaction, and commitment to excellence. Whether you're planning a special event or looking for reliable service providers, we have the expertise and resources to make your vision a reality.`,
        formData: sanitizedFormData,
        averageRating: 0, // Initialize new fields
        totalRatings: 0,
        price: 0, // Will be calculated from formData
        imageUrl: '', // Will be set from formData or default
        review: '', // Will be set from formData or default
        enterpriseId: enterpriseId,
        enterpriseName: enterpriseName,
        albums: processedAlbums,
        ...(createDto.createdBy && { createdBy: createDto.createdBy })
      });
      
      const savedVendor = await this.vendorRepo.save(vendor);
      
      // Transform the response
      return plainToInstance(VendorResponseDto, savedVendor, { 
        excludeExtraneousValues: true 
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create vendor');
    }
  }

  async findAll(paginationDto: VendorPaginationDto): Promise<VendorPaginatedResponseDto> {
    const { page = 1, limit = 10, search, categoryId, location, minPrice, maxPrice } = paginationDto;
    const skip = (page - 1) * limit;
  
    // Base query
    const query: ObjectLiteral = {
      isDeleted: false,
    };
  
    if (categoryId) {
      query.categoryId = categoryId;
    }
  
    // Build search conditions
    const searchConditions = [];
  
    if (search) {
      searchConditions.push(
        { name: { $regex: new RegExp(search, 'i') } },
        { 'formData.location': { $regex: new RegExp(search, 'i') } },
        { 'formData.services': { $elemMatch: { $regex: new RegExp(search, 'i') } } },
        { 'formData.equipment': { $elemMatch: { $regex: new RegExp(search, 'i') } } }
      );
    }
  
    if (location) {
      searchConditions.push(
        { 'formData.location': { $regex: new RegExp(location, 'i') } },
        { 'formData.coverage_areas': { $elemMatch: { $regex: new RegExp(location, 'i') } } }
      );
    }
  
    // Note: Price filtering will be done after extracting price from formData
    // This is because price can be stored in multiple places: vendor.price, formData.price, formData.fields array
    if (searchConditions.length > 0) {
      query.$or = searchConditions;
    }

    try {
      // Fetch all vendors matching the query (without price filtering and pagination)
      // We'll filter by price after extracting it from formData
      const allVendors = await this.vendorRepo.find({
        where: query,
        order: { createdAt: 'DESC' },
      });

      // Helper function to extract price from formData (matches the logic in VendorUserResponseDto)
      const extractPriceFromFormData = (vendor: any): number => {
        // Priority: vendor.price > formData.price > formData.fields array (fields with "price" in name) > 0
        if (vendor.price !== undefined && vendor.price !== null && vendor.price > 0) {
          return vendor.price;
        }
        
        if (vendor.formData?.price !== undefined && vendor.formData?.price !== null && vendor.formData.price > 0) {
          return vendor.formData.price;
        }
        
        // Check formData.fields array for fields with "price" in the name
        if (vendor.formData?.fields && Array.isArray(vendor.formData.fields)) {
          const priceField = vendor.formData.fields.find((field: any) => {
            const fieldName = field?.name?.toLowerCase() || '';
            const hasPriceInName = fieldName.includes('price');
            const hasActualValue = field?.actualValue !== undefined && field?.actualValue !== null && field?.actualValue !== '';
            return hasPriceInName && hasActualValue;
          });
          
          if (priceField && priceField.actualValue !== undefined && priceField.actualValue !== null) {
            const priceValue = typeof priceField.actualValue === 'string' 
              ? parseFloat(priceField.actualValue) 
              : typeof priceField.actualValue === 'number' 
                ? priceField.actualValue 
                : 0;
            if (!isNaN(priceValue) && priceValue > 0) {
              return priceValue;
            }
          }
          
          // Also check for direct Price field (capital P)
          if (vendor.formData.fields.Price) {
            const fieldsPrice = parseFloat(vendor.formData.fields.Price);
            if (!isNaN(fieldsPrice) && fieldsPrice > 0) {
              return fieldsPrice;
            }
          }
        }
        
        // Check formData.pricing.starting
        if (vendor.formData?.pricing?.starting && typeof vendor.formData.pricing.starting === 'number') {
          return vendor.formData.pricing.starting;
        }
        
        // Check formData.pricing as a number
        if (vendor.formData?.pricing && typeof vendor.formData.pricing === 'number' && vendor.formData.pricing > 0) {
          return vendor.formData.pricing;
        }
        
        return 0;
      };

      // Populate vendors with category and location data, and extract price
      const populatedVendors = await Promise.all(
        allVendors.map(async (vendor) => {
          const storedLocation = await this.locationService.findByServiceId(vendor.id?.toString());
          
          // Get category name from categories collection (ServiceCategory) based on categoryId
          // Use aggregation to join with forms and filter by vendor-service form type
          let categoryName = 'General Service';
          const vendorCategoryId = vendor.categoryId;
          
          if (vendorCategoryId && ObjectId.isValid(vendorCategoryId)) {
            try {
              // Use aggregation pipeline to find category from categories collection
              // and ensure it's linked to a form with type 'vendor-service'
              const categoryResults = await this.serviceCategoryRepo
                .aggregate([
                  { $match: { _id: new ObjectId(vendorCategoryId) } },
                  {
                    $addFields: {
                      formIdObj: {
                        $cond: {
                          if: { $and: [{ $ne: ['$formId', null] }, { $ne: ['$formId', ''] }] },
                          then: { $toObjectId: '$formId' },
                          else: null
                        }
                      }
                    }
                  },
                  {
                    $lookup: {
                      from: 'forms',
                      localField: 'formIdObj',
                      foreignField: '_id',
                      as: 'formData'
                    }
                  },
                  {
                    $unwind: {
                      path: '$formData',
                      preserveNullAndEmptyArrays: false
                    }
                  },
                  {
                    $match: {
                      'formData.type': 'vendor-service'
                    }
                  },
                  {
                    $project: {
                      _id: 1,
                      name: 1,
                      description: 1
                    }
                  }
                ])
                .toArray();
              
              if (categoryResults && categoryResults.length > 0) {
                categoryName = categoryResults[0].name;
              } else {
                // Fallback: try direct lookup without form type filter
                const category = await this.serviceCategoryRepo.findOneBy({ _id: new ObjectId(vendorCategoryId) });
                if (category && !category.isDeleted) {
                  categoryName = category.name;
                }
              }
            } catch (error) {
              console.log('Category lookup failed for vendor:', vendor.id, 'categoryId:', vendorCategoryId, 'error:', error);
            }
          }
          
          // Generate category-specific pricing
          const categoryPricing = CategoryPricingHelper.generateCategoryPricing(categoryName);
          
          // Extract price from formData
          const extractedPrice = extractPriceFromFormData(vendor);
          
          // Extract image URL from vendor formData (similar to venue listing endpoints)
          // Priority: formData.fields (MultiImageUpload) > formData.imageUrl > formData.images[0] > vendor.imageUrl
          let imageUrlFromFormData = '';
          
          // First, try to extract from formData.fields (for MultiImageUpload fields)
          if (vendor.formData?.fields && Array.isArray(vendor.formData.fields)) {
            // Find any field with MultiImageUpload type OR field name containing "image" (case insensitive)
            const imageField = vendor.formData.fields.find((field: any) => {
              const isMultiImageUpload = field.type === 'MultiImageUpload';
              const hasImageInName = field.name && field.name.toLowerCase().includes('image');
              const hasActualValue = field.actualValue && Array.isArray(field.actualValue) && field.actualValue.length > 0;
              return (isMultiImageUpload || hasImageInName) && hasActualValue;
            });
            
            if (imageField && imageField.actualValue && imageField.actualValue.length > 0) {
              const firstImage = imageField.actualValue[0];
              // Check for url.imageUrl structure (most common format) - this matches the user's data structure
              if (firstImage.url && firstImage.url.imageUrl && typeof firstImage.url.imageUrl === 'string') {
                imageUrlFromFormData = firstImage.url.imageUrl;
              } else if (firstImage.url && typeof firstImage.url === 'string') {
                // If url is a direct string
                imageUrlFromFormData = firstImage.url;
              } else if (typeof firstImage === 'string') {
                // If actualValue item is a direct string URL
                imageUrlFromFormData = firstImage;
              } else if (firstImage.name && typeof firstImage.name === 'string' && firstImage.name.startsWith('http')) {
                // If name field contains the URL
                imageUrlFromFormData = firstImage.name;
              }
              
              // Debug logging
              console.log('Vendor image extraction:', {
                vendorId: vendor.id,
                vendorName: vendor.name,
                fieldName: imageField.name,
                fieldType: imageField.type,
                extractedUrl: imageUrlFromFormData,
                firstImageStructure: firstImage
              });
            }
          }
          
          // If not found in fields, try other formData locations
          if (!imageUrlFromFormData) {
            imageUrlFromFormData = vendor.formData?.imageUrl || 
                                  (Array.isArray(vendor.formData?.images) && vendor.formData.images.length > 0 
                                    ? vendor.formData.images[0] 
                                    : '') || 
                                  '';
          }
          
          // Final fallback to vendor.imageUrl
          if (!imageUrlFromFormData) {
            imageUrlFromFormData = vendor.imageUrl || '';
          }
          
          return { 
            ...vendor, 
            categoryId: vendorCategoryId,
            categoryName: categoryName,
            // Use extracted price from formData
            price: extractedPrice,
            // Set the extracted image URL (no hardcoded fallback)
            imageUrl: imageUrlFromFormData,
            location: {
              address: storedLocation?.address || vendor.formData?.address || vendor.formData?.location || 'Address not available',
              city: vendor.formData?.city || 'City not available',
              latitude: (storedLocation?.latitude as number) ?? vendor.formData?.latitude ?? 0,
              longitude: (storedLocation?.longitude as number) ?? vendor.formData?.longitude ?? 0,
              pinTitle: vendor.formData?.pinTitle || vendor.name,
              mapImageUrl: vendor.formData?.mapImageUrl || 'https://maps.googleapis.com/...'
            },
            pricing: vendor.formData?.pricing || categoryPricing
          };
        })
      );

      // Filter by price range if minPrice or maxPrice is specified
      let filteredVendors = populatedVendors;
      if (minPrice !== undefined || maxPrice !== undefined) {
        filteredVendors = populatedVendors.filter((vendor) => {
          const vendorPrice = vendor.price || 0;
          const meetsMinPrice = minPrice === undefined || vendorPrice >= minPrice;
          const meetsMaxPrice = maxPrice === undefined || vendorPrice <= maxPrice;
          return meetsMinPrice && meetsMaxPrice;
        });
      }

      // Apply pagination to filtered results
      const total = filteredVendors.length;
      const paginatedVendors = filteredVendors.slice(skip, skip + limit);
      const data = plainToInstance(VendorResponseDto, paginatedVendors, {
        excludeExtraneousValues: true,
      });
      
      // Explicitly ensure categoryId, categoryName, and imageUrl are present after transformation
      const finalData = data.map((vendorDto: any, index: number) => {
        const originalVendor = paginatedVendors[index];
        if (originalVendor) {
          vendorDto.categoryId = originalVendor.categoryId;
          vendorDto.categoryName = originalVendor.categoryName;
          // Preserve imageUrl and formData for controller to use
          if (originalVendor.imageUrl !== undefined) {
            vendorDto.imageUrl = originalVendor.imageUrl;
          }
          if (originalVendor.formData) {
            vendorDto.formData = originalVendor.formData;
          }
        }
        return vendorDto;
      });
  
      const pagination: IPaginationMeta = {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
  
      return { data: finalData, pagination };
    } catch (error) {
      console.error('Error fetching vendors:', error);
      throw new BadRequestException('Failed to fetch vendors');
    }
  }
  
  async findOne(id: string): Promise<VendorResponseDto> {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid vendor ID format');
    }

    const vendor = await this.vendorRepo.findOneBy({ _id: new ObjectId(id) });

    if (!vendor || vendor.isDeleted) {
      throw new NotFoundException('Vendor not found');
    }

    // Get category information for pricing generation
    let categoryName = 'General Service';
    if (vendor.categoryId && ObjectId.isValid(vendor.categoryId)) {
      try {
        // Use aggregation to find category from categories collection with vendor-service form type
        const categoryResults = await this.serviceCategoryRepo
          .aggregate([
            { $match: { _id: new ObjectId(vendor.categoryId) } },
            {
              $addFields: {
                formIdObj: {
                  $cond: {
                    if: { $and: [{ $ne: ['$formId', null] }, { $ne: ['$formId', ''] }] },
                    then: { $toObjectId: '$formId' },
                    else: null
                  }
                }
              }
            },
            {
              $lookup: {
                from: 'forms',
                localField: 'formIdObj',
                foreignField: '_id',
                as: 'formData'
              }
            },
            {
              $unwind: {
                path: '$formData',
                preserveNullAndEmptyArrays: false
              }
            },
            {
              $match: {
                'formData.type': 'vendor-service'
              }
            },
            {
              $project: {
                _id: 1,
                name: 1,
                description: 1
              }
            }
          ])
          .toArray();
        
        if (categoryResults && categoryResults.length > 0) {
          categoryName = categoryResults[0].name;
        } else {
          // Fallback: try direct lookup
          const category = await this.serviceCategoryRepo.findOneBy({ _id: new ObjectId(vendor.categoryId) });
          if (category && !category.isDeleted) {
            categoryName = category.name;
          }
        }
      } catch (error) {
        console.log('Category lookup failed, using default category name:', error);
      }
    }

    // Generate category-specific pricing
    const categoryPricing = CategoryPricingHelper.generateCategoryPricing(categoryName);

    // Transform the response with pricing
    const transformedVendor = {
      ...vendor,
      pricing: vendor.formData?.pricing || categoryPricing
    };

    return plainToInstance(VendorResponseDto, transformedVendor, { 
      excludeExtraneousValues: true 
    });
  }

  async findOneDetail(id: string): Promise<VendorDetailResponseDto> {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid vendor ID format');
    }

    const vendor = await this.vendorRepo.findOneBy({ _id: new ObjectId(id) });

    if (!vendor || vendor.isDeleted) {
      throw new NotFoundException('Vendor not found');
    }


    // Get category information
    let categoryName = 'Uncategorized';
    const originalCategoryId = vendor.categoryId; // Preserve original categoryId
    
    if (vendor.categoryId && ObjectId.isValid(vendor.categoryId)) {
      try {
        // Use aggregation to find category from categories collection with vendor-service form type
        const categoryResults = await this.serviceCategoryRepo
          .aggregate([
            { $match: { _id: new ObjectId(vendor.categoryId) } },
            {
              $addFields: {
                formIdObj: {
                  $cond: {
                    if: { $and: [{ $ne: ['$formId', null] }, { $ne: ['$formId', ''] }] },
                    then: { $toObjectId: '$formId' },
                    else: null
                  }
                }
              }
            },
            {
              $lookup: {
                from: 'forms',
                localField: 'formIdObj',
                foreignField: '_id',
                as: 'formData'
              }
            },
            {
              $unwind: {
                path: '$formData',
                preserveNullAndEmptyArrays: false
              }
            },
            {
              $match: {
                'formData.type': 'vendor-service'
              }
            },
            {
              $project: {
                _id: 1,
                name: 1,
                description: 1
              }
            }
          ])
          .toArray();
        
        if (categoryResults && categoryResults.length > 0) {
          categoryName = categoryResults[0].name;
        } else {
          // Fallback: try direct lookup
          const category = await this.serviceCategoryRepo.findOneBy({ _id: new ObjectId(vendor.categoryId) });
          if (category && !category.isDeleted) {
            categoryName = category.name;
          } else {
            // Try with findOne
            const categoryAlt = await this.serviceCategoryRepo.findOne({
              where: { _id: new ObjectId(vendor.categoryId), isDeleted: false }
            });
            if (categoryAlt) {
              categoryName = categoryAlt.name;
            } else {
              // Category not found - try to assign a default category
              const defaultCategory = await this.serviceCategoryRepo.findOne({
                where: { isDeleted: false, isActive: true },
                order: { createdAt: 'ASC' }
              });
              
              if (defaultCategory) {
                // Update the vendor with the default category
                const categoryIdString = defaultCategory.id.toString();
                await this.vendorRepo.updateOne(
                  { _id: new ObjectId(id) },
                  { $set: { categoryId: categoryIdString, updatedAt: new Date() } }
                );
                // Don't update the vendor object - keep original categoryId for response
                categoryName = defaultCategory.name;
              } else {
                categoryName = 'No Categories Available';
              }
            }
          }
        }
      } catch (error) {
        categoryName = 'Category Lookup Error';
      }
    } else {
      categoryName = 'Invalid Category ID';
    }

    // Get ratings for this vendor
    const ratings = await this.ratingRepo.find({
      where: { entityId: id, entityType: 'vendor', isDeleted: false }
    });

    // Gather unique userIds and fetch user profiles for profileImage
    const uniqueUserIds = Array.from(new Set(ratings.map(r => r.userId).filter(Boolean)));
    const usersById: Record<string, User> = {};
    if (uniqueUserIds.length > 0) {
      const users = await this.userRepo.find({ where: { _id: { $in: uniqueUserIds.map(u => new ObjectId(u)) } } });
      for (const u of users) {
        usersById[u.id.toString()] = u;
      }
    }

    // Calculate average rating and review count
    const avgRating = ratings.length > 0 
      ? ratings.reduce((sum, rating) => sum + rating.score, 0) / ratings.length 
      : 0;
    const reviewCount = ratings.length;

    // Resolve location from locations collection (by serviceId = vendor.id)
    const storedLocation = await this.locationService.findByServiceId(vendor.id?.toString());

      // Prepare placeholder HTTPS images for vendor/venue/event related content
      const placeholderImages = [
        'https://picsum.photos/1200/800?random=1', // Wedding venue
        'https://picsum.photos/1200/800?random=2', // Event decoration
        'https://picsum.photos/1200/800?random=3', // Wedding ceremony
        'https://picsum.photos/1200/800?random=4', // Reception hall
        'https://picsum.photos/1200/800?random=5', // Catering setup
        'https://picsum.photos/1200/800?random=6', // Event planning
        'https://picsum.photos/1200/800?random=7', // Wedding photography
        'https://picsum.photos/1200/800?random=8'  // Event venue
      ];
    
    const ensureHttpsImages = (list?: string[], fallbackCount: number = 6): string[] => {
      const base = Array.isArray(list) && list.length > 0 ? list : placeholderImages.slice(0, fallbackCount);
      return base.map((url) => (typeof url === 'string' && url.startsWith('http') ? url : placeholderImages[Math.floor(Math.random() * placeholderImages.length)]));
    };

    // Get vendor albums from the vendor document
    const vendorAlbums = vendor.albums || [];

    // Transform vendor data to match the required format
    const transformedVendor = {
      id: vendor.id?.toString(),
      name: vendor.name,
      title: vendor.title,
      location: {
        address: storedLocation?.address || vendor.formData?.address || vendor.formData?.location || 'Address not available',
        city: vendor.formData?.city || 'City not available',
        latitude: (storedLocation?.latitude as number) ?? vendor.formData?.latitude ?? 0,
        longitude: (storedLocation?.longitude as number) ?? vendor.formData?.longitude ?? 0,
        pinTitle: vendor.formData?.pinTitle || vendor.name,
        mapImageUrl: vendor.formData?.mapImageUrl || 'https://maps.googleapis.com/...'
      },
      avgRating: Math.round(avgRating * 10) / 10, // Round to 1 decimal place
      reviewCount: reviewCount,
      description: vendor.description || vendor.formData?.description || 'No description available',
      longDescription: vendor.longDescription || vendor.formData?.longDescription || 'Detailed information about our services will be available soon.',
      about: vendor.formData?.about || vendor.description || 'No additional information available',
      images: ensureHttpsImages(
        (vendor.formData?.images as string[]) || (vendor.formData?.portfolio as string[]) || (vendor.imageUrl ? [vendor.imageUrl] : [])
      ),
      pricing: {
        pricing: vendor.formData?.pricing || CategoryPricingHelper.generateCategoryPricing(categoryName),
        packages: vendor.formData?.packages || []
      },
      priceRange: vendor.formData?.priceRange || '₹50,000 - ₹3,00,000',
      roomCount: vendor.formData?.roomCount || 257,
      cateringPolicy: vendor.formData?.cateringPolicy || 'Inhouse catering only',
      albums: this.getVendorAlbums(vendorAlbums, placeholderImages),
      reviews: ratings.map(rating => {
        const user = usersById[rating.userId || ''];
        const fullName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Anonymous';
        const rawImage = user?.profileImage;
        const profileImage = rawImage && rawImage.startsWith('http')
          ? rawImage
          : 'https://picsum.photos/256/256?random=profile';
        return {
          user: rating.userId || 'Anonymous',
          name: fullName || 'Anonymous',
          rating: rating.score,
          comment: rating.review || 'No comment provided',
          profileImage
        };
      }),
      category_id: originalCategoryId || '',
      category_name: categoryName,
      categoryId: originalCategoryId || '',
      categoryName: categoryName
    };

    return plainToInstance(VendorDetailResponseDto, transformedVendor, { 
      excludeExtraneousValues: true 
    });
  }


  async findByCategory(categoryId: string, paginationDto: VendorPaginationDto): Promise<VendorPaginatedResponseDto> {
    // Validate categoryId format
    if (!ObjectId.isValid(categoryId)) {
      throw new BadRequestException('Invalid category ID format');
    }

    // Use aggregation to join category with forms table and filter by form type 'vendor-service'
    // Use ServiceCategory (categories collection) instead of VendorCategory
    const categoryWithForm = await this.serviceCategoryRepo
      .aggregate([
        { 
          $match: { 
            _id: new ObjectId(categoryId),
            isDeleted: false
          } 
        },
        {
          $addFields: {
            formIdObj: {
              $cond: {
                if: { $and: [{ $ne: ['$formId', null] }, { $ne: ['$formId', ''] }] },
                then: { $toObjectId: '$formId' },
                else: null
              }
            }
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
        { 
          $unwind: { 
            path: "$formData", 
            preserveNullAndEmptyArrays: false 
          } 
        },
        {
          $match: {
            "formData.type": "vendor-service"
          }
        },
        {
          $addFields: { 
            id: { $toString: "$_id" } 
          }
        }
      ])
      .toArray();

    if (!categoryWithForm || categoryWithForm.length === 0) {
      // Check if category exists but form type is wrong
      const category = await this.serviceCategoryRepo.findOneBy({ _id: new ObjectId(categoryId) });
      if (!category || category.isDeleted) {
        throw new NotFoundException('Category not found');
      }
      
      if (!category.formId || category.formId.trim() === '') {
        throw new BadRequestException('Category does not have a valid formId');
      }

      // Check if form exists but has wrong type
      if (ObjectId.isValid(category.formId)) {
        const form = await this.formRepo.findOneBy({ _id: new ObjectId(category.formId) });
        if (!form) {
          throw new NotFoundException(`Form with ID ${category.formId} not found in forms table`);
        }
        if (form.type !== 'vendor-service') {
          throw new BadRequestException(`Category is linked to a form with type '${form.type}'. Only categories with forms of type 'vendor-service' are allowed for vendors.`);
        }
      }
      
      throw new NotFoundException('Category not found or does not have a valid vendor-service form');
    }

    // Now filter vendors by this categoryId
    const updatedPaginationDto = { ...paginationDto, categoryId };
    return this.findAll(updatedPaginationDto);
  }

  async findByLocation(location: string, paginationDto: VendorPaginationDto): Promise<VendorPaginatedResponseDto> {
    const updatedPaginationDto = { ...paginationDto, location };
    return this.findAll(updatedPaginationDto);
  }

  async findByPriceRange(minPrice: number, maxPrice: number, paginationDto: VendorPaginationDto): Promise<VendorPaginatedResponseDto> {
    const updatedPaginationDto = { ...paginationDto, minPrice, maxPrice };
    return this.findAll(updatedPaginationDto);
  }

  async update(id: string, updateDto: UpdateVendorDto): Promise<VendorResponseDto> {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid vendor ID format');
    }

    const existingVendor = await this.vendorRepo.findOneBy({ _id: new ObjectId(id) });

    if (!existingVendor || existingVendor.isDeleted) {
      throw new NotFoundException('Vendor not found');
    }

    // If updating name, check for duplicates
    if (updateDto.name && updateDto.name !== existingVendor.name) {
      const categoryId = updateDto.categoryId || existingVendor.categoryId;
      const duplicateVendor = await this.vendorRepo.findOne({
        where: {
          name: updateDto.name,
          categoryId,
          isDeleted: false,
          _id: { $ne: new ObjectId(id) }
        }
      });

      if (duplicateVendor) {
        throw new BadRequestException('Vendor with this name already exists in the selected category');
      }
    }

    // Validate and sanitize formData if provided
    let sanitizedFormData;
    if (updateDto.formData) {
      VendorFormValidator.validateFormData(updateDto.formData);
      sanitizedFormData = VendorFormValidator.sanitizeFormData(updateDto.formData);
      
      // Merge with existing formData to preserve other fields
      // Only update the specific fields that are being changed
      const existingFormData = existingVendor.formData || {};
      sanitizedFormData = {
        ...existingFormData,
        ...sanitizedFormData,
        // Deep merge for nested objects like fields array
        ...(sanitizedFormData.fields && {
          fields: sanitizedFormData.fields // Use new fields if provided
        })
      };
    }

    try {
      const updateData: any = {
        ...updateDto,
        ...(updateDto.categoryId && { categoryId: updateDto.categoryId }),
        ...(sanitizedFormData && { formData: sanitizedFormData }),
        updatedAt: new Date()
      };
      
      // Set updatedBy from DTO if provided
      if (updateDto.updatedBy) {
        updateData.updatedBy = updateDto.updatedBy;
      }

      // Ensure we're only updating the specific record by ID
      console.log('Updating vendor with ID:', id);
      console.log('Update filter:', { _id: new ObjectId(id) });
      
      const updateResult = await this.vendorRepo.updateOne({ _id: new ObjectId(id) }, { $set: updateData });
      console.log('Update result - matchedCount:', updateResult.matchedCount, 'modifiedCount:', updateResult.modifiedCount);
      
      if (updateResult.matchedCount === 0) {
        throw new NotFoundException('Vendor not found for update');
      }
      
      if (updateResult.matchedCount > 1) {
        console.error('WARNING: Multiple vendors matched the update filter! This should not happen.');
      }
      
      return this.findOne(id);
    } catch (error) {
      throw new BadRequestException('Failed to update vendor');
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid vendor ID format');
    }

    const vendor = await this.vendorRepo.findOneBy({ _id: new ObjectId(id) });

    if (!vendor || vendor.isDeleted) {
      throw new NotFoundException('Vendor not found');
    }

    try {
      await this.vendorRepo.updateOne(
        { _id: new ObjectId(id) }, 
        { 
          $set: {
            isDeleted: true, 
            updatedAt: new Date() 
          }
        }
      );
      
      return { message: 'Vendor deleted successfully' };
    } catch (error) {
      throw new BadRequestException('Failed to delete vendor');
    }
  }

  // New method to update aggregated rating
  async updateAggregatedRating(vendorId: string): Promise<void> {
    if (!ObjectId.isValid(vendorId)) {
      throw new BadRequestException('Invalid vendor ID format');
    }

    const vendor = await this.vendorRepo.findOneBy({ _id: new ObjectId(vendorId) });

    if (!vendor || vendor.isDeleted) {
      throw new NotFoundException('Vendor not found');
    }

    const allVendorRatings = await this.ratingRepo.find({
      where: { entityId: vendorId, entityType: 'vendor' }
    });

    const totalScore = allVendorRatings?.reduce((sum, r) => sum + r.score, 0);
    const newTotalRatings = allVendorRatings.length;
    const newAverageRating = newTotalRatings > 0 ? totalScore / newTotalRatings : 0;

    vendor.averageRating = newAverageRating;
    vendor.totalRatings = newTotalRatings;
    vendor.updatedAt = new Date();

    await this.vendorRepo.save(vendor);
  }

  async getVendorStats(): Promise<any> {
    try {
      const total = await this.vendorRepo.count({ isDeleted: false });
      const active = await this.vendorRepo.count({ isDeleted: false, isActive: true });
      const inactive = await this.vendorRepo.count({ isDeleted: false, isActive: false });

      return {
        total,
        active,
        inactive,
        deletedCount: await this.vendorRepo.count({ isDeleted: true })
      };
    } catch (error) {
      throw new BadRequestException('Failed to get vendor statistics');
    }
  }

  async uploadVendorImage(file: any): Promise<string> {
    if (process.env.NODE_ENV === 'local') {
      // For local development, save to local file system
      const rootDir = path.resolve(__dirname, '..', '..', '..');
      const dir = path.join(rootDir, 'uploads', 'vendors');
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Generate unique filename to avoid conflicts
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const fileExtension = path.extname(file.originalname);
      const fileName = `vendor_${timestamp}_${randomSuffix}${fileExtension}`;
      const filePath = path.join(dir, fileName);
      
      fs.writeFileSync(filePath, file.buffer);
      
      // Return the URL path, not the file path
      return `/uploads/vendors/${fileName}`;
    } else {
      // For production, upload to S3 (you'll need to implement AWS S3 service)
      // For now, return a placeholder URL
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const fileExtension = path.extname(file.originalname);
      const fileName = `vendor_${timestamp}_${randomSuffix}${fileExtension}`;
      
      // TODO: Implement S3 upload for production
      return `https://your-s3-bucket.com/vendors/${fileName}`;
    }
  }

  private getVendorAlbums(vendorAlbums: any[], placeholderImages: string[]): any[] {
    // If vendor has albums, return them
    if (vendorAlbums && vendorAlbums.length > 0) {
      return vendorAlbums;
    }
    
    // Otherwise, return dummy albums
    return [
      {
        id: new ObjectId().toString(),
        name: 'Wedding Venue Gallery',
        images: placeholderImages.slice(0, 4),
        imageCount: 4,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: new ObjectId().toString(),
        name: 'Event Services',
        images: placeholderImages.slice(4, 8),
        imageCount: 4,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  async updateRating(vendorId: string, averageRating: number, totalRatings: number): Promise<void> {
    try {
      await this.vendorRepo.update(
        { id: new ObjectId(vendorId) },
        { 
          averageRating: Math.round(averageRating * 100) / 100, // Round to 2 decimal places
          totalRatings 
        }
      );
    } catch (error) {
      console.error('Failed to update vendor rating:', error);
    }
  }
}
