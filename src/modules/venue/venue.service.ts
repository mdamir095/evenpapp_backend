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
import { Form } from '../form/entity/form.entity';
import { LocationService } from '@modules/location/location.service';
import { SupabaseService } from '@shared/modules/supabase/supabase.service';
import * as path from 'path';

@Injectable()
export class VenueService {
  constructor(
    @InjectRepository(Venue, 'mongo')
    private readonly venueRepo: MongoRepository<Venue>,
    @InjectRepository(Rating, 'mongo')
    private readonly ratingRepo: MongoRepository<Rating>,
    @InjectRepository(ServiceCategory, 'mongo')
    private readonly categoryRepo: MongoRepository<ServiceCategory>,
    @InjectRepository(Form, 'mongo')
    private readonly formRepo: MongoRepository<Form>,
    @InjectRepository(User, 'mongo')
    private readonly userRepo: MongoRepository<User>,
    private readonly locationService: LocationService,
    private readonly supabaseService: SupabaseService,
  ) {}

  async create(createDto: CreateVenueDto, user?: any): Promise<VenueResponseDto> {
    try {
      // Log received data for debugging
      console.log('=== CREATE VENUE DEBUG ===');
      console.log('Received DTO:', JSON.stringify(createDto, null, 2));
      console.log('name:', createDto.name);
      console.log('serviceCategoryId:', createDto.serviceCategoryId);
      console.log('description:', createDto.description);
      console.log('formData:', createDto.formData);
      console.log('========================');
      
      // Use actual values from DTO
      // If values are provided (even if empty string), use them
      // Only default if truly undefined
      const name = createDto.name !== undefined && createDto.name !== null ? createDto.name : '';
      const serviceCategoryId = createDto.serviceCategoryId !== undefined && createDto.serviceCategoryId !== null ? createDto.serviceCategoryId : '';
      const title = createDto.title !== undefined && createDto.title !== null ? createDto.title : (name || '');
      const description = createDto.description !== undefined && createDto.description !== null ? createDto.description : null;
      const formData = createDto.formData ?? {};
      
      console.log('Processed values:');
      console.log('  name:', name, '(from DTO:', createDto.name, ')');
      console.log('  serviceCategoryId:', serviceCategoryId, '(from DTO:', createDto.serviceCategoryId, ')');
      console.log('  title:', title, '(from DTO:', createDto.title, ')');
      console.log('  description:', description, '(from DTO:', createDto.description, ')');
      
      // Validate and sanitize form data
      VenueFormValidator.validateFormData(formData);
      const sanitizedFormData = VenueFormValidator.sanitizeFormData(formData);

      // Determine enterprise information based on user type
      let enterpriseId = createDto.enterpriseId;
      let enterpriseName = createDto.enterpriseName;

      // Check if user is an enterprise user (has enterpriseId in token)
      if (user && user.enterpriseId) {
        // Enterprise user - use their enterprise information
        enterpriseId = user.enterpriseId;
        enterpriseName = user.organizationName || createDto.enterpriseName || 'Unknown Enterprise';
      } else if (!enterpriseId && !enterpriseName) {
        // If no enterprise info provided and user doesn't have it, allow null (for admin users)
        enterpriseId = undefined;
        enterpriseName = undefined;
      }

      // Check if venue name already exists for the same category and enterprise (only if both are provided)
      if (name && serviceCategoryId) {
        const whereCondition: any = {
          name: name,
          categoryId: serviceCategoryId,
          isDeleted: false
        };
        
        // If enterpriseId is provided, also check for enterprise uniqueness
        if (enterpriseId) {
          whereCondition.enterpriseId = enterpriseId;
        }
        
        const existingVenue = await this.venueRepo.findOne({
          where: whereCondition
        });

        if (existingVenue) {
          const errorMessage = enterpriseId 
            ? 'Venue with this name already exists in the selected category for this enterprise'
            : 'Venue with this name already exists in the selected category';
          throw new BadRequestException(errorMessage);
        }
      }

      // Get category information for pricing generation
      let categoryName = 'General Venue';
      if (serviceCategoryId && ObjectId.isValid(serviceCategoryId)) {
        try {
          const category = await this.categoryRepo.findOneBy({ _id: new ObjectId(serviceCategoryId) });
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

      const venueData: any = {
        categoryId: serviceCategoryId, // Map serviceCategoryId to categoryId
        name: name,
        title: title,
        description: description ?? undefined, // Convert null to undefined for TypeORM
        longDescription: createDto.longDescription || `Welcome to ${title || name || 'this venue'}, a premier venue perfect for your special events. Our beautifully designed space offers a perfect blend of elegance and functionality, providing an ideal setting for weddings, corporate events, and celebrations. With state-of-the-art facilities and professional amenities, we ensure your event is memorable and seamless. Our experienced team is dedicated to providing exceptional service and attention to detail, making your special day truly unforgettable.`,
        formData: sanitizedFormData,
        averageRating: 0, // Initialize new fields
        totalRatings: 0,
        price: 0, // Will be calculated from formData
        imageUrl: '', // Will be set from formData or default
        albums: processedAlbums,
        enterpriseId: enterpriseId,
        enterpriseName: enterpriseName,
        ...(createDto.createdBy && { createdBy: createDto.createdBy })
      };
      
      console.log('=== SAVING VENUE TO DATABASE ===');
      console.log('Venue data to save:', JSON.stringify(venueData, null, 2));
      console.log('categoryId:', venueData.categoryId);
      console.log('name:', venueData.name);
      console.log('title:', venueData.title);
      console.log('description:', venueData.description);
      console.log('enterpriseId:', venueData.enterpriseId);
      console.log('enterpriseName:', venueData.enterpriseName);
      console.log('================================');
      
      const venue = this.venueRepo.create(venueData);
      const savedVenueResult = await this.venueRepo.save(venue);
      // Handle both single entity and array return types
      const savedVenue = Array.isArray(savedVenueResult) ? savedVenueResult[0] : savedVenueResult;
      
      console.log('=== SAVED VENUE ===');
      console.log('Saved venue ID:', savedVenue.id);
      console.log('Saved categoryId:', savedVenue.categoryId);
      console.log('Saved name:', savedVenue.name);
      console.log('Saved title:', savedVenue.title);
      console.log('Saved description:', savedVenue.description);
      console.log('===================');
      
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
        const venueCategoryId = venue.categoryId;
        
        if (venueCategoryId && ObjectId.isValid(venueCategoryId)) {
          try {
            // Try multiple query methods to find the category
            let category = await this.categoryRepo.findOneBy({ _id: new ObjectId(venueCategoryId) });
            
            // If not found, try with findOne
            if (!category) {
              category = await this.categoryRepo.findOne({
                where: { _id: new ObjectId(venueCategoryId) }
              });
            }
            
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
          categoryId: venueCategoryId,
          categoryName: categoryName,
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

      // Explicitly ensure categoryId and categoryName are present after transformation
      const finalData = data.map((venueDto: any, index: number) => {
        const originalVenue = transformedVenues[index];
        if (originalVenue) {
          venueDto.categoryId = originalVenue.categoryId;
          venueDto.categoryName = originalVenue.categoryName;
        }
        return venueDto;
      });

      const pagination: IPaginationMeta = {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };

      return { data: finalData, pagination };
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

      // Enrich each venue with location and category name for user listing
      const transformedVenues = await Promise.all(venues.map(async (venue) => {
        const storedLocation = await this.locationService.findByServiceId(venue.id?.toString());
        
        // Get category name from category table based on categoryId
        let categoryName = 'General Venue';
        const venueCategoryId = venue.categoryId;
        
        console.log('Looking up category for venue:', venue.id, 'categoryId:', venueCategoryId);
        
        if (venueCategoryId && ObjectId.isValid(venueCategoryId)) {
          try {
            // Try multiple query methods to find the category
            let category = await this.categoryRepo.findOneBy({ _id: new ObjectId(venueCategoryId) });
            
            // If not found, try with findOne
            if (!category) {
              category = await this.categoryRepo.findOne({
                where: { _id: new ObjectId(venueCategoryId) }
              });
            }
            
            // If still not found, try with id field
            if (!category) {
              category = await this.categoryRepo.findOne({
                where: { id: venueCategoryId }
              });
            }
            
            if (category && !category.isDeleted) {
              categoryName = category.name;
              console.log('✓ Found category:', categoryName, 'for venue:', venue.id, 'categoryId:', venueCategoryId);
            } else {
              console.log('⚠ Category not found or deleted for venue:', venue.id, 'categoryId:', venueCategoryId);
            }
          } catch (error) {
            console.error('❌ Category lookup failed for venue:', venue.id, 'categoryId:', venueCategoryId, 'error:', error);
          }
        } else {
          console.log('⚠ Invalid categoryId for venue:', venue.id, 'categoryId:', venueCategoryId);
        }
        
        // Extract price and imageUrl from formData fields
        let priceFromFormData = venue.formData?.price || venue.price || 0;
        let imageUrlFromFormData = venue.formData?.imageUrl || venue.formData?.images?.[0] || venue.imageUrl || '';
        
        // Extract from formData.fields if it exists
        if (venue.formData?.fields && Array.isArray(venue.formData.fields)) {
          // Find price from fields with "price" in the name
          const priceField = venue.formData.fields.find((field: any) => 
            field.name && field.name.toLowerCase().includes('price') && field.actualValue
          );
          if (priceField && priceField.actualValue) {
            // Try to parse as number if it's a string
            const priceValue = typeof priceField.actualValue === 'string' 
              ? parseFloat(priceField.actualValue) || 0 
              : priceField.actualValue;
            if (priceValue > 0) {
              priceFromFormData = priceValue;
            }
          }
          
          // Find image from MultiImageUpload fields
          const imageField = venue.formData.fields.find((field: any) => 
            field.type === 'MultiImageUpload' && 
            field.actualValue && 
            Array.isArray(field.actualValue) && 
            field.actualValue.length > 0
          );
          if (imageField && imageField.actualValue && imageField.actualValue.length > 0) {
            const firstImage = imageField.actualValue[0];
            // Check for url.imageUrl structure
            if (firstImage.url && firstImage.url.imageUrl) {
              imageUrlFromFormData = firstImage.url.imageUrl;
            } else if (typeof firstImage === 'string') {
              imageUrlFromFormData = firstImage;
            } else if (firstImage.url) {
              imageUrlFromFormData = firstImage.url;
            }
          }
        }
        
        return {
          ...venue,
          categoryId: venueCategoryId,
          categoryName: categoryName,
          price: priceFromFormData,
          imageUrl: imageUrlFromFormData,
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

    // Try multiple query methods to find the venue
    let venue = await this.venueRepo.findOne({
      where: { _id: new ObjectId(id) }
    });
    
    // If not found, try with findOneBy
    if (!venue) {
      venue = await this.venueRepo.findOneBy({ _id: new ObjectId(id) });
    }
    
    // If still not found, try with id field
    if (!venue) {
      venue = await this.venueRepo.findOne({
        where: { id: id }
      });
    }

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
      pricing: venue.formData?.pricing || categoryPricing,
      enterpriseId: venue.enterpriseId,
      enterpriseName: venue.enterpriseName
    };
    
    console.log('Venue findOne - enterpriseId:', venue.enterpriseId, 'enterpriseName:', venue.enterpriseName);
    
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

    // Get category information - filter by form type 'venue-category' to ensure we get the correct category
    let categoryName = 'Uncategorized';
    const originalCategoryId = venue.categoryId; // Preserve original categoryId
    
    if (venue.categoryId && ObjectId.isValid(venue.categoryId)) {
      try {
        // Use aggregation to join category with forms and filter by form type 'venue-category'
        const categoryResults = await this.categoryRepo
          .aggregate([
            { $match: { _id: new ObjectId(venue.categoryId) } },
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
            // Filter to only include categories with forms of type 'venue-category'
            {
              $match: {
                'formData.type': 'venue-category'
              }
            },
            {
              $project: {
                _id: 1,
                name: 1,
                formId: 1
              }
            }
          ])
          .toArray();

        if (categoryResults && categoryResults.length > 0) {
          categoryName = categoryResults[0].name;
        } else {
          // If not found with venue-category filter, try without filter as fallback
          const category = await this.categoryRepo.findOneBy({ _id: new ObjectId(venue.categoryId) });
          if (category && !category.isDeleted) {
            categoryName = category.name;
          } else {
            // Try with findOne
            const categoryAlt = await this.categoryRepo.findOne({
              where: { _id: new ObjectId(venue.categoryId) }
            });
            if (categoryAlt && !categoryAlt.isDeleted) {
              categoryName = categoryAlt.name;
            }
          }
        }
      } catch (error) {
        console.log('Category lookup error:', error);
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

  async update(id: string, updateDto: UpdateVenueDto, user?: any): Promise<VenueResponseDto> {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid venue ID format');
    }

    console.log('=== UPDATE VENUE DEBUG ===');
    console.log('Venue ID:', id);
    console.log('Update DTO:', JSON.stringify(updateDto, null, 2));
    
    // Try multiple query methods to find the venue
    let existingVenue = await this.venueRepo.findOne({
      where: { _id: new ObjectId(id) }
    });
    
    // If not found, try with findOneBy
    if (!existingVenue) {
      existingVenue = await this.venueRepo.findOneBy({ _id: new ObjectId(id) });
    }
    
    // If still not found, try with id field
    if (!existingVenue) {
      existingVenue = await this.venueRepo.findOne({
        where: { id: id }
      });
    }

    console.log('Existing venue found:', !!existingVenue);
    if (existingVenue) {
      console.log('Venue isDeleted:', existingVenue.isDeleted);
      console.log('Venue name:', existingVenue.name);
    }

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
      // Handle formData if it's a string (JSON string)
      let formDataObj = updateDto.formData;
      if (typeof formDataObj === 'string') {
        try {
          formDataObj = JSON.parse(formDataObj);
        } catch (e) {
          console.log('Failed to parse formData as JSON:', e);
        }
      }
      
      VenueFormValidator.validateFormData(formDataObj);
      sanitizedFormData = VenueFormValidator.sanitizeFormData(formDataObj);
      
      // Merge with existing formData to preserve other fields
      // Only update the specific fields that are being changed
      const existingFormData = existingVenue.formData || {};
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
      // Determine enterprise information
      // Priority: DTO values (from form-data) > User's enterprise info > Keep existing (undefined)
      let enterpriseId = updateDto.enterpriseId;
      let enterpriseName = updateDto.enterpriseName;

      // If DTO has enterprise info, use it (from form-data)
      // Otherwise, if user is an enterprise user, use their enterprise information
      if (enterpriseId === undefined && enterpriseName === undefined) {
        if (user && user.enterpriseId) {
          // Enterprise user - use their enterprise information as fallback
          enterpriseId = user.enterpriseId;
          enterpriseName = user.organizationName || 'Unknown Enterprise';
        } else {
          // If no enterprise info provided and user doesn't have it, keep existing values
          // Don't update enterprise fields if not provided
          enterpriseId = undefined;
          enterpriseName = undefined;
        }
      }
      
      console.log('Enterprise logic - DTO enterpriseId:', updateDto.enterpriseId, 'DTO enterpriseName:', updateDto.enterpriseName);
      console.log('Enterprise logic - Final enterpriseId:', enterpriseId, 'Final enterpriseName:', enterpriseName);

      // Prepare update data, excluding undefined values
      const updateData: any = {
        updatedAt: new Date()
      };
      
      // Only include fields that are actually provided
      if (updateDto.name !== undefined) {
        updateData.name = updateDto.name;
        // When name is updated, also update title to match name in the database
        updateData.title = updateDto.name;
      } else if (updateDto.title !== undefined) {
        // Only set title independently if name is not being updated
        updateData.title = updateDto.title;
      }
      if (updateDto.description !== undefined) updateData.description = updateDto.description;
      if (updateDto.longDescription !== undefined) updateData.longDescription = updateDto.longDescription;
      if (updateDto.serviceCategoryId !== undefined) updateData.categoryId = updateDto.serviceCategoryId;
      if (sanitizedFormData !== undefined) updateData.formData = sanitizedFormData;
      if (updateDto.albums !== undefined) updateData.albums = updateDto.albums;
      
      // Always include enterprise fields if they are provided
      // Check both the final values and DTO values to ensure we capture them
      if (enterpriseId !== undefined || updateDto.enterpriseId !== undefined) {
        const finalEnterpriseId = enterpriseId !== undefined ? enterpriseId : updateDto.enterpriseId;
        updateData.enterpriseId = finalEnterpriseId === '' ? null : finalEnterpriseId;
        console.log('Setting enterpriseId in updateData:', updateData.enterpriseId);
      }
      if (enterpriseName !== undefined || updateDto.enterpriseName !== undefined) {
        const finalEnterpriseName = enterpriseName !== undefined ? enterpriseName : updateDto.enterpriseName;
        updateData.enterpriseName = finalEnterpriseName === '' ? null : finalEnterpriseName;
        console.log('Setting enterpriseName in updateData:', updateData.enterpriseName);
      }
      
      // Set updatedBy from DTO if provided
      if (updateDto.updatedBy) {
        updateData.updatedBy = updateDto.updatedBy;
      }
      
      console.log('=== UPDATE DATA PREPARATION ===');
      console.log('DTO enterpriseId:', updateDto.enterpriseId, 'type:', typeof updateDto.enterpriseId);
      console.log('DTO enterpriseName:', updateDto.enterpriseName, 'type:', typeof updateDto.enterpriseName);
      console.log('Final enterpriseId:', enterpriseId, 'type:', typeof enterpriseId);
      console.log('Final enterpriseName:', enterpriseName, 'type:', typeof enterpriseName);
      console.log('UpdateData enterpriseId:', updateData.enterpriseId);
      console.log('UpdateData enterpriseName:', updateData.enterpriseName);
      console.log('Update data to save:', JSON.stringify(updateData, null, 2));
      console.log('Update data keys:', Object.keys(updateData));
      console.log('Updating venue with ID:', id);
      console.log('Update filter:', { _id: new ObjectId(id) });
      console.log('================================');

      // Ensure we're only updating the specific record by ID
      const updateResult = await this.venueRepo.updateOne({ _id: new ObjectId(id) }, { $set: updateData });
      console.log('Update result - matchedCount:', updateResult.matchedCount, 'modifiedCount:', updateResult.modifiedCount);
      
      if (updateResult.matchedCount === 0) {
        throw new NotFoundException('Venue not found for update');
      }
      
      if (updateResult.matchedCount > 1) {
        console.error('WARNING: Multiple venues matched the update filter! This should not happen.');
      }
      return this.findOne(id);
    } catch (error) {
      console.error('Error updating venue:', error);
      throw new BadRequestException(`Failed to update venue: ${error.message}`);
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

  /**
   * Upload image file to Supabase (similar to profile image upload)
   * @param file - Multer file object
   * @returns Promise<string> - Public URL of uploaded image
   */
  async uploadImageToSupabase(file: Express.Multer.File): Promise<string> {
    try {
      console.log('Venue image upload method called, NODE_ENV:', process.env.NODE_ENV);
      
      // Validate file object
      if (!file) {
        throw new BadRequestException('File is required');
      }
      if (!file.buffer) {
        throw new BadRequestException('File buffer is missing');
      }
      if (!file.mimetype) {
        throw new BadRequestException('File mimetype is missing');
      }
      
      // Validate file type
      const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException(`Invalid file type: ${file.mimetype}. Allowed types: PNG, JPEG, JPG`);
      }
      
      // Generate unique filename to avoid conflicts
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const originalName = file.originalname || 'venue-image';
      const fileExtension = path.extname(originalName) || '.jpg';
      const fileName = `venue_${timestamp}_${randomSuffix}${fileExtension}`;
      
      // Check if Supabase is available
      const isSupabaseAvailable = this.supabaseService?.isAvailable?.() || false;
      
      console.log('Upload configuration:', {
        isSupabaseAvailable,
        fileName,
        fileSize: file.buffer.length,
        mimetype: file.mimetype
      });
      
      // Try Supabase first (if available)
      if (isSupabaseAvailable) {
        try {
          console.log('☁️ Trying Supabase upload for venue image');
          const supabaseBuckets = ['profiles', 'uploads', 'venues'];
          
          for (const bucket of supabaseBuckets) {
            try {
              console.log(`☁️ Trying Supabase bucket: ${bucket}`);
              const uploadResult = await this.supabaseService.upload({
                filePath: `venue/${fileName}`,
                file: file.buffer,
                contentType: file.mimetype,
                bucket: bucket,
                upsert: true,
              });
              
              if (uploadResult?.publicUrl) {
                console.log(`✅ Supabase upload successful (bucket: ${bucket}):`, uploadResult.publicUrl);
                return uploadResult.publicUrl;
              }
            } catch (supabaseError: any) {
              console.error(`⚠️ Supabase bucket ${bucket} failed:`, supabaseError?.message);
              continue;
            }
          }
        } catch (supabaseError: any) {
          console.error('⚠️ Supabase upload failed:', supabaseError?.message);
        }
      }
      
      // If Supabase is not available or upload failed
      throw new BadRequestException(
        'File upload failed: Supabase is not configured or available. Please configure Supabase upload service.'
      );
      
    } catch (error: any) {
      console.error('Venue image upload error:', {
        message: error?.message,
        stack: error?.stack,
        name: error?.name
      });
      
      // If it's already a BadRequestException, re-throw it
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      // Otherwise, wrap it
      throw new BadRequestException(`File upload failed: ${error?.message || 'Unknown error'}`);
    }
  }
}
