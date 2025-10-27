import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository, ObjectLiteral } from 'typeorm';
import { ObjectId } from 'mongodb';
import { plainToInstance } from 'class-transformer';
import { Venue } from './entity/venue.entity';
import { CreateVenueDto } from './dto/request/create-venue.dto';
import { UpdateVenueDto } from './dto/request/update-venue.dto';
import { VenueResponseDto } from './dto/response/venue-response.dto';
import { VenueDetailResponseDto } from './dto/response/venue-detail-response.dto';
import { VenuePaginatedResponseDto } from './dto/response/venue-paginated.dto';
import { VenuePaginationDto } from './dto/request/venue-pagination.dto';
import { IPaginationMeta } from '@common/interfaces/paginationMeta.interface';
import { VenueFormValidator } from './helpers/venue-form-validator';
import { CategoryPricingHelper } from './helpers/category-pricing.helper';
import { Rating } from '../rating/entity/rating.entity';
import { User } from '../user/entities/user.entity';
import { ServiceCategory } from '../service-category/entity/service-category.entity';
import { LocationService } from '@modules/location/location.service';

@Injectable()
export class VenueService {
  constructor(
    @InjectRepository(Venue, 'mongo')
    private readonly venueRepo: MongoRepository<Venue>,
    @InjectRepository(Rating, 'mongo')
    private readonly ratingRepo: MongoRepository<Rating>,
    @InjectRepository(ServiceCategory, 'mongo')
    private readonly categoryRepo: MongoRepository<ServiceCategory>,
    @InjectRepository(User, 'mongo')
    private readonly userRepo: MongoRepository<User>,
    private readonly locationService: LocationService,
  ) {}

  async create(createDto: CreateVenueDto): Promise<VenueResponseDto> {
    try {
      // Validate and sanitize form data
      VenueFormValidator.validateFormData(createDto.formData);
      const sanitizedFormData = VenueFormValidator.sanitizeFormData(createDto.formData);

      // Check if venue name already exists for the same category
      const existingVenue = await this.venueRepo.findOne({
        where: {
          name: createDto.name,
          categoryId: createDto.serviceCategoryId,
          isDeleted: false
        }
      });

      if (existingVenue) {
        throw new BadRequestException('Venue with this name already exists in the selected category');
      }

      // Get category information for pricing generation
      let categoryName = 'General Venue';
      if (createDto.serviceCategoryId && ObjectId.isValid(createDto.serviceCategoryId)) {
        try {
          const category = await this.categoryRepo.findOneBy({ _id: new ObjectId(createDto.serviceCategoryId) });
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

      const venue = this.venueRepo.create({
        categoryId: createDto.serviceCategoryId, // Map serviceCategoryId to categoryId
        name: createDto.name,
        title: createDto.title,
        description: createDto.description,
        longDescription: createDto.longDescription || `Welcome to ${createDto.title}, a premier venue perfect for your special events. Our beautifully designed space offers a perfect blend of elegance and functionality, providing an ideal setting for weddings, corporate events, and celebrations. With state-of-the-art facilities and professional amenities, we ensure your event is memorable and seamless. Our experienced team is dedicated to providing exceptional service and attention to detail, making your special day truly unforgettable.`,
        formData: sanitizedFormData,
        averageRating: 0, // Initialize new fields
        totalRatings: 0,
        price: 0, // Will be calculated from formData
        imageUrl: '', // Will be set from formData or default
        albums: processedAlbums
      });
      const savedVenue = await this.venueRepo.save(venue);
      
      // Transform the response to map categoryId to serviceCategoryId
      const transformedVenue = {
        ...savedVenue,
        serviceCategoryId: savedVenue.categoryId
      };
      
      return plainToInstance(VenueResponseDto, transformedVenue, { 
        excludeExtraneousValues: true 
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create venue');
    }
  }

  async findAll(paginationDto: VenuePaginationDto): Promise<VenuePaginatedResponseDto> {
    const { page = 1, limit = 10, search, categoryId } = paginationDto;
    const skip = (page - 1) * limit;

    // Build query conditions
    const query: ObjectLiteral = {
      isDeleted: false,
    };

    if (categoryId) {
      query.categoryId = categoryId;
    }

    if (search) {
      query.$or = [
        { name: { $regex: new RegExp(search, 'i') } },
        { 'formData.location': { $regex: new RegExp(search, 'i') } },
        { 'formData.description': { $regex: new RegExp(search, 'i') } }
      ];
    }

    try {
      const [venues, total] = await Promise.all([
        this.venueRepo.find({
          where: query,
          skip,
          take: limit,
          order: { createdAt: 'DESC' }
        }),
        this.venueRepo.count(query)
      ]);

      const transformedVenues = await Promise.all(venues.map(async (venue) => {
        const storedLocation = await this.locationService.findByServiceId(venue.id?.toString());
        
        // Get category information for pricing generation
        let categoryName = 'General Venue';
        if (venue.categoryId && ObjectId.isValid(venue.categoryId)) {
          try {
            const category = await this.categoryRepo.findOneBy({ _id: new ObjectId(venue.categoryId) });
            if (category && !category.isDeleted) {
              categoryName = category.name;
            }
          } catch (error) {
            console.log('Category lookup failed, using default category name');
          }
        }

        // Generate category-specific pricing
        const categoryPricing = CategoryPricingHelper.generateCategoryPricing(categoryName);

        return {
          ...venue,
          serviceCategoryId: venue.categoryId,
          location: {
            address: storedLocation?.address || venue.formData?.address || venue.formData?.location || 'Address not available',
            city: venue.formData?.city || 'City not available',
            latitude: (storedLocation?.latitude as number) ?? venue.formData?.latitude ?? 0,
            longitude: (storedLocation?.longitude as number) ?? venue.formData?.longitude ?? 0,
            pinTitle: venue.formData?.pinTitle || venue.name,
            mapImageUrl: venue.formData?.mapImageUrl || 'https://maps.googleapis.com/...'
          },
          pricing: venue.formData?.pricing || categoryPricing
        };
      }));
  
      const data = plainToInstance(VenueResponseDto, transformedVenues, {
        excludeExtraneousValues: true
      });

      const pagination: IPaginationMeta = {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };

      return { data, pagination };
    } catch (error) {
      throw new BadRequestException('Failed to fetch venues');
    }
  }

  async findAllForUser(paginationDto: VenuePaginationDto): Promise<{ data: any[], pagination: IPaginationMeta }> {
    const { page = 1, limit = 10, search, categoryId } = paginationDto;
    const skip = (page - 1) * limit;

    // Build query conditions
    const query: ObjectLiteral = {
      isDeleted: false,
    };

    if (categoryId) {
      query.categoryId = categoryId;
    }

    if (search) {
      query.$or = [
        { name: { $regex: new RegExp(search, 'i') } },
        { 'formData.location': { $regex: new RegExp(search, 'i') } },
        { 'formData.description': { $regex: new RegExp(search, 'i') } }
      ];
    }

    try {
      const [venues, total] = await Promise.all([
        this.venueRepo.find({
          where: query,
          skip,
          take: limit,
          order: { createdAt: 'DESC' }
        }),
        this.venueRepo.count(query)
      ]);

      // Enrich each venue with location for user listing
      const transformedVenues = await Promise.all(venues.map(async (venue) => {
        const storedLocation = await this.locationService.findByServiceId(venue.id?.toString());
        return {
          ...venue,
          location: {
            address: storedLocation?.address || venue.formData?.address || venue.formData?.location || 'Address not available',
            city: venue.formData?.city || 'City not available',
            latitude: (storedLocation?.latitude as number) ?? venue.formData?.latitude ?? 0,
            longitude: (storedLocation?.longitude as number) ?? venue.formData?.longitude ?? 0,
            pinTitle: venue.formData?.pinTitle || venue.name,
            mapImageUrl: venue.formData?.mapImageUrl || 'https://maps.googleapis.com/...'
          }
        };
      }));
      const pagination: IPaginationMeta = {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };

      return { data: transformedVenues, pagination };
    } catch (error) {
      throw new BadRequestException('Failed to fetch venues');
    }
  }

  async findByCategoryForUser(categoryId: string, paginationDto: VenuePaginationDto): Promise<{ data: any[], pagination: IPaginationMeta }> {
    if (!ObjectId.isValid(categoryId)) {
      throw new BadRequestException('Invalid category ID format');
    }

    const { page = 1, limit = 10, search } = paginationDto;
    const skip = (page - 1) * limit;

    // Build query conditions
    const query: ObjectLiteral = {
      categoryId: categoryId,
      isDeleted: false,
    };

    if (search) {
      query.$or = [
        { name: { $regex: new RegExp(search, 'i') } },
        { 'formData.location': { $regex: new RegExp(search, 'i') } },
        { 'formData.description': { $regex: new RegExp(search, 'i') } }
      ];
    }

    try {
      const [venues, total] = await Promise.all([
        this.venueRepo.find({
          where: query,
          skip,
          take: limit,
          order: { createdAt: 'DESC' }
        }),
        this.venueRepo.count(query)
      ]);

      // Return raw data for user endpoint transformation
      const pagination: IPaginationMeta = {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };

      return { data: venues, pagination };
    } catch (error) {
      throw new BadRequestException('Failed to fetch venues');
    }
  }

  async findOne(id: string): Promise<VenueResponseDto> {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid venue ID format');
    }

    const venue = await this.venueRepo.findOneBy({ _id: new ObjectId(id) });

    if (!venue || venue.isDeleted) {
      throw new NotFoundException('Venue not found');
    }

    // Get category information for pricing generation
    let categoryName = 'General Venue';
    if (venue.categoryId && ObjectId.isValid(venue.categoryId)) {
      try {
        const category = await this.categoryRepo.findOneBy({ _id: new ObjectId(venue.categoryId) });
        if (category && !category.isDeleted) {
          categoryName = category.name;
        }
      } catch (error) {
        console.log('Category lookup failed, using default category name');
      }
    }

    // Generate category-specific pricing
    const categoryPricing = CategoryPricingHelper.generateCategoryPricing(categoryName);

    // Transform the response to map categoryId to serviceCategoryId
    const transformedVenue = {
      ...venue,
      serviceCategoryId: venue.categoryId,
      pricing: venue.formData?.pricing || categoryPricing
    };
    
    return plainToInstance(VenueResponseDto, transformedVenue, { 
      excludeExtraneousValues: true 
    });
  }

  async findOneDetail(id: string): Promise<VenueDetailResponseDto> {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid venue ID format');
    }

    const venue = await this.venueRepo.findOneBy({ _id: new ObjectId(id) });

    if (!venue || venue.isDeleted) {
      throw new NotFoundException('Venue not found');
    }

    // Get category information
    let categoryName = 'Uncategorized';
    const originalCategoryId = venue.categoryId; // Preserve original categoryId
    
    if (venue.categoryId && ObjectId.isValid(venue.categoryId)) {
      try {
        // Try to find the category using findOneBy - match categoryId with _id in categories table
        const category = await this.categoryRepo.findOneBy({ id: new ObjectId(venue.categoryId) });
        if (category && !category.isDeleted) {
          categoryName = category.name;
        } else {
          // If not found with findOneBy, try using findOne with where clause
          const categoryAlt = await this.categoryRepo.findOne({
            where: { id: new ObjectId(venue.categoryId), isDeleted: false }
          });
          if (categoryAlt) {
            categoryName = categoryAlt.name;
          } else {
            // Try to find any category with this ID regardless of isDeleted status
            const categoryAny = await this.categoryRepo.findOneBy({ id: new ObjectId(venue.categoryId) });
            if (categoryAny) {
              categoryName = categoryAny.name;
            } else {
              // Category not found - try to assign a default category
              const defaultCategory = await this.categoryRepo.findOne({
                where: { isDeleted: false, isActive: true },
                order: { createdAt: 'ASC' }
              });
              
              if (defaultCategory) {
                // Update the venue with the default category
                const categoryIdString = defaultCategory.id.toString();
                await this.venueRepo.updateOne(
                  { _id: new ObjectId(id) },
                  { $set: { categoryId: categoryIdString, updatedAt: new Date() } }
                );
                // Don't update the venue object - keep original categoryId for response
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

    // Get ratings for this venue
    const ratings = await this.ratingRepo.find({
      where: { entityId: id, entityType: 'venue', isDeleted: false }
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

      // Resolve location from locations collection (by serviceId = venue.id)
      const storedLocation = await this.locationService.findByServiceId(venue.id?.toString());

      // Prepare placeholder HTTPS images for venue/event related content
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

      // Get venue albums from the venue document
      const venueAlbums = venue.albums || [];

      // Transform venue data to match the required format
      const transformedVenue = {
        id: venue.id?.toString(),
        name: venue.name,
        title: venue.title,
        location: {
          address: storedLocation?.address || venue.formData?.address || venue.formData?.location || 'Address not available',
          city: venue.formData?.city || 'City not available',
          latitude: (storedLocation?.latitude as number) ?? venue.formData?.latitude ?? 0,
          longitude: (storedLocation?.longitude as number) ?? venue.formData?.longitude ?? 0,
          pinTitle: venue.formData?.pinTitle || venue.name,
          mapImageUrl: venue.formData?.mapImageUrl || 'https://maps.googleapis.com/...'
        },
        avgRating: Math.round(avgRating * 10) / 10, // Round to 1 decimal place
        reviewCount: reviewCount,
        description: venue.description || venue.formData?.description || 'No description available',
        longDescription: venue.longDescription || venue.formData?.longDescription || 'Detailed information about our venue and facilities will be available soon.',
        about: venue.formData?.about || venue.description || 'No additional information available',
        images: ensureHttpsImages(
          (venue.formData?.images as string[]) || (venue.imageUrl ? [venue.imageUrl] : [])
        ),
        pricing: {
          pricing: venue.formData?.pricing || CategoryPricingHelper.generateCategoryPricing(categoryName),
          packages: venue.formData?.packages || [
            {
              name: 'Standard',
              price: venue.price || 0,
              includes: ['basic decor', 'sound system']
            }
          ]
        },
        priceRange: venue.formData?.priceRange || '₹1,00,000 - ₹10,00,000',
        roomCount: venue.formData?.roomCount || 50,
        cateringPolicy: venue.formData?.cateringPolicy || 'Inhouse catering only',
        albums: this.getVenueAlbums(venueAlbums, placeholderImages),
        reviews: ratings.slice(0, 10).map(rating => {
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
            comment: rating.review || 'No comment',
            profileImage
          };
        }),
        category_id: originalCategoryId || '',
        category_name: categoryName
      };

    return plainToInstance(VenueDetailResponseDto, transformedVenue, { 
      excludeExtraneousValues: true 
    });
  }

  async findByCategory(categoryId: string, paginationDto: VenuePaginationDto): Promise<VenuePaginatedResponseDto> {
    const updatedPaginationDto = { ...paginationDto, categoryId };
    return this.findAll(updatedPaginationDto);
  }

  async update(id: string, updateDto: UpdateVenueDto): Promise<VenueResponseDto> {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid venue ID format');
    }

    const existingVenue = await this.venueRepo.findOneBy({ _id: new ObjectId(id) });

    if (!existingVenue || existingVenue.isDeleted) {
      throw new NotFoundException('Venue not found');
    }

    // If updating name, check for duplicates
    if (updateDto.name && updateDto.name !== existingVenue.name) {
      const categoryId = updateDto.serviceCategoryId || existingVenue.categoryId;
      const duplicateVenue = await this.venueRepo.findOne({
        where: {
          name: updateDto.name,
          categoryId,
          isDeleted: false,
          _id: { $ne: new ObjectId(id) }
        }
      });

      if (duplicateVenue) {
        throw new BadRequestException('Venue with this name already exists in the selected category');
      }
    }

    // Validate and sanitize formData if provided
    let sanitizedFormData;
    if (updateDto.formData) {
      VenueFormValidator.validateFormData(updateDto.formData);
      sanitizedFormData = VenueFormValidator.sanitizeFormData(updateDto.formData);
    }

    try {
      const updateData: any = {
        ...updateDto,
        ...(updateDto.serviceCategoryId && { categoryId: updateDto.serviceCategoryId }), // Map serviceCategoryId to categoryId
        ...(sanitizedFormData && { formData: sanitizedFormData }),
        updatedAt: new Date()
      };

      await this.venueRepo.updateOne({ _id: new ObjectId(id) }, { $set: updateData });
      return this.findOne(id);
    } catch (error) {
      throw new BadRequestException('Failed to update venue');
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid venue ID format');
    }

    const venue = await this.venueRepo.findOneBy({ _id: new ObjectId(id) });

    if (!venue || venue.isDeleted) {
      throw new NotFoundException('Venue not found');
    }

    try {
      await this.venueRepo.updateOne(
        { _id: new ObjectId(id) }, 
        { 
          $set: {
            isDeleted: true, 
            updatedAt: new Date() 
          }
        }
      );
      
      return { message: 'Venue deleted successfully' };
    } catch (error) {
      throw new BadRequestException('Failed to delete venue');
    }
  }

  // New method to update aggregated rating
  async updateAggregatedRating(venueId: string): Promise<void> {
    if (!ObjectId.isValid(venueId)) {
      throw new BadRequestException('Invalid venue ID format');
    }

    const venue = await this.venueRepo.findOneBy({ _id: new ObjectId(venueId) });

    if (!venue || venue.isDeleted) {
      throw new NotFoundException('Venue not found');
    }

    const allVenueRatings = await this.ratingRepo.find({ where: { entityId: venueId, entityType: 'venue' } });
  
    const totalScore = allVenueRatings?.reduce((sum, r) => sum + r.score, 0);
    const newTotalRatings = allVenueRatings.length;
    const newAverageRating = newTotalRatings > 0 ? totalScore / newTotalRatings : 0;

    venue.averageRating = newAverageRating;
    venue.totalRatings = newTotalRatings;
    venue.updatedAt = new Date();

    await this.venueRepo.save(venue);
  }

  async getVenueStats(): Promise<any> {
    try {
      const total = await this.venueRepo.count({ isDeleted: false });
      const active = await this.venueRepo.count({ isDeleted: false, isActive: true });
      const inactive = await this.venueRepo.count({ isDeleted: false, isActive: false });

      return {
        total,
        active,
        inactive,
        deletedCount: await this.venueRepo.count({ isDeleted: true })
      };
    } catch (error) {
      throw new BadRequestException('Failed to get venue statistics');
    }
  }

  private getVenueAlbums(venueAlbums: any[], placeholderImages: string[]): any[] {
    // If venue has albums, return them
    if (venueAlbums && venueAlbums.length > 0) {
      return venueAlbums;
    }
    
    // Otherwise, return dummy albums
    return [
      {
        id: new ObjectId().toString(),
        name: 'Wedding Hall Gallery',
        images: placeholderImages.slice(0, 4),
        imageCount: 4,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: new ObjectId().toString(),
        name: 'Event Spaces',
        images: placeholderImages.slice(4, 8),
        imageCount: 4,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  async updateRating(venueId: string, averageRating: number, totalRatings: number): Promise<void> {
    try {
      await this.venueRepo.update(
        { id: new ObjectId(venueId) },
        { 
          averageRating: Math.round(averageRating * 100) / 100, // Round to 2 decimal places
          totalRatings 
        }
      );
    } catch (error) {
      console.error('Failed to update venue rating:', error);
    }
  }
}
