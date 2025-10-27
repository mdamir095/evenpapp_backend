import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository, ObjectLiteral } from 'typeorm';
import { ObjectId } from 'mongodb';
import { plainToInstance } from 'class-transformer';
import * as path from 'path';
import * as fs from 'fs';
import { Vendor } from './entity/vendor.entity';
import { ServiceCategory } from '../service-category/entity/service-category.entity';
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
    @InjectRepository(ServiceCategory, 'mongo') private readonly categoryRepo: MongoRepository<ServiceCategory>,
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
          const category = await this.categoryRepo.findOneBy({ _id: new ObjectId(createDto.categoryId) });
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
        albums: processedAlbums
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
  
    // Price filtering
    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceConditions = [];
  
      if (minPrice !== undefined) {
        priceConditions.push(
          { 'formData.pricing.starting': { $gte: minPrice } },
          { 'formData.pricing': { $gte: minPrice } }
        );
      }
  
      if (maxPrice !== undefined) {
        priceConditions.push(
          { 'formData.pricing.starting': { $lte: maxPrice } },
          { 'formData.pricing': { $lte: maxPrice } }
        );
      }
  
      if (priceConditions.length > 0) {
        searchConditions.push(...priceConditions);
      }
    }
  
    if (searchConditions.length > 0) {
      query.$or = searchConditions;
    }
  
    try {
      const [vendors, total] = await Promise.all([
        this.vendorRepo.find({
          where: query,
          skip,
          take: limit,
          order: { createdAt: 'DESC' },
        }),
        this.vendorRepo.count(query),
      ]);

      const populatedVendors = await Promise.all(
        vendors.map(async (vendor) => {
          const category = await this.categoryRepo.findOneBy({ _id: new ObjectId(vendor.categoryId) });
          const storedLocation = await this.locationService.findByServiceId(vendor.id?.toString());
          
          // Generate category-specific pricing
          const categoryName = category?.name || 'General Service';
          const categoryPricing = CategoryPricingHelper.generateCategoryPricing(categoryName);
          
          return { 
            ...vendor, 
            categoryName : category?.name,
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
      const data = plainToInstance(VendorResponseDto, populatedVendors, {
        excludeExtraneousValues: true,
      });
  
      const pagination: IPaginationMeta = {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
  
      return { data, pagination };
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
        const category = await this.categoryRepo.findOneBy({ _id: new ObjectId(vendor.categoryId) });
        if (category && !category.isDeleted) {
          categoryName = category.name;
        }
      } catch (error) {
        console.log('Category lookup failed, using default category name');
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
        // Try to find the category using _id field (ObjectIdColumn)
        const category = await this.categoryRepo.findOneBy({ _id: new ObjectId(vendor.categoryId) });
        if (category && !category.isDeleted) {
          categoryName = category.name;
        } else {
          // If not found with findOneBy, try using findOne with where clause
          const categoryAlt = await this.categoryRepo.findOne({
            where: { _id: new ObjectId(vendor.categoryId), isDeleted: false }
          });
          if (categoryAlt) {
            categoryName = categoryAlt.name;
          } else {
            // Try to find any category with this ID regardless of isDeleted status
            const categoryAny = await this.categoryRepo.findOneBy({ _id: new ObjectId(vendor.categoryId) });
            if (categoryAny) {
              categoryName = categoryAny.name;
            } else {
              // Category not found - try to assign a default category
              const defaultCategory = await this.categoryRepo.findOne({
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
      category_name: categoryName
    };

    return plainToInstance(VendorDetailResponseDto, transformedVendor, { 
      excludeExtraneousValues: true 
    });
  }


  async findByCategory(categoryId: string, paginationDto: VendorPaginationDto): Promise<VendorPaginatedResponseDto> {
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
    }

    try {
      const updateData: any = {
        ...updateDto,
        ...(updateDto.categoryId && { categoryId: updateDto.categoryId }),
        ...(sanitizedFormData && { formData: sanitizedFormData }),
        updatedAt: new Date()
      };

      await this.vendorRepo.updateOne({ _id: new ObjectId(id) }, { $set: updateData });
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
