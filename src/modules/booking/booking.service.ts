import { Injectable, BadRequestException,NotFoundException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { Booking } from './entities/booking.entity';
import { Venue } from '../venue/entity/venue.entity';
import { Vendor } from '../vendor/entity/vendor.entity';
import { VendorCategory } from '../vendor-category/entity/vendor-category.entity';
import { Event } from '@modules/event/entities/event.entity';
import { PhotographyType } from '@modules/quotation-request/entity/photography-type.entity';
import { CreateRequestBookingDto } from './dto/request/create-request-booking.dto';
import { AwsS3Service } from '@core/aws/services/aws-s3.service';
import { ConfigService } from '@nestjs/config';
import path from 'path';
import fs from 'fs';
import { EventType } from '@modules/quotation-request/entity/event-type.entity';
import { LocationService } from '@modules/location/location.service';
import { UserService } from '@modules/user/user.service';
import { CategoryPricingHelper } from '@modules/vendor/helpers/category-pricing.helper';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking, 'mongo')
    private readonly bookingRepo: MongoRepository<Booking>,
    @InjectRepository(Venue, 'mongo')
    private readonly venueRepo: MongoRepository<Venue>,
    @InjectRepository(Vendor, 'mongo')
    private readonly vendorRepo: MongoRepository<Vendor>,
    @InjectRepository(VendorCategory, 'mongo')
    private readonly categoryRepo: MongoRepository<VendorCategory>,
    @InjectRepository(Event, 'mongo')
    private readonly eventTypeRepo: MongoRepository<EventType>,
    @InjectRepository(PhotographyType, 'mongo')
    private readonly photoTypeRepo: MongoRepository<PhotographyType>,
    private readonly configService: ConfigService,
    private readonly awsS3Service: AwsS3Service,
    private readonly locationService: LocationService,
    private readonly userService: UserService,
  ) {}

  async findAllForAdmin(
    page = 1,
    limit = 10,
    search?: string,
    status?: string,
    bookingType?: 'venue' | 'vendor',
    dateFrom?: string,
    dateTo?: string,
  ): Promise<{ bookings: any[]; total: number; page: number; limit: number }> {
    try {
      const where: any = { isDeleted: false };
      
      // Add status filter
      if (status) {
        where.bookingStatus = status;
      }
      
      // Add booking type filter
      if (bookingType) {
        where.bookingType = bookingType;
      }
      
      // Add date range filter
      if (dateFrom && dateTo) {
        where.eventDate = {
          $gte: new Date(dateFrom),
          $lte: new Date(dateTo)
        };
      }

      let filteredVenueIds: string[] | undefined;
      if (search && search.trim().length > 0) {
        const regex = new RegExp(search, 'i');
        const venues = await this.venueRepo.find({
          where: {
            isDeleted: false,
            $or: [
              { title: { $regex: regex } },
              { name: { $regex: regex } },
              { 'formData.location': { $regex: regex } },
              { 'formData.address': { $regex: regex } },
              { 'formData.city': { $regex: regex } },
              { description: { $regex: regex } },
              { 'formData.description': { $regex: regex } },
            ],
          },
          select: ['id'],
        });

        const vendors = await this.vendorRepo.find({
          where: {
            isDeleted: false,
            $or: [
              { title: { $regex: regex } },
              { name: { $regex: regex } },
              { 'formData.location': { $regex: regex } },
              { 'formData.address': { $regex: regex } },
              { 'formData.city': { $regex: regex } },
              { description: { $regex: regex } },
              { 'formData.description': { $regex: regex } },
            ],
          },
          select: ['id'],
        });

        const allServiceIds = [
          ...venues.map((v) => {
            const anyVenue = v as any;
            const rawId = anyVenue._id ?? anyVenue.id ?? anyVenue.toString?.();
            return rawId ? rawId.toString() : undefined;
          }).filter((v): v is string => Boolean(v)),
          ...vendors.map((v) => {
            const anyVendor = v as any;
            const rawId = anyVendor._id ?? anyVendor.id ?? anyVendor.toString?.();
            return rawId ? rawId.toString() : undefined;
          }).filter((v): v is string => Boolean(v))
        ];

        if (allServiceIds.length === 0) {
          return { bookings: [], total: 0, page, limit };
        }

        where.$or = [
          { venueId: { $in: allServiceIds } },
          { vendorId: { $in: allServiceIds } }
        ];
      }

      const bookings = await this.bookingRepo.findAndCount({
        where,
        skip: (page - 1) * limit,
        take: limit,
        order: { createdAt: 'DESC' },
      });

      const bookingsWithVenues = await Promise.all(
        bookings[0]?.map(async (booking) => {
          let venueOrVendor = null;
          let user = null;
          
          // Fetch user information
          if ((booking as any).userId) {
            try {
              const userId = typeof (booking as any).userId === 'string' 
                ? new ObjectId((booking as any).userId) 
                : (booking as any).userId;
              user = await this.userService.findById((booking as any).userId);
            } catch (userError) {
              console.error('Error fetching user details:', userError);
            }
          }
          
          if ((booking as any).venueId) {
            try {
              const venueId =
                typeof (booking as any).venueId === 'string'
                  ? new ObjectId((booking as any).venueId)
                  : (booking as any).venueId;

              if ((booking as any).bookingType === 'venue') {
                venueOrVendor = await this.venueRepo.findOne({
                  where: { _id: venueId, isDeleted: false } as any,
                });
              } else if ((booking as any).bookingType === 'vendor') {
                venueOrVendor = await this.vendorRepo.findOne({
                  where: { _id: venueId, isDeleted: false } as any,
                });
                
                // Fetch category information for vendor pricing
                if (venueOrVendor && venueOrVendor.categoryId) {
                  try {
                    const category = await this.categoryRepo.findOneBy({ _id: new ObjectId(venueOrVendor.categoryId) });
                    if (category && !category.isDeleted) {
                      (venueOrVendor as any).categoryName = category.name;
                    }
                  } catch (error) {
                    console.log('Error fetching vendor category:', error);
                  }
                }
                
                // If vendor not found, create a fallback vendor object
                if (!venueOrVendor) {
                  venueOrVendor = {
                    id: (booking as any).venueId,
                    title: (booking as any).title || 'Unknown Vendor',
                    name: (booking as any).title || 'Unknown Vendor',
                    categoryId: (booking as any).categoryId,
                    categoryName: (booking as any).categoryType || 'PhotoGrapher',
                    price: 0,
                    formData: {
                      pricing: [],
                      address: (booking as any).venueAddress || 'Address not available',
                      location: (booking as any).venueAddress || 'Address not available',
                      city: 'City not available',
                      latitude: 0,
                      longitude: 0,
                      pinTitle: (booking as any).title || 'Unknown Vendor',
                      mapImageUrl: 'https://maps.googleapis.com/...'
                    }
                  };
                }
              } else {
                // fallback: try both
                venueOrVendor =
                  (await this.venueRepo.findOne({ where: { _id: venueId, isDeleted: false } as any } as any)) ||
                  (await this.vendorRepo.findOne({ where: { _id: venueId, isDeleted: false } as any } as any));
              }
            } catch (venueError) {
              console.error('Error fetching venue or vendor details:', venueError);
            }
          }

          // Compute structured location from locations collection by service id (venue/vendor)
          let storedLocation: any = null;
          if (venueOrVendor?.id || (venueOrVendor as any)?._id) {
            const serviceId = ((venueOrVendor as any)?._id || (venueOrVendor as any)?.id)?.toString?.();
            if (serviceId) {
              storedLocation = await this.locationService.findByServiceId(serviceId);
            }
          }

          return {
            ...booking,
            title: venueOrVendor?.title || venueOrVendor?.name || 'Unknown Venue',
            description: venueOrVendor?.description || 'No description available',
            location: {
              address: storedLocation?.address || venueOrVendor?.formData?.address || venueOrVendor?.formData?.location || 'Address not available',
              city: venueOrVendor?.formData?.city || 'City not available',
              latitude: (storedLocation?.latitude as number) ?? venueOrVendor?.formData?.latitude ?? 0,
              longitude: (storedLocation?.longitude as number) ?? venueOrVendor?.formData?.longitude ?? 0,
              pinTitle: venueOrVendor?.formData?.pinTitle || venueOrVendor?.name || venueOrVendor?.title,
              mapImageUrl: venueOrVendor?.formData?.mapImageUrl || 'https://maps.googleapis.com/...'
            },
            price: this.calculatePriceFromPricing(venueOrVendor),
            pricing: (venueOrVendor as any)?.pricing || venueOrVendor?.formData?.pricing || [], // Add pricing array from venue or formData
            status: (booking as any).bookingStatus || 'pending', // Add booking status
            rating: venueOrVendor?.averageRating || 0,
            imageUrl: venueOrVendor?.imageUrl || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb',
            reviews: venueOrVendor?.totalRatings || 0,
            // User information
            customerName: user?.firstName + ' ' + user?.lastName || 'Unknown Customer',
            customerEmail: user?.email || 'unknown@example.com',
            userName: user?.firstName + ' ' + user?.lastName || 'Unknown User',
            userEmail: user?.email || 'unknown@example.com',
            // Add missing fields for frontend compatibility
            serviceName: venueOrVendor?.title || venueOrVendor?.name || 'Unknown Service',
            startDateTime: (booking as any).eventDate || (booking as any).startTime || new Date().toISOString(),
            endDateTime: (booking as any).endDate || (booking as any).endTime || new Date().toISOString(),
            amount: this.calculatePriceFromPricing(venueOrVendor),
            bookingNumber: (booking as any).bookingId || (booking as any).id || 'Unknown'
          };
        }),
      );
      return {
        bookings: bookingsWithVenues,
        total: bookings[1] || 0,
        page,
        limit,
      };
    } catch (error) {
      console.error('Error in findAllForAdmin:', error);
      throw new BadRequestException('Failed to fetch bookings');
    }
  }

  async findAllForUser(
    page = 1,
    limit = 10,
    search?: string,
    bookingType?: 'venue' | 'vendor',
  ): Promise<{ bookings: any[]; total: number; page: number; limit: number }> {
    try {
      const where: any = { isDeleted: false };
      if (bookingType) {
        (where as any).bookingType = bookingType;
      }

      let filteredVenueIds: string[] | undefined;
      if (search && search.trim().length > 0) {
        const regex = new RegExp(search, 'i');
        const venues = await this.venueRepo.find({
          where: {
            isDeleted: false,
            $or: [
              { title: { $regex: regex } },
              { name: { $regex: regex } },
              { 'formData.location': { $regex: regex } },
              { 'formData.address': { $regex: regex } },
              { 'formData.city': { $regex: regex } },
              { description: { $regex: regex } },
              { 'formData.description': { $regex: regex } },
            ],
          },
          select: ['id'],
        });

        filteredVenueIds = venues
          .map((v) => {
            const anyVenue = v as any;
            const rawId = anyVenue._id ?? anyVenue.id ?? anyVenue.toString?.();
            return rawId ? rawId.toString() : undefined;
          })
          .filter((v): v is string => Boolean(v));

        if (filteredVenueIds.length === 0) {
          return { bookings: [], total: 0, page, limit };
        }

        (where as any).venueId = { $in: filteredVenueIds };
      }

      const bookings = await this.bookingRepo.findAndCount({
        where,
        skip: (page - 1) * limit,
        take: limit,
        order: { createdAt: 'DESC' },
      });

      const bookingsWithVenues = await Promise.all(
        bookings[0]?.map(async (booking) => {
          let venueOrVendor = null;
          let user = null;
          
          // Fetch user information
          if ((booking as any).userId) {
            try {
              const userId = typeof (booking as any).userId === 'string' 
                ? new ObjectId((booking as any).userId) 
                : (booking as any).userId;
              user = await this.userService.findById((booking as any).userId);
            } catch (userError) {
              console.error('Error fetching user details:', userError);
            }
          }
          
          if ((booking as any).venueId) {
            try {
              const venueId =
                typeof (booking as any).venueId === 'string'
                  ? new ObjectId((booking as any).venueId)
                  : (booking as any).venueId;

              if ((booking as any).bookingType === 'venue') {
                venueOrVendor = await this.venueRepo.findOne({
                  where: { _id: venueId, isDeleted: false } as any,
                });
                
                // Apply the same pricing transformation as venue service
                if (venueOrVendor) {
                  // Get category information for pricing generation
                  let categoryName = 'General Venue';
                  if (venueOrVendor.categoryId && ObjectId.isValid(venueOrVendor.categoryId)) {
                    try {
                      const category = await this.categoryRepo.findOneBy({ _id: new ObjectId(venueOrVendor.categoryId) });
                      if (category && !category.isDeleted) {
                        categoryName = category.name;
                      }
                    } catch (error) {
                      console.log('Category lookup failed, using default category name');
                    }
                  }

                  // Generate category-specific pricing
                  const categoryPricing = CategoryPricingHelper.generateCategoryPricing(categoryName);
                  
                  // Add pricing to venue object
                  (venueOrVendor as any).pricing = venueOrVendor.formData?.pricing || categoryPricing;
                }
              } else if ((booking as any).bookingType === 'vendor') {
                console.log('Querying vendor with venueId:', venueId);
                venueOrVendor = await this.vendorRepo.findOne({
                  where: { _id: venueId, isDeleted: false } as any,
                });
                
                // Debug vendor data
                console.log('Fetched vendor data:', {
                  id: venueOrVendor?.id,
                  name: venueOrVendor?.name,
                  title: venueOrVendor?.title,
                  price: venueOrVendor?.price,
                  categoryId: venueOrVendor?.categoryId,
                  formData: venueOrVendor?.formData
                });
                
                if (!venueOrVendor) {
                  console.log('Vendor not found in database for venueId:', venueId);
                }
                
                // Fetch category information for vendor pricing
                if (venueOrVendor && venueOrVendor.categoryId) {
                  try {
                    const category = await this.categoryRepo.findOneBy({ _id: new ObjectId(venueOrVendor.categoryId) });
                    if (category && !category.isDeleted) {
                      (venueOrVendor as any).categoryName = category.name;
                      console.log('Vendor category:', category.name);
                    }
                  } catch (error) {
                    console.log('Error fetching vendor category:', error);
                  }
                }
                
                // If vendor not found, create a fallback vendor object
                if (!venueOrVendor) {
                  venueOrVendor = {
                    id: (booking as any).venueId,
                    title: (booking as any).title || 'Unknown Vendor',
                    name: (booking as any).title || 'Unknown Vendor',
                    categoryId: (booking as any).categoryId,
                    categoryName: (booking as any).categoryType || 'PhotoGrapher',
                    price: 0,
                    formData: {
                      pricing: [],
                      address: (booking as any).venueAddress || 'Address not available',
                      location: (booking as any).venueAddress || 'Address not available',
                      city: 'City not available',
                      latitude: 0,
                      longitude: 0,
                      pinTitle: (booking as any).title || 'Unknown Vendor',
                      mapImageUrl: 'https://maps.googleapis.com/...'
                    }
                  };
                }
              } else {
                // fallback: try both
                venueOrVendor =
                  (await this.venueRepo.findOne({ where: { _id: venueId, isDeleted: false } as any } as any)) ||
                  (await this.vendorRepo.findOne({ where: { _id: venueId, isDeleted: false } as any } as any));
              }
            } catch (venueError) {
              console.error('Error fetching venue or vender details:', venueError);
            }
          }

          // Compute structured location from locations collection by service id (venue/vendor)
          let storedLocation: any = null;
          if (venueOrVendor?.id || (venueOrVendor as any)?._id) {
            const serviceId = ((venueOrVendor as any)?._id || (venueOrVendor as any)?.id)?.toString?.();
            if (serviceId) {
              storedLocation = await this.locationService.findByServiceId(serviceId);
            }
          }

          return {
            ...booking,
            title: venueOrVendor?.title || venueOrVendor?.name || 'Unknown Venue',
            description: venueOrVendor?.description || 'No description available',
            location: {
              address: storedLocation?.address || venueOrVendor?.formData?.address || venueOrVendor?.formData?.location || 'Address not available',
              city: venueOrVendor?.formData?.city || 'City not available',
              latitude: (storedLocation?.latitude as number) ?? venueOrVendor?.formData?.latitude ?? 0,
              longitude: (storedLocation?.longitude as number) ?? venueOrVendor?.formData?.longitude ?? 0,
              pinTitle: venueOrVendor?.formData?.pinTitle || venueOrVendor?.name || venueOrVendor?.title,
              mapImageUrl: venueOrVendor?.formData?.mapImageUrl || 'https://maps.googleapis.com/...'
            },
            price: this.calculatePriceFromPricing(venueOrVendor),
            pricing: (venueOrVendor as any)?.pricing || venueOrVendor?.formData?.pricing || [], // Add pricing array from venue or formData
            status: (booking as any).bookingStatus || 'pending', // Add booking status
            rating: venueOrVendor?.averageRating || 0,
            imageUrl: venueOrVendor?.imageUrl || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb',
            reviews: venueOrVendor?.totalRatings || 0,
            // Add missing fields for frontend compatibility
            customerName: user?.firstName + ' ' + user?.lastName || 'Unknown Customer',
            customerEmail: user?.email || 'unknown@example.com',
            serviceName: venueOrVendor?.title || venueOrVendor?.name || 'Unknown Service',
            startDateTime: (booking as any).eventDate || (booking as any).startTime || new Date().toISOString(),
            endDateTime: (booking as any).endDate || (booking as any).endTime || new Date().toISOString(),
            amount: this.calculatePriceFromPricing(venueOrVendor),
            bookingNumber: (booking as any).bookingId || (booking as any).id || 'Unknown',
            // User information
            userName: user?.firstName + ' ' + user?.lastName || 'Unknown User',
            userEmail: user?.email || 'unknown@example.com'
          };
        }),
      );
      return {
        bookings: bookingsWithVenues,
        total: bookings[1] || 0,
        page,
        limit,
      };
    } catch (error) {
      console.error('Error in findAllForUser:', error);
      throw new BadRequestException('Failed to fetch bookings');
    }
  }

  async findByBookingId(bookingId: string, userId?: string): Promise<any> {
    const booking = await this.bookingRepo.findOne({ where: { bookingId } as any } as any);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    
    // Debug logging to understand the issue
    console.log('findByBookingId - User ID from token:', userId);
    console.log('findByBookingId - Booking user ID:', (booking as any).userId);
    console.log('findByBookingId - User ID type:', typeof userId);
    console.log('findByBookingId - Booking user ID type:', typeof (booking as any).userId);
    
    if (userId && (booking as any).userId) {
      // Convert both to strings for comparison
      const tokenUserId = String(userId);
      const bookingUserId = String((booking as any).userId);
      
      console.log('findByBookingId - Token user ID (string):', tokenUserId);
      console.log('findByBookingId - Booking user ID (string):', bookingUserId);
      console.log('findByBookingId - IDs match:', tokenUserId === bookingUserId);
      
      if (tokenUserId !== bookingUserId) {
      throw new BadRequestException('You can only view your own bookings');
      }
    }

    let venue = null;
    let vendor = null;
    let event = null;
    let photographyType = null;
    let venueOrVenderInfo = null;
    
    try {
      if ((booking as any).venueId) {
        const venueId = typeof (booking as any).venueId === 'string'
          ? new ObjectId((booking as any).venueId)
          : (booking as any).venueId;
        
        // Try to find in venues first
        venue = await this.venueRepo.findOne({ where: { _id: venueId, isDeleted: false } as any } as any);
        
        // If not found in venues, try vendors
        if (!venue) {
          vendor = await this.vendorRepo.findOne({ where: { _id: venueId, isDeleted: false } as any } as any);
        }
        
        // Create venueOrVenderInfo based on what we found
        const venueOrVendor = venue || vendor;
        if (venueOrVendor) {
          const serviceId = ((venueOrVendor as any)?._id || (venueOrVendor as any)?.id)?.toString?.();
          const storedLocation = serviceId ? await this.locationService.findByServiceId(serviceId) : null;
          venueOrVenderInfo = {
            title: venueOrVendor.title || venueOrVendor.name || 'Unknown',
            location: {
              address: storedLocation?.address || venueOrVendor.formData?.address || venueOrVendor.formData?.location || 'Address not available',
              city: venueOrVendor.formData?.city || 'City not available',
              latitude: (storedLocation?.latitude as number) ?? venueOrVendor?.formData?.latitude ?? 0,
              longitude: (storedLocation?.longitude as number) ?? venueOrVendor?.formData?.longitude ?? 0,
              pinTitle: venueOrVendor.formData?.pinTitle || venueOrVendor.name || venueOrVendor.title,
              mapImageUrl: venueOrVendor.formData?.mapImageUrl || 'https://maps.googleapis.com/...'
            },
            description: venueOrVendor.description || venueOrVendor.formData?.description || 'No description available',
            price: venueOrVendor.price || 0,
            imagePath: venueOrVendor.imageUrl || 'https://t3.ftcdn.net/jpg/05/06/74/32/360_F_506743235_coW6QAlhxlBWjnRk0VNsHqaXGGH9F4JS.jpg',
            rating: venueOrVendor.averageRating || 5,
            reviews: venueOrVendor.totalRatings || 0,
            ratingLabel: this.getRatingLabel(venueOrVendor.averageRating || 4.4)
          };
        }
      }
      
      if ((booking as any).eventId) {
        const eventId = typeof (booking as any).eventId === 'string'
          ? new ObjectId((booking as any).eventId)
          : (booking as any).eventId;
        event = await this.eventTypeRepo.findOne({ where: { _id: eventId, isDeleted: false } as any } as any);
      }
      
      if ((booking as any).photographersId) {
        const photoId = typeof (booking as any).photographersId === 'string'
          ? new ObjectId((booking as any).photographersId)
          : (booking as any).photographersId;
        photographyType = await this.photoTypeRepo.findOne({ where: { _id: photoId, isDeleted: false } as any } as any);
      }
    } catch (err) {
      console.error('Error fetching venue for bookingId:', bookingId, err);
    }

    const bookingData = {
      ...booking,
      status: (booking as any).bookingStatus || 'pending',
      categoryType: (booking as any).categoryType || null,
      venue,
      vendor,
      event,
      photographyType,
      venueOrVenderInfo
    };

    return bookingData;
  }

  async createRequestBooking(dto: CreateRequestBookingDto, userId: string): Promise<Booking> {
    if (!dto.bookingType) {
      throw new BadRequestException('bookingType is required');
    }
    
    // Ensure userId is a string
    const userIdString = String(userId);
    console.log('Booking Service - User ID:', userIdString, 'Type:', typeof userIdString);
    
    let uploadedImageUrls: string[] = [];
    if (dto.referenceImages?.length) {
      uploadedImageUrls = await this.uploadBase64Images(dto.referenceImages);
    }

    const entity = this.bookingRepo.create({
      ...dto,
      userId: userIdString, // Explicitly set as string
      referenceImages: uploadedImageUrls,
      eventDate: dto.eventDate,
      endDate: dto.endDate
    });
    
    console.log('Booking Service - Created entity userId:', entity.userId, 'Type:', typeof entity.userId);
    const savedEntity = await this.bookingRepo.save(entity);
    console.log('Booking Service - Saved entity userId:', (savedEntity as any).userId, 'Type:', typeof (savedEntity as any).userId);
    
    return savedEntity;
  }

  async updateBooking(bookingId: string, dto: any, userId: string): Promise<any> {
    const booking = await this.bookingRepo.findOne({ where: { bookingId } as any } as any);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    if ((booking as any).userId !== userId) {
      throw new BadRequestException('You can only update your own bookings');
    }
    let uploadedImageUrls: string[] = [];
    if (dto.referenceImages?.length) {
      uploadedImageUrls = await this.uploadBase64Images(dto.referenceImages);
    }

    const updateData: any = { ...dto };
    // if (dto.eventDate) {
    //   const eventDateStr = dto.eventDate.replace(' 00:00:00.000', ''); 
    //   updateData.eventDate = new Date(eventDateStr);
    // }
    // if (dto.endDate) {
    //   const endDateStr = dto.endDate.replace(' 00:00:00.000', '');
    //   updateData.endDate = new Date(endDateStr);
    // }
    if (uploadedImageUrls.length > 0) {
      updateData.referenceImages = uploadedImageUrls;
    }
    delete updateData.bookingId;
    await this.bookingRepo.updateOne(
      { bookingId: bookingId },
      { $set: updateData }
    );
    return await this.findByBookingId(bookingId);
  }

  private async uploadBase64Images(base64Images: string[]): Promise<string[]> {
    const uploadedUrls: string[] = [];
    const awsConfig = this.configService.get('aws');
    for (const base64Image of base64Images) {
      if (!base64Image) continue;
      const matches = base64Image.match(/^data:image\/(png|jpeg|jpg);base64,(.+)$/);
      if (!matches) {
        throw new BadRequestException('Invalid base64 image format');
      }
      const ext = matches[1];
      const base64Data = matches[2];
      const buffer = Buffer.from(base64Data, 'base64');
      const mimetype = `image/${ext}`;
      const timestamp = Date.now();
      const fileName = `request_booking_${timestamp}_${Math.random()
        .toString(36)
        .substring(7)}.${ext}`;

      let imageUrl = '';
      if (process.env.NODE_ENV === 'local') {
        const rootDir = path.resolve(__dirname, '..', '..', '..');
        const dir = path.join(rootDir, 'uploads', 'quotation');
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        const filePath = path.join(dir, fileName);
        fs.writeFileSync(filePath, buffer);
        imageUrl = `/uploads/quotation/${fileName}`;
      } else {
        const awsUploadReqDto = {
          Bucket: awsConfig.bucketName,
          Key: awsConfig.bucketFolderName + '/' + 'quotation' + '/' + fileName,
          Body: buffer,
          ContentType: mimetype,
        } as any;
        const response = await this.awsS3Service.uploadFilesToS3Bucket(awsUploadReqDto);
        imageUrl = (response as any)?.Location || '';
      }
      uploadedUrls.push(imageUrl);
    }
    return uploadedUrls;
  }

  async cancelBooking(bookingId: string, dto: any, userId: string): Promise<any> {
    const booking = await this.bookingRepo.findOne({ where: { bookingId } as any } as any);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    
    console.log('Cancel Booking - User ID from token:', userId, 'Type:', typeof userId);
    console.log('Cancel Booking - Booking user ID:', (booking as any).userId, 'Type:', typeof (booking as any).userId);
    
    // Convert both to strings for comparison
    const tokenUserId = String(userId);
    const bookingUserId = String((booking as any).userId);
    
    console.log('Cancel Booking - Token user ID (string):', tokenUserId);
    console.log('Cancel Booking - Booking user ID (string):', bookingUserId);
    console.log('Cancel Booking - IDs match:', tokenUserId === bookingUserId);
    
    if (tokenUserId !== bookingUserId) {
      throw new BadRequestException('You can only cancel your own bookings');
    }
    
    // Check if booking can be cancelled
    const currentStatus = (booking as any).bookingStatus;
    if (currentStatus === 'CANCELLED') {
      throw new BadRequestException('Booking is already cancelled');
    }
    if (currentStatus === 'COMPLETED') {
      throw new BadRequestException('Cannot cancel a completed booking');
    }
    if (currentStatus === 'REJECTED') {
      throw new BadRequestException('Cannot cancel a rejected booking');
    }

    // Update booking status to cancelled
    const updateData = {
      bookingStatus: 'CANCELLED',
      cancellationReason: dto.cancellationReason,
      cancellationDate: new Date(),
      notes: dto.notes || null,
    };

    await this.bookingRepo.updateOne(
      { bookingId: bookingId },
      { $set: updateData }
    );

    // Return updated booking
    return await this.findByBookingId(bookingId, userId);
  }

  private getRatingLabel(rating: number): string {
    if (rating >= 4.5) return 'superb';
    if (rating >= 4.0) return 'excellent';
    if (rating >= 3.5) return 'very good';
    if (rating >= 3.0) return 'good';
    if (rating >= 2.5) return 'average';
    return 'below average';
  }

  private calculatePriceFromPricing(venueOrVendor: any): number {
    // Debug logging
    console.log('calculatePriceFromPricing - venueOrVendor:', {
      id: venueOrVendor?.id,
      title: venueOrVendor?.title,
      name: venueOrVendor?.name,
      price: venueOrVendor?.price,
      priceType: typeof venueOrVendor?.price,
      formDataPrice: venueOrVendor?.formData?.price,
      categoryId: venueOrVendor?.categoryId,
      categoryName: venueOrVendor?.categoryName
    });

    // First try to get price from direct fields (check for any positive number, not just > 0)
    if (venueOrVendor?.price !== undefined && venueOrVendor?.price !== null && venueOrVendor.price >= 0) {
      console.log('Using direct price:', venueOrVendor.price);
      return venueOrVendor.price;
    }
    
    if (venueOrVendor?.formData?.price !== undefined && venueOrVendor?.formData?.price !== null && venueOrVendor.formData.price >= 0) {
      console.log('Using formData price:', venueOrVendor.formData.price);
      return venueOrVendor.formData.price;
    }

    // Try to get price from formData.fields.Price (for vendors with dynamic form data)
    if (venueOrVendor?.formData?.fields?.Price) {
      const fieldsPrice = parseInt(venueOrVendor.formData.fields.Price);
      if (!isNaN(fieldsPrice) && fieldsPrice > 0) {
        console.log('Using formData.fields.Price:', fieldsPrice);
        return fieldsPrice;
      }
    }

    // If no direct price, calculate from pricing array
    const pricingArray = (venueOrVendor as any)?.pricing || venueOrVendor?.formData?.pricing;
    if (pricingArray && Array.isArray(pricingArray)) {
      if (pricingArray.length > 0) {
        // Calculate average price from all pricing items
        const totalPrice = pricingArray.reduce((sum: number, item: any) => sum + (item.price || 0), 0);
        const averagePrice = totalPrice / pricingArray.length;
        return Math.round(averagePrice);
      }
    }

    // If no pricing data, try to get category and generate pricing
    if (venueOrVendor?.categoryId || venueOrVendor?.categoryName) {
      try {
        // Generate category-specific pricing using the helper
        const categoryName = venueOrVendor?.categoryName || 'PhotoGrapher';
        console.log('Using category-based pricing for:', categoryName);
        const categoryPricing = CategoryPricingHelper.generateCategoryPricing(categoryName);
        if (categoryPricing.length > 0) {
          // Return the first pricing item's price as the base price
          console.log('Category pricing result:', categoryPricing[0].price);
          return categoryPricing[0].price || 0;
        }
      } catch (error) {
        console.log('Error calculating price from category:', error);
      }
    }

    // Default fallback based on entity type
    if (venueOrVendor?.title?.toLowerCase().includes('venue') || venueOrVendor?.name?.toLowerCase().includes('venue')) {
      console.log('Using default venue price: 50000');
      return 50000; // Default venue price
    } else if (venueOrVendor?.title?.toLowerCase().includes('photographer') || venueOrVendor?.name?.toLowerCase().includes('photographer')) {
      console.log('Using default photographer price: 15000');
      return 15000; // Default photographer price
    } else if (venueOrVendor?.title?.toLowerCase().includes('catering') || venueOrVendor?.name?.toLowerCase().includes('catering')) {
      console.log('Using default catering price: 5000');
      return 5000; // Default catering price
    }

    // Final fallback
    console.log('Using final fallback price: 15000');
    return 15000;
  }
}
