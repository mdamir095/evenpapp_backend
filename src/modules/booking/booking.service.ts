import { Injectable, BadRequestException, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { Booking } from './entities/booking.entity';
import { VendorOffer, OfferStatus } from './entities/vendor-offer.entity';
import { AdminOffer, AdminOfferStatus } from './entities/admin-offer.entity';
import { Offer, OfferStatus as UnifiedOfferStatus } from './entities/offer.entity';
import { Venue } from '../venue/entity/venue.entity';
import { Vendor } from '../vendor/entity/vendor.entity';
import { VendorCategory } from '../vendor-category/entity/vendor-category.entity';
import { Event } from '@modules/event/entities/event.entity';
import { PhotographyType } from '@modules/quotation-request/entity/photography-type.entity';
import { CreateRequestBookingDto } from './dto/request/create-request-booking.dto';
import { CreateVendorOfferDto } from './dto/offer/create-vendor-offer.dto';
import { CreateAdminOfferDto } from './dto/offer/create-admin-offer.dto';
import { CreateOfferDto } from './dto/offer/create-offer.dto';
import { AwsS3Service } from '@core/aws/services/aws-s3.service';
import { ConfigService } from '@nestjs/config';
import path from 'path';
import fs from 'fs';
import { EventType } from '@modules/quotation-request/entity/event-type.entity';
import { LocationService } from '@modules/location/location.service';
import { UserService } from '@modules/user/user.service';
import { CategoryPricingHelper } from '@modules/vendor/helpers/category-pricing.helper';
import { SupabaseService } from '@shared/modules/supabase/supabase.service';
import { BookingStatus } from '@shared/enums/bookingStatus';
import { ChatService } from '@modules/chat/chat.service';
import { NotificationService } from '@modules/notification/notification.service';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking, 'mongo')
    private readonly bookingRepo: MongoRepository<Booking>,
    @InjectRepository(VendorOffer, 'mongo')
    private readonly vendorOfferRepo: MongoRepository<VendorOffer>,
    @InjectRepository(AdminOffer, 'mongo')
    private readonly adminOfferRepo: MongoRepository<AdminOffer>,
    @InjectRepository(Offer, 'mongo')
    private readonly offerRepo: MongoRepository<Offer>,
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
    private readonly supabaseService: SupabaseService,
    @Inject(forwardRef(() => ChatService))
    private readonly chatService: ChatService,
    private readonly notificationService: NotificationService,
  ) {}

  async findAllForAdmin(
    page = 1,
    limit = 10,
    search?: string,
    status?: string | string[],
    bookingType?: 'venue' | 'vendor',
    dateFrom?: string,
    dateTo?: string,
    authenticatedUserId?: string,
  ): Promise<{ bookings: any[]; total: number; page: number; limit: number }> {
    try {
      // Build conditions array to ensure all filters are properly combined with $and
      const andConditions: any[] = [
        { isDeleted: false } // Always include isDeleted check
      ];
      
      // Add status filter - support both single status and array of statuses
      if (status) {
        let statusArray: string[] = [];
        
        // Handle both string and array inputs
        if (Array.isArray(status)) {
          statusArray = status.filter(s => s && s.trim());
        } else if (typeof status === 'string' && status.trim()) {
          statusArray = [status.trim()];
        }
        
        if (statusArray.length > 0) {
          // Normalize all statuses to lowercase and map to enum values
          const normalizedStatuses = statusArray.map(s => s.toLowerCase().trim());
          console.log(`Booking findAllForAdmin - Normalized statuses:`, normalizedStatuses);
          
          // Build status filter - support multiple statuses
          const statusConditions: any[] = [];
          
          normalizedStatuses.forEach(normalizedStatus => {
            if (normalizedStatus === 'pending') {
              // For pending, we need to match: 'pending', null, or missing field
              statusConditions.push(
                { bookingStatus: BookingStatus.PENDING },
                { bookingStatus: 'pending' },
                { bookingStatus: null },
                { bookingStatus: { $exists: false } }
              );
            } else {
              // Map to enum value - try lowercase first, then uppercase for backward compatibility
              const enumValue = normalizedStatus as BookingStatus;
              // Try multiple formats: enum value, lowercase string, and uppercase string (for backward compatibility)
              statusConditions.push(
                { bookingStatus: enumValue },
                { bookingStatus: normalizedStatus },
                { bookingStatus: normalizedStatus.toUpperCase() }
              );
            }
          });
          
          // If we have multiple conditions (either from multiple statuses or multiple format attempts),
          // wrap them in $or. If single condition, use directly.
          if (statusConditions.length === 1) {
            andConditions.push(statusConditions[0]);
            console.log(`Booking findAllForAdmin - Single status condition:`, JSON.stringify(statusConditions[0], null, 2));
          } else if (statusConditions.length > 1) {
            // Wrap all status conditions in $or since we're trying multiple formats
            andConditions.push({ $or: statusConditions });
            console.log(`Booking findAllForAdmin - Multiple status conditions with $or (${statusConditions.length} conditions):`, JSON.stringify({ $or: statusConditions }, null, 2));
          }
        }
      }
      
      // Add booking type filter
      if (bookingType) {
        andConditions.push({ bookingType: bookingType });
      }
      
      // Add date range filter
      if (dateFrom && dateTo) {
        andConditions.push({
          eventDate: {
            $gte: new Date(dateFrom),
            $lte: new Date(dateTo)
          }
        });
      }

      // Build final where clause
      // Always use $and for consistency and to ensure proper filtering
      let where: any;
      if (andConditions.length === 1) {
        where = andConditions[0];
      } else {
        // Use $and for all queries with multiple conditions
        where = { $and: andConditions };
      }

      console.log('Booking findAllForAdmin - Initial where clause:', JSON.stringify(where, null, 2));
      console.log('Booking findAllForAdmin - Number of andConditions:', andConditions.length);
      console.log('Booking findAllForAdmin - andConditions:', JSON.stringify(andConditions, null, 2));

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

        // Add search filter (venue/vendor IDs) to existing conditions
        andConditions.push({
          $or: [
            { venueId: { $in: allServiceIds } },
            { vendorId: { $in: allServiceIds } }
          ]
        });
        
        // Rebuild where with $and to include search filter
        where = { $and: andConditions };
      }

      console.log('Booking findAllForAdmin - Final where clause:', JSON.stringify(where, null, 2));

      // Debug: Check what statuses exist in the database
      if (status) {
        try {
          // Get all unique statuses in the database
          const allBookings = await this.bookingRepo.find({
            where: { isDeleted: false } as any,
            take: 100,
            select: ['bookingStatus', 'bookingId']
          });
          
          const uniqueStatuses = [...new Set(allBookings.map((b: any) => b.bookingStatus))];
          console.log('Booking findAllForAdmin - All unique statuses found in DB:', uniqueStatuses);
          console.log('Booking findAllForAdmin - Sample booking statuses from DB:', 
            allBookings.slice(0, 10).map((b: any) => ({ 
              bookingId: b.bookingId, 
              status: b.bookingStatus, 
              statusType: typeof b.bookingStatus,
              statusValue: JSON.stringify(b.bookingStatus)
            }))
          );
          
          // Count bookings by status
          const statusCounts: Record<string, number> = {};
          allBookings.forEach((b: any) => {
            const stat = b.bookingStatus || 'null/undefined';
            statusCounts[stat] = (statusCounts[stat] || 0) + 1;
          });
          console.log('Booking findAllForAdmin - Status counts:', statusCounts);
          
          // Test query with COMPLETED status directly
          const completedTest = await this.bookingRepo.find({
            where: { 
              isDeleted: false,
              bookingStatus: 'completed'
            } as any,
            take: 5
          });
          console.log(`Booking findAllForAdmin - Direct COMPLETED query found ${completedTest.length} bookings`);
          
          // Test query with case-insensitive
          const completedTestLower = await this.bookingRepo.find({
            where: { 
              isDeleted: false,
              bookingStatus: 'completed'
            } as any,
            take: 5
          });
          console.log(`Booking findAllForAdmin - Direct 'completed' (lowercase) query found ${completedTestLower.length} bookings`);
        } catch (debugError) {
          console.error('Booking findAllForAdmin - Error checking sample bookings:', debugError);
        }
      }

      let bookings: [any[], number];
      try {
        // First, let's test the count separately to debug
        const testCount = await this.bookingRepo.count({ where } as any);
        console.log(`Booking findAllForAdmin - Test count query result: ${testCount}`);
        
        bookings = await this.bookingRepo.findAndCount({
          where,
          skip: (page - 1) * limit,
          take: limit,
          order: { createdAt: 'DESC' },
        });
        console.log(`Booking findAllForAdmin - Query executed successfully. Found ${bookings[1]} bookings (findAndCount)`);
        console.log(`Booking findAllForAdmin - Counts match: ${testCount === bookings[1] ? 'YES' : 'NO'} (test: ${testCount}, findAndCount: ${bookings[1]})`);
      } catch (error) {
        console.error('Booking findAllForAdmin - Query error:', error);
        console.error('Booking findAllForAdmin - Error details:', JSON.stringify(error, null, 2));
        throw error;
      }

      // Debug: Log booking statuses to see what's in the database
      if (status) {
        console.log(`Booking findAllForAdmin - Found ${bookings[1]} bookings with status filter: ${status}`);
        if (bookings[0]?.length > 0) {
          console.log('Booking findAllForAdmin - Sample booking status:', (bookings[0][0] as any)?.bookingStatus);
          console.log('Booking findAllForAdmin - Sample booking data:', JSON.stringify((bookings[0][0] as any), null, 2));
        } else {
          // Check all bookings to see what statuses exist
          try {
            const allBookings = await this.bookingRepo.find({
              where: { isDeleted: false },
              take: 5,
              select: ['bookingStatus']
            });
            console.log('Booking findAllForAdmin - Sample booking statuses in DB:', allBookings.map((b: any) => b.bookingStatus));
            console.log('Booking findAllForAdmin - Total bookings in DB:', await this.bookingRepo.count({ where: { isDeleted: false } }));
          } catch (countError) {
            console.error('Booking findAllForAdmin - Error checking DB statuses:', countError);
          }
        }
      }

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

          // Check if current authenticated user has submitted an offer for this booking
          let userHasSubmittedOffer = false;
          let userOfferStatus: string | null = null;
          if (authenticatedUserId) {
            try {
              const actualBookingId = (booking as any).bookingId || (booking as any).id;
              
              // Check unified offers
              const userUnifiedOffer = await this.offerRepo.findOne({
                where: {
                  bookingId: actualBookingId,
                  userId: authenticatedUserId,
                  status: { $ne: UnifiedOfferStatus.REJECTED } as any,
                } as any,
              });
              
              // Check vendor offers (if userId matches vendorId)
              const userVendorOffer = await this.vendorOfferRepo.findOne({
                where: {
                  bookingId: actualBookingId,
                  vendorId: authenticatedUserId,
                  status: { $ne: OfferStatus.REJECTED } as any,
                } as any,
              });
              
              // Check admin offers
              const userAdminOffer = await this.adminOfferRepo.findOne({
                where: {
                  bookingId: actualBookingId,
                  userId: authenticatedUserId,
                  status: { $ne: AdminOfferStatus.REJECTED } as any,
                } as any,
              });
              
              const userOffer = userUnifiedOffer || userVendorOffer || userAdminOffer;
              if (userOffer) {
                userHasSubmittedOffer = true;
                userOfferStatus = (userOffer as any).status || 'pending';
              }
            } catch (error) {
              console.error('Error checking if user has submitted offer:', error);
            }
          }

          // Determine offer status: "done" if user has submitted offer, "no offer" otherwise
          const offerStatus = userHasSubmittedOffer ? 'done' : 'no offer';

          // Dynamically check if offers exist for this booking (more reliable than stored flag)
          const actualBookingId = (booking as any).bookingId || (booking as any).id;
          let hasOffers = false;
          try {
            // Use find().length instead of count() for better MongoDB compatibility
            const unifiedOffers = await this.offerRepo.find({
              where: { bookingId: actualBookingId } as any,
            });
            const unifiedOfferCount = unifiedOffers?.length || 0;
            
            const vendorOffers = await this.vendorOfferRepo.find({
              where: { bookingId: actualBookingId } as any,
            });
            const vendorOfferCount = vendorOffers?.length || 0;
            
            const adminOffers = await this.adminOfferRepo.find({
              where: { bookingId: actualBookingId } as any,
            });
            const adminOfferCount = adminOffers?.length || 0;
            
            hasOffers = unifiedOfferCount > 0 || vendorOfferCount > 0 || adminOfferCount > 0;
            
            // Log for debugging
            if (actualBookingId === 'BK-3B13AEE7') {
              console.log(`[DEBUG] Booking ${actualBookingId} - Unified: ${unifiedOfferCount}, Vendor: ${vendorOfferCount}, Admin: ${adminOfferCount}, hasOffers: ${hasOffers}`);
            }
            
            // Update the stored flag if it's different (async, don't wait)
            const storedHasOffers = (booking as any).hasOffers ?? false;
            if (storedHasOffers !== hasOffers) {
              console.log(`Updating hasOffers flag for booking ${actualBookingId}: ${storedHasOffers} -> ${hasOffers}`);
              // Update asynchronously without blocking the response
              this.updateBookingHasOffersFlag(actualBookingId).catch(err => {
                console.error('Error updating hasOffers flag:', err);
              });
            }
          } catch (error) {
            console.error(`Error checking offers count for booking ${actualBookingId}:`, error);
            // Fallback to stored value if query fails
            hasOffers = (booking as any).hasOffers ?? false;
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
            imageUrl: venueOrVendor?.imageUrl || '',
            reviews: venueOrVendor?.totalRatings || 0,
            hasOffers: hasOffers, // Dynamically calculated hasOffers flag
            userHasSubmittedOffer: userHasSubmittedOffer, // Whether current user has submitted an offer
            userOfferStatus: userOfferStatus, // Status of user's offer (pending, accepted, rejected) or null
            offerStatus: offerStatus, // Simple offer status: "done" if user submitted offer, "no offer" otherwise
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
      
      const finalTotal = bookings[1] || 0;
      console.log(`Booking findAllForAdmin - Final return: total=${finalTotal}, bookings.length=${bookingsWithVenues.length}, page=${page}, limit=${limit}`);
      
      return {
        bookings: bookingsWithVenues,
        total: finalTotal,
        page,
        limit,
      };
    } catch (error) {
      console.error('Error in findAllForAdmin:', error);
      throw new BadRequestException('Failed to fetch bookings');
    }
  }

  async findAllForUser(
    userId: string,
    page = 1,
    limit = 10,
    search?: string,
    bookingType?: 'venue' | 'vendor',
  ): Promise<{ bookings: any[]; total: number; page: number; limit: number }> {
    try {
      console.log('findAllForUser - Filtering bookings for userId:', userId, 'Type:', typeof userId);
      
      // Filter bookings by userId - users should only see their own bookings
      const where: any = { 
        isDeleted: false,
        userId: userId // Filter by logged-in user's ID
      };
      
      if (bookingType) {
        (where as any).bookingType = bookingType;
      }
      
      console.log('findAllForUser - Query where clause:', JSON.stringify(where, null, 2));

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

      // Fetch all bookings matching the query (without pagination)
      // We'll filter by price after extracting it from formData, then apply pagination
      const allBookings = await this.bookingRepo.find({
        where,
        order: { createdAt: 'DESC' },
      });

      console.log('findAllForUser - Total bookings found:', allBookings.length);

      // Helper function to extract price from formData (for vendors, matches vendor service logic)
      // Priority: formData.fields (field name is "price") > vendor.price > formData.price > other formData locations
      const extractPriceFromFormData = (venueOrVendor: any): number => {
        if (!venueOrVendor) {
          console.log('extractPriceFromFormData: venueOrVendor is null/undefined');
          return 0;
        }
        
        // Debug logging
        console.log('extractPriceFromFormData - vendor data:', {
          id: venueOrVendor.id,
          name: venueOrVendor.name,
          price: venueOrVendor.price,
          formDataPrice: venueOrVendor.formData?.price,
          hasFormDataFields: !!venueOrVendor.formData?.fields,
          isFieldsArray: Array.isArray(venueOrVendor.formData?.fields),
          fieldsLength: Array.isArray(venueOrVendor.formData?.fields) ? venueOrVendor.formData.fields.length : 0
        });
        
        // PRIORITY 1: Check formData.fields array for field with name exactly "price" (case-insensitive)
        if (venueOrVendor.formData?.fields && Array.isArray(venueOrVendor.formData.fields)) {
          // First, try to find field with name exactly "price" (case-insensitive)
          const priceField = venueOrVendor.formData.fields.find((field: any) => {
            const fieldName = field?.name?.toLowerCase() || '';
            const isExactPriceField = fieldName === 'price';
            const hasActualValue = field?.actualValue !== undefined && field?.actualValue !== null && field?.actualValue !== '';
            return isExactPriceField && hasActualValue;
          });
          
          if (priceField && priceField.actualValue !== undefined && priceField.actualValue !== null) {
            const priceValue = typeof priceField.actualValue === 'string' 
              ? parseFloat(priceField.actualValue) 
              : typeof priceField.actualValue === 'number' 
                ? priceField.actualValue 
                : 0;
            if (!isNaN(priceValue) && priceValue >= 0) {
              console.log('extractPriceFromFormData: Using price from formData.fields (exact "price" field):', priceValue);
              return priceValue;
            }
          }
          
          // If exact "price" field not found, try fields with "price" in the name (case insensitive)
          const priceFieldWithName = venueOrVendor.formData.fields.find((field: any) => {
            const fieldName = field?.name?.toLowerCase() || '';
            const hasPriceInName = fieldName.includes('price');
            const hasActualValue = field?.actualValue !== undefined && field?.actualValue !== null && field?.actualValue !== '';
            return hasPriceInName && hasActualValue;
          });
          
          if (priceFieldWithName && priceFieldWithName.actualValue !== undefined && priceFieldWithName.actualValue !== null) {
            const priceValue = typeof priceFieldWithName.actualValue === 'string' 
              ? parseFloat(priceFieldWithName.actualValue) 
              : typeof priceFieldWithName.actualValue === 'number' 
                ? priceFieldWithName.actualValue 
                : 0;
            if (!isNaN(priceValue) && priceValue >= 0) {
              console.log('extractPriceFromFormData: Using price from formData.fields (field with "price" in name):', priceValue);
              return priceValue;
            }
          }
          
          // Also check for direct Price field (capital P) - fields might be an object too
          if (venueOrVendor.formData.fields.Price) {
            const fieldsPrice = parseFloat(venueOrVendor.formData.fields.Price);
            if (!isNaN(fieldsPrice) && fieldsPrice >= 0) {
              console.log('extractPriceFromFormData: Using formData.fields.Price:', fieldsPrice);
              return fieldsPrice;
            }
          }
        }
        
        // PRIORITY 2: Check vendor.price (direct field)
        if (venueOrVendor.price !== undefined && venueOrVendor.price !== null && venueOrVendor.price >= 0) {
          console.log('extractPriceFromFormData: Using vendor.price:', venueOrVendor.price);
          return venueOrVendor.price;
        }
        
        // PRIORITY 3: Check formData.price (direct field in formData)
        if (venueOrVendor.formData?.price !== undefined && venueOrVendor.formData?.price !== null && venueOrVendor.formData.price >= 0) {
          console.log('extractPriceFromFormData: Using formData.price:', venueOrVendor.formData.price);
          return venueOrVendor.formData.price;
        }
        
        // PRIORITY 4: Check formData.pricing.starting
        if (venueOrVendor.formData?.pricing?.starting && typeof venueOrVendor.formData.pricing.starting === 'number' && venueOrVendor.formData.pricing.starting >= 0) {
          console.log('extractPriceFromFormData: Using formData.pricing.starting:', venueOrVendor.formData.pricing.starting);
          return venueOrVendor.formData.pricing.starting;
        }
        
        // PRIORITY 5: Check formData.pricing as a number
        if (venueOrVendor.formData?.pricing && typeof venueOrVendor.formData.pricing === 'number' && venueOrVendor.formData.pricing >= 0) {
          console.log('extractPriceFromFormData: Using formData.pricing (direct number):', venueOrVendor.formData.pricing);
          return venueOrVendor.formData.pricing;
        }
        
        // Fallback to calculatePriceFromPricing method
        const calculatedPrice = this.calculatePriceFromPricing(venueOrVendor);
        console.log('extractPriceFromFormData: Using calculatePriceFromPricing fallback:', calculatedPrice);
        return calculatedPrice;
      };

      const bookingsWithVenues = await Promise.all(
        allBookings?.map(async (booking: any) => {
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
                // Try multiple query methods to find the venue (consistent with venue.service.ts)
                let venue = await this.venueRepo.findOne({
                  where: { _id: venueId, isDeleted: false } as any,
                });
                
                // If not found, try with findOneBy
                if (!venue) {
                  venue = await this.venueRepo.findOneBy({ _id: venueId } as any);
                }
                
                // If still not found, try with id field
                if (!venue) {
                  venue = await this.venueRepo.findOne({
                    where: { id: venueId.toString(), isDeleted: false } as any,
                  });
                }
                
                venueOrVendor = venue;
                
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
                  
                  // Extract image URL from venue formData (similar to venue listing endpoints)
                  // Priority: formData.fields (MultiImageUpload) > formData.imageUrl > formData.images[0] > venue.imageUrl
                  let imageUrlFromFormData = '';
                  
                  // First, try to extract from formData.fields (for MultiImageUpload fields)
                  if (venueOrVendor.formData?.fields && Array.isArray(venueOrVendor.formData.fields)) {
                    const imageField = venueOrVendor.formData.fields.find((field: any) => 
                      field.type === 'MultiImageUpload' && 
                      field.actualValue && 
                      Array.isArray(field.actualValue) && 
                      field.actualValue.length > 0
                    );
                    
                    if (imageField && imageField.actualValue && imageField.actualValue.length > 0) {
                      const firstImage = imageField.actualValue[0];
                      // Check for url.imageUrl structure (most common format)
                      if (firstImage.url && firstImage.url.imageUrl) {
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
                    }
                  }
                  
                  // If not found in fields, try other formData locations
                  if (!imageUrlFromFormData) {
                    imageUrlFromFormData = venueOrVendor.formData?.imageUrl || 
                                          (Array.isArray(venueOrVendor.formData?.images) && venueOrVendor.formData.images.length > 0 
                                            ? venueOrVendor.formData.images[0] 
                                            : '') || 
                                          '';
                  }
                  
                  // Final fallback to venue.imageUrl
                  if (!imageUrlFromFormData) {
                    imageUrlFromFormData = venueOrVendor.imageUrl || '';
                  }
                  
                  // Set the extracted image URL on the venue object (no hardcoded fallback)
                  (venueOrVendor as any).imageUrl = imageUrlFromFormData;
                  
                  // Debug logging for image extraction
                  console.log('Venue image extraction for booking:', {
                    venueId: venueOrVendor.id,
                    venueName: venueOrVendor.name,
                    extractedImageUrl: imageUrlFromFormData,
                    hasFormDataFields: !!venueOrVendor.formData?.fields,
                    formDataImageUrl: venueOrVendor.formData?.imageUrl,
                    formDataImages: venueOrVendor.formData?.images,
                    venueImageUrl: venueOrVendor.imageUrl
                  });
                }
              } else if ((booking as any).bookingType === 'vendor') {
                console.log('Querying vendor with venueId:', venueId);
                // Try multiple query methods to find the vendor (consistent approach)
                // Ensure formData is explicitly included in the query
                let vendor = await this.vendorRepo.findOne({
                  where: { _id: venueId, isDeleted: false } as any,
                  // Explicitly select formData to ensure it's loaded
                  select: {
                    _id: true,
                    id: true,
                    name: true,
                    title: true,
                    price: true,
                    categoryId: true,
                    formData: true, // Explicitly select formData
                    imageUrl: true,
                    averageRating: true,
                    totalRatings: true,
                    description: true,
                    longDescription: true,
                    isDeleted: true,
                    isActive: true,
                  } as any,
                });
                
                // If not found, try with findOneBy
                if (!vendor) {
                  vendor = await this.vendorRepo.findOneBy({ _id: venueId } as any);
                }
                
                // If still not found, try with id field
                if (!vendor) {
                  vendor = await this.vendorRepo.findOne({
                    where: { id: venueId.toString(), isDeleted: false } as any,
                    // Explicitly select formData to ensure it's loaded
                    select: {
                      _id: true,
                      id: true,
                      name: true,
                      title: true,
                      price: true,
                      categoryId: true,
                      formData: true, // Explicitly select formData
                      imageUrl: true,
                      averageRating: true,
                      totalRatings: true,
                      description: true,
                      longDescription: true,
                      isDeleted: true,
                      isActive: true,
                    } as any,
                  });
                }
                
                venueOrVendor = vendor;
                
                // Debug vendor data - log formData structure
                console.log('Fetched vendor data:', {
                  id: venueOrVendor?.id,
                  name: venueOrVendor?.name,
                  title: venueOrVendor?.title,
                  price: venueOrVendor?.price,
                  categoryId: venueOrVendor?.categoryId,
                  hasFormData: !!venueOrVendor?.formData,
                  formDataPrice: venueOrVendor?.formData?.price,
                  hasFormDataFields: !!venueOrVendor?.formData?.fields,
                  isFieldsArray: Array.isArray(venueOrVendor?.formData?.fields),
                  fieldsCount: Array.isArray(venueOrVendor?.formData?.fields) ? venueOrVendor.formData.fields.length : 0,
                  formDataFieldsSample: Array.isArray(venueOrVendor?.formData?.fields) 
                    ? venueOrVendor.formData.fields.slice(0, 3).map((f: any) => ({ name: f?.name, type: f?.type, hasActualValue: !!f?.actualValue }))
                    : null
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
                
                // Extract image URL from vendor formData (similar to vendor listing endpoints)
                if (venueOrVendor) {
                  let imageUrlFromFormData = venueOrVendor.imageUrl || venueOrVendor.formData?.imageUrl || venueOrVendor.formData?.images?.[0] || '';
                  
                  // Extract from formData.fields if it exists (for MultiImageUpload fields)
                  if (venueOrVendor.formData?.fields && Array.isArray(venueOrVendor.formData.fields)) {
                    const imageField = venueOrVendor.formData.fields.find((field: any) => 
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
                  
                  // Set the extracted image URL on the vendor object (no hardcoded fallback)
                  (venueOrVendor as any).imageUrl = imageUrlFromFormData || venueOrVendor.imageUrl || '';
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

          // Dynamically check if offers exist for this booking
          let hasOffers = false;
          try {
            const actualBookingId = (booking as any).bookingId || (booking as any).id;
            // Use find().length instead of count() for better MongoDB compatibility
            const unifiedOffers = await this.offerRepo.find({
              where: { bookingId: actualBookingId } as any,
            });
            const unifiedOfferCount = unifiedOffers?.length || 0;
            
            const vendorOffers = await this.vendorOfferRepo.find({
              where: { bookingId: actualBookingId } as any,
            });
            const vendorOfferCount = vendorOffers?.length || 0;
            
            const adminOffers = await this.adminOfferRepo.find({
              where: { bookingId: actualBookingId } as any,
            });
            const adminOfferCount = adminOffers?.length || 0;
            
            hasOffers = unifiedOfferCount > 0 || vendorOfferCount > 0 || adminOfferCount > 0;
          } catch (error) {
            console.error(`Error checking offers count for booking ${(booking as any).bookingId || (booking as any).id}:`, error);
            hasOffers = (booking as any).hasOffers ?? false;
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
            price: extractPriceFromFormData(venueOrVendor),
            pricing: (venueOrVendor as any)?.pricing || venueOrVendor?.formData?.pricing || [], // Add pricing array from venue or formData
            status: (booking as any).bookingStatus || 'pending', // Add booking status
            rating: venueOrVendor?.averageRating || 0,
            imageUrl: venueOrVendor?.imageUrl || '',
            reviews: venueOrVendor?.totalRatings || 0,
            hasOffers: hasOffers, // Dynamically calculated hasOffers flag
            // Add missing fields for frontend compatibility
            customerName: user?.firstName + ' ' + user?.lastName || 'Unknown Customer',
            customerEmail: user?.email || 'unknown@example.com',
            serviceName: venueOrVendor?.title || venueOrVendor?.name || 'Unknown Service',
            startDateTime: (booking as any).eventDate || (booking as any).startTime || new Date().toISOString(),
            endDateTime: (booking as any).endDate || (booking as any).endTime || new Date().toISOString(),
            amount: extractPriceFromFormData(venueOrVendor),
            bookingNumber: (booking as any).bookingId || (booking as any).id || 'Unknown',
            // User information
            userName: user?.firstName + ' ' + user?.lastName || 'Unknown User',
            userEmail: user?.email || 'unknown@example.com'
          };
        }),
      );
      // Apply pagination to results
      const total = bookingsWithVenues.length;
      const skip = (page - 1) * limit;
      const paginatedBookings = bookingsWithVenues.slice(skip, skip + limit);

      return {
        bookings: paginatedBookings,
        total,
        page,
        limit,
      };
    } catch (error) {
      console.error('Error in findAllForUser:', error);
      throw new BadRequestException('Failed to fetch bookings');
    }
  }

  async findByBookingId(bookingId: string, userId?: string): Promise<any> {
    // Try to find by bookingId first (custom format like BK-A9098A0F)
    let booking = await this.bookingRepo.findOne({ where: { bookingId } as any } as any);
    
    // If not found by bookingId, try to find by MongoDB _id
    if (!booking && ObjectId.isValid(bookingId)) {
      try {
        const objectId = new ObjectId(bookingId);
        booking = await this.bookingRepo.findOne({ where: { _id: objectId } as any } as any);
      } catch (error) {
        console.log('Error searching by ObjectId in findByBookingId:', error);
      }
    }
    
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    
    // Debug logging to understand the issue
    console.log('findByBookingId - User ID from token:', userId);
    console.log('findByBookingId - Booking user ID:', (booking as any).userId);
    console.log('findByBookingId - User ID type:', typeof userId);
    console.log('findByBookingId - Booking user ID type:', typeof (booking as any).userId);
    console.log('findByBookingId - Raw booking referenceImages:', (booking as any).referenceImages);
    console.log('findByBookingId - Raw booking referenceImages type:', typeof (booking as any).referenceImages);
    console.log('findByBookingId - Raw booking referenceImages is array:', Array.isArray((booking as any).referenceImages));
    
    // Removed validation check - allow admins/vendors to view any booking for accept/reject operations

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
            imagePath: venueOrVendor.imageUrl || '',
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

    // Process referenceImages - filter out placeholder URLs and ensure proper format
    let referenceImages = (booking as any).referenceImages || [];
    console.log('findByBookingId - Original referenceImages from DB:', referenceImages);
    console.log('findByBookingId - Original referenceImages type:', typeof referenceImages);
    console.log('findByBookingId - Original referenceImages is array:', Array.isArray(referenceImages));
    
    if (Array.isArray(referenceImages)) {
      // Filter out placeholder URLs if any exist
      const beforeFilter = referenceImages.length;
      referenceImages = referenceImages.filter((url: string) => {
        if (!url || typeof url !== 'string') {
          console.log('findByBookingId - Filtering out invalid URL:', url);
          return false;
        }
        // Keep only actual image URLs, not placeholder URLs
        const isPlaceholder = url.includes('via.placeholder.com') || url.includes('placeholder');
        if (isPlaceholder) {
          console.log('findByBookingId - Filtering out placeholder URL:', url);
        }
        return !isPlaceholder;
      });
      
      console.log('findByBookingId - Filtered referenceImages:', referenceImages);
      console.log('findByBookingId - Before filter:', beforeFilter, 'After filter:', referenceImages.length);
      
      // If all images were placeholders and filtered out, set to empty array
      if (referenceImages.length === 0 && beforeFilter > 0) {
        console.log('⚠️ All reference images were placeholders, returning empty array');
      }
    } else {
      // If referenceImages is not an array, convert to array or set to empty
      console.log('⚠️ referenceImages is not an array, converting to empty array');
      referenceImages = [];
    }

    // Dynamically check if offers exist for this booking (more reliable than stored flag)
    const actualBookingId = (booking as any).bookingId || bookingId;
    let hasOffers = false;
    try {
      // Use find().length instead of count() for better MongoDB compatibility
      const unifiedOffers = await this.offerRepo.find({
        where: { bookingId: actualBookingId } as any,
      });
      const unifiedOfferCount = unifiedOffers?.length || 0;
      
      const vendorOffers = await this.vendorOfferRepo.find({
        where: { bookingId: actualBookingId } as any,
      });
      const vendorOfferCount = vendorOffers?.length || 0;
      
      const adminOffers = await this.adminOfferRepo.find({
        where: { bookingId: actualBookingId } as any,
      });
      const adminOfferCount = adminOffers?.length || 0;
      
      hasOffers = unifiedOfferCount > 0 || vendorOfferCount > 0 || adminOfferCount > 0;
      
      // Log for debugging
      if (actualBookingId === 'BK-3B13AEE7') {
        console.log(`[DEBUG findByBookingId] Booking ${actualBookingId} - Unified: ${unifiedOfferCount}, Vendor: ${vendorOfferCount}, Admin: ${adminOfferCount}, hasOffers: ${hasOffers}`);
      }
      
      // Update the stored flag if it's different (async, don't wait)
      const storedHasOffers = (booking as any).hasOffers ?? false;
      if (storedHasOffers !== hasOffers) {
        console.log(`Updating hasOffers flag for booking ${actualBookingId}: ${storedHasOffers} -> ${hasOffers}`);
        // Update asynchronously without blocking the response
        this.updateBookingHasOffersFlag(actualBookingId).catch(err => {
          console.error('Error updating hasOffers flag:', err);
        });
      }
    } catch (error) {
      console.error('Error checking offers count:', error);
      // Fallback to stored value if query fails
      hasOffers = (booking as any).hasOffers ?? false;
    }

    // Check if current user has already submitted an offer for this booking
    let userHasSubmittedOffer = false;
    if (userId) {
      try {
        // actualBookingId already defined above
        
        // Check unified offers
        const userUnifiedOffer = await this.offerRepo.findOne({
          where: {
            bookingId: actualBookingId,
            userId: userId,
            status: { $ne: UnifiedOfferStatus.REJECTED } as any,
          } as any,
        });
        
        // Check vendor offers (if userId matches vendorId)
        const userVendorOffer = await this.vendorOfferRepo.findOne({
          where: {
            bookingId: actualBookingId,
            vendorId: userId,
            status: { $ne: OfferStatus.REJECTED } as any,
          } as any,
        });
        
        // Check admin offers
        const userAdminOffer = await this.adminOfferRepo.findOne({
          where: {
            bookingId: actualBookingId,
            userId: userId,
            status: { $ne: AdminOfferStatus.REJECTED } as any,
          } as any,
        });
        
        userHasSubmittedOffer = !!(userUnifiedOffer || userVendorOffer || userAdminOffer);
      } catch (error) {
        console.error('Error checking if user has submitted offer:', error);
        userHasSubmittedOffer = false;
      }
    }

    const bookingData = {
      ...booking,
      eventDate: (booking as any).eventDate ?? null,
      endDate: (booking as any).endDate ?? null,
      startTime: (booking as any).startTime ?? null,
      endTime: (booking as any).endTime ?? null,
      timeSlot: (booking as any).timeSlot ?? null,
      status: (booking as any).bookingStatus || 'pending',
      categoryType: (booking as any).categoryType || null,
      referenceImages: referenceImages, // Explicitly set filtered referenceImages
      venue,
      vendor,
      event,
      photographyType,
      venueOrVenderInfo,
      hasOffers,
      userHasSubmittedOffer
    };

    console.log('findByBookingId - Final bookingData referenceImages:', bookingData.referenceImages);
    console.log('findByBookingId - Reference images count:', referenceImages.length);
    console.log('findByBookingId - Reference images:', referenceImages);
    console.log('findByBookingId - Has offers:', hasOffers);

    return bookingData;
  }

  async createRequestBooking(dto: CreateRequestBookingDto, userId: string): Promise<Booking> {
    try {
      if (!dto.bookingType) {
        throw new BadRequestException('bookingType is required');
      }
      
      // Ensure userId is a string
      const userIdString = String(userId);
      let uploadedImageUrls: string[] = [];
      if (dto.referenceImages?.length) {
        console.log(`📸 Processing ${dto.referenceImages.length} reference images for booking...`);
        try {
          uploadedImageUrls = await this.uploadBase64Images(dto.referenceImages);
          console.log(`✅ Successfully uploaded ${uploadedImageUrls.length} reference images:`, uploadedImageUrls);
        } catch (uploadError: any) {
          console.error('❌ Error during image upload process:', uploadError.message);
          console.error('❌ Upload error stack:', uploadError.stack);
          // Continue with empty array if upload fails - don't block booking creation
          uploadedImageUrls = [];
          console.log('⚠️ Continuing with booking creation without images due to upload error');
        }
      } else {
        console.log('📸 No reference images provided in booking request');
      }

    const entity = this.bookingRepo.create({
      ...dto,
      userId: userIdString, // Explicitly set as string
      referenceImages: uploadedImageUrls,
      eventDate: dto.eventDate,
      endDate: dto.endDate,
      timeSlot: (dto as any).timeSlot ?? null,
      bookingStatus: BookingStatus.PENDING // Explicitly set to pending by default
    });
    
    console.log('Booking Service - Created entity userId:', entity.userId, 'Type:', typeof entity.userId);
    console.log('Booking Service - Created entity referenceImages:', (entity as any).referenceImages);
    console.log('Booking Service - Created entity referenceImages count:', (entity as any).referenceImages?.length || 0);
    
    const savedEntity = await this.bookingRepo.save(entity);
    console.log('Booking Service - Saved entity userId:', (savedEntity as any).userId, 'Type:', typeof (savedEntity as any).userId);
    console.log('Booking Service - Saved entity referenceImages:', (savedEntity as any).referenceImages);
    console.log('Booking Service - Saved entity referenceImages count:', (savedEntity as any).referenceImages?.length || 0);
    console.log('Booking Service - Saved entity keys:', Object.keys(savedEntity));
    
    // Get referenceImages from multiple possible sources (MongoDB might store it differently)
    const savedReferenceImages = (savedEntity as any).referenceImages || 
                                 (savedEntity as any).referenceimages || 
                                 uploadedImageUrls || 
                                 [];
    
    console.log('Booking Service - Resolved referenceImages:', savedReferenceImages);
    console.log('Booking Service - Resolved referenceImages type:', typeof savedReferenceImages);
    console.log('Booking Service - Resolved referenceImages is array:', Array.isArray(savedReferenceImages));
    
    // Ensure referenceImages are explicitly included in the response
    // Build response explicitly to ensure all fields are included
    const response: any = {
      ...savedEntity,
      referenceImages: Array.isArray(savedReferenceImages) ? savedReferenceImages : uploadedImageUrls || [] // Explicitly set - MUST be included
    };
    
    // Also spread to catch any other fields
    Object.assign(response, savedEntity);
    // Override referenceImages again to ensure it's not overwritten
    response.referenceImages = Array.isArray(savedReferenceImages) ? savedReferenceImages : uploadedImageUrls || [];
    
      console.log('Booking Service - Response referenceImages (uploaded URLs):', response.referenceImages);
      console.log('Booking Service - Response referenceImages count:', response.referenceImages?.length || 0);
      console.log('Booking Service - Response keys:', Object.keys(response));
      console.log('Booking Service - Response has referenceImages:', 'referenceImages' in response);
      
      return response;
    } catch (error: any) {
      console.error('❌ Error in createRequestBooking:', error.message);
      console.error('❌ Error stack:', error.stack);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      throw new BadRequestException(`Failed to create booking: ${error.message}`);
    }
  }

  async updateBooking(bookingId: string, dto: any, userId: string): Promise<any> {
    const booking = await this.bookingRepo.findOne({ where: { bookingId } as any } as any);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    
    // Convert both userIds to strings for proper comparison
    const tokenUserId = String(userId);
    const bookingUserId = String((booking as any).userId || '');
    
    console.log('updateBooking - Token user ID (string):', tokenUserId);
    console.log('updateBooking - Booking user ID (string):', bookingUserId);
    console.log('updateBooking - User ID type from token:', typeof userId);
    console.log('updateBooking - User ID type from booking:', typeof (booking as any).userId);
    console.log('updateBooking - IDs match:', tokenUserId === bookingUserId);
    
    if (tokenUserId !== bookingUserId) {
      throw new BadRequestException('You can only update your own bookings');
    }
    let uploadedImageUrls: string[] = [];
    if (dto.referenceImages?.length) {
      try {
        console.log(`📸 Processing ${dto.referenceImages.length} reference images for booking update...`);
        uploadedImageUrls = await this.uploadBase64Images(dto.referenceImages);
        console.log(`✅ Successfully uploaded ${uploadedImageUrls.length} reference images for update:`, uploadedImageUrls);
      } catch (uploadError: any) {
        console.error('❌ Error during image upload process in update:', uploadError.message);
        console.error('❌ Upload error stack:', uploadError.stack);
        // Continue with empty array if upload fails - don't block booking update
        uploadedImageUrls = [];
        console.log('⚠️ Continuing with booking update without images due to upload error');
      }
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

  // Helper function to wrap upload with timeout
  private async uploadWithTimeout(
    uploadPromise: Promise<any>,
    timeoutMs: number = 30000 // 30 seconds timeout
  ): Promise<any> {
    return Promise.race([
      uploadPromise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error(`Upload timeout after ${timeoutMs}ms`)), timeoutMs)
      )
    ]);
  }

  private async uploadBase64Images(base64Images: string[]): Promise<string[]> {
    try {
      console.log(`📸 Uploading ${base64Images.length} reference images for booking request...`);
      const uploadedUrls: string[] = [];
      const awsConfig = this.configService.get('aws');
      const hasAwsConfig = awsConfig && awsConfig.bucketName && awsConfig.bucketFolderName;
      
      for (let i = 0; i < base64Images.length; i++) {
        const base64Image = base64Images[i];
        const imageIndex = i + 1;
        
        if (!base64Image) {
          console.log(`⚠️ Skipping image ${imageIndex}/${base64Images.length}: empty base64 data`);
          continue;
        }
        
        try {
          const matches = base64Image.match(/^data:image\/(png|jpeg|jpg);base64,(.+)$/);
          if (!matches) {
            console.error(`❌ Image ${imageIndex}/${base64Images.length}: Invalid base64 image format`);
            continue; // Skip invalid images instead of throwing
          }
        
        const ext = matches[1];
        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, 'base64');
        const mimetype = `image/${ext}`;
        const timestamp = Date.now();
        const fileName = `request_booking_${timestamp}_${Math.random()
          .toString(36)
          .substring(7)}.${ext}`;

          console.log(`📁 Processing image ${imageIndex}/${base64Images.length}:`, { ext, mimetype, fileName, size: buffer.length });

          let imageUrl = '';
          let uploadSuccess = false;
          
          if (process.env.NODE_ENV === 'local') {
            console.log(`🏠 Image ${imageIndex}/${base64Images.length}: Using Supabase for local development (same as profile uploads)`);
            // Use Supabase with 'profiles' bucket (same as profile uploads)
            const supabaseBuckets = ['profiles', 'uploads'];
            for (const bucket of supabaseBuckets) {
              try {
                console.log(`☁️ Image ${imageIndex}/${base64Images.length}: Trying Supabase bucket: ${bucket}`);
                const { publicUrl } = await this.uploadWithTimeout(
                  this.supabaseService.upload({
                    filePath: `booking/${fileName}`,
                    file: buffer,
                    contentType: mimetype,
                    bucket: bucket,
                    upsert: true,
                  }),
                  30000 // 30 second timeout per upload
                );
                if (publicUrl) {
                  imageUrl = publicUrl;
                  console.log(`✅ Image ${imageIndex}/${base64Images.length}: Supabase upload successful (bucket: ${bucket}):`, imageUrl);
                  uploadSuccess = true;
                  break;
                }
              } catch (supabaseError: any) {
                console.log(`⚠️ Image ${imageIndex}/${base64Images.length}: Supabase bucket ${bucket} failed:`, supabaseError.message);
                continue;
              }
            }
          } else {
            // Production: Try Supabase first (same as profile uploads), then AWS S3 as fallback
            console.log(`☁️ Image ${imageIndex}/${base64Images.length}: Using Supabase for production (same as profile uploads)`);
            
            // Try Supabase first with 'profiles' bucket (same as profile uploads)
            const supabaseBuckets = ['profiles', 'uploads'];
            for (const bucket of supabaseBuckets) {
              try {
                console.log(`☁️ Image ${imageIndex}/${base64Images.length}: Trying Supabase bucket: ${bucket}`);
                const { publicUrl } = await this.uploadWithTimeout(
                  this.supabaseService.upload({
                    filePath: `booking/${fileName}`,
                    file: buffer,
                    contentType: mimetype,
                    bucket: bucket,
                    upsert: true,
                  }),
                  30000 // 30 second timeout per upload
                );
                if (publicUrl) {
                  imageUrl = publicUrl;
                  console.log(`✅ Image ${imageIndex}/${base64Images.length}: Supabase upload successful (bucket: ${bucket}):`, imageUrl);
                  uploadSuccess = true;
                  break;
                }
              } catch (supabaseError: any) {
                console.log(`⚠️ Image ${imageIndex}/${base64Images.length}: Supabase bucket ${bucket} failed:`, supabaseError.message);
                continue;
              }
            }
            
            // If Supabase failed, try AWS S3 as fallback (only if configured)
            if (!uploadSuccess && hasAwsConfig) {
              try {
                console.log(`☁️ Image ${imageIndex}/${base64Images.length}: Trying AWS S3 as fallback`);
                const awsUploadReqDto = {
                  Bucket: awsConfig.bucketName,
                  Key: awsConfig.bucketFolderName + '/' + 'booking' + '/' + fileName,
                  Body: buffer,
                  ContentType: mimetype,
                } as any;
                
                const response = await this.awsS3Service.uploadFilesToS3Bucket(awsUploadReqDto);
                imageUrl = (response as any)?.Location || '';
                if (imageUrl) {
                  console.log(`✅ Image ${imageIndex}/${base64Images.length}: AWS S3 upload successful:`, imageUrl);
                  uploadSuccess = true;
                }
              } catch (s3Error: any) {
                console.error(`❌ Image ${imageIndex}/${base64Images.length}: AWS S3 upload also failed:`, s3Error.message);
              }
            }
            
            // If all uploads failed
            if (!uploadSuccess) {
              console.error(`❌ Image ${imageIndex}/${base64Images.length}: All upload methods failed - Supabase buckets unavailable and AWS config missing or failed`);
              console.log(`⚠️ Image ${imageIndex}/${base64Images.length}: Image upload failed completely, skipping this image`);
              imageUrl = '';
            }
          }
          
          // Only add non-empty URLs (skip failed uploads)
          if (imageUrl && imageUrl.trim() !== '') {
            uploadedUrls.push(imageUrl);
            console.log(`✅ Image ${imageIndex}/${base64Images.length}: Successfully added to upload list`);
          } else {
            console.log(`⚠️ Image ${imageIndex}/${base64Images.length}: Skipping image due to upload failure`);
          }
          
          // Add a delay between uploads to avoid rate limiting (except for the last image)
          // Increased delay to 500ms to prevent rate limiting with multiple images
          if (imageIndex < base64Images.length) {
            await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay between uploads
          }
        } catch (imageError: any) {
          // Catch any error during image processing and continue with next image
          console.error(`❌ Image ${imageIndex}/${base64Images.length}: Error processing image:`, imageError.message);
          console.error(`❌ Image ${imageIndex}/${base64Images.length}: Error stack:`, imageError.stack);
          // Continue processing other images
          // Still add delay even on error to avoid rate limiting
          if (imageIndex < base64Images.length) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
      }
      
      console.log('✅ All reference images processed:', uploadedUrls.length);
      console.log('✅ Uploaded URLs:', uploadedUrls);
      // Filter out any empty strings just to be safe
      const filteredUrls = uploadedUrls.filter(url => url && url.trim() !== '');
      console.log('✅ Filtered URLs to return:', filteredUrls);
      return filteredUrls;
      
    } catch (error) {
      console.error('❌ Error uploading reference images:', error);
      throw error;
    }
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
    const currentStatus = ((booking as any).bookingStatus || '').toLowerCase();
    if (currentStatus === 'cancelled') {
      throw new BadRequestException('Booking is already cancelled');
    }
    if (currentStatus === 'completed') {
      throw new BadRequestException('Cannot cancel a completed booking');
    }
    if (currentStatus === 'rejected') {
      throw new BadRequestException('Cannot cancel a rejected booking');
    }

    // Update booking status to cancelled
    const updateData = {
      bookingStatus: 'cancelled',
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

  async acceptBooking(bookingId: string, dto: any, userId: string): Promise<any> {
    // Try to find by bookingId first (custom format like BK-A9098A0F)
    let booking = await this.bookingRepo.findOne({ where: { bookingId } as any } as any);
    
    // If not found by bookingId, try to find by MongoDB _id
    if (!booking && ObjectId.isValid(bookingId)) {
      try {
        const objectId = new ObjectId(bookingId);
        booking = await this.bookingRepo.findOne({ where: { _id: objectId } as any } as any);
      } catch (error) {
        console.log('Error searching by ObjectId:', error);
      }
    }
    
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Check if booking can be accepted
    const currentStatus = ((booking as any).bookingStatus || '').toLowerCase();
    if (currentStatus === 'confirmed') {
      throw new BadRequestException('Booking is already confirmed');
    }
    if (currentStatus === 'cancelled') {
      throw new BadRequestException('Cannot accept a cancelled booking');
    }
    if (currentStatus === 'completed') {
      throw new BadRequestException('Cannot accept a completed booking');
    }
    if (currentStatus === 'rejected') {
      throw new BadRequestException('Cannot accept a rejected booking');
    }

    // Update booking status to confirmed
    const updateData: any = {
      bookingStatus: 'confirmed',
    };

    // Add notes if provided
    if (dto.notes) {
      updateData.notes = dto.notes;
    }

    // Clear rejection fields if they exist
    updateData.rejectionReason = null;
    updateData.rejectionDate = null;

    // Use the actual bookingId from the found booking, or the provided one
    const actualBookingId = (booking as any).bookingId || bookingId;
    console.log('Accept Booking - actualBookingId:', actualBookingId);
    
    // Update the booking using Object.assign and save (more reliable)
    Object.assign(booking, updateData);
    const updatedBooking = await this.bookingRepo.save(booking);
    
    console.log('Accept Booking - Updated booking:', updatedBooking);

    // Return updated booking using the actual bookingId
    return await this.findByBookingId(actualBookingId, userId);
  }

  async rejectBooking(bookingId: string, dto: any, userId: string): Promise<any> {
    try {
      // Try to find by bookingId first (custom format like BK-A9098A0F)
      let booking = await this.bookingRepo.findOne({ where: { bookingId } as any } as any);
      
      // If not found by bookingId, try to find by MongoDB _id
      if (!booking && ObjectId.isValid(bookingId)) {
        try {
          const objectId = new ObjectId(bookingId);
          booking = await this.bookingRepo.findOne({ where: { _id: objectId } as any } as any);
        } catch (error) {
          console.log('Error searching by ObjectId:', error);
        }
      }
      
      if (!booking) {
        throw new NotFoundException('Booking not found');
      }

      // Check if booking can be rejected
      const currentStatus = ((booking as any).bookingStatus || '').toLowerCase();
      if (currentStatus === 'rejected') {
        throw new BadRequestException('Booking is already rejected');
      }
      if (currentStatus === 'cancelled') {
        throw new BadRequestException('Cannot reject a cancelled booking');
      }
      if (currentStatus === 'completed') {
        throw new BadRequestException('Cannot reject a completed booking');
      }
      if (currentStatus === 'confirmed') {
        throw new BadRequestException('Cannot reject a confirmed booking. Please cancel it instead.');
      }

      // Update booking status to rejected
      // Support both 'rejectionReason' and 'reason' fields
      const rejectionReason = dto.rejectionReason || dto.reason;
      
      if (!rejectionReason) {
        throw new BadRequestException('Rejection reason is required');
      }
      
      const updateData: any = {
        bookingStatus: 'rejected',
        rejectionReason: rejectionReason,
        rejectionDate: new Date(),
      };

      // Add notes if provided
      if (dto.notes) {
        updateData.notes = dto.notes;
      }

      // Use the actual bookingId from the found booking, or the provided one
      const actualBookingId = (booking as any).bookingId || bookingId;
      console.log('Reject Booking - actualBookingId:', actualBookingId);
      console.log('Reject Booking - Updating with:', updateData);
      
      // Update the booking using Object.assign and save (more reliable)
      Object.assign(booking, updateData);
      const updatedBooking = await this.bookingRepo.save(booking);
      
      console.log('Reject Booking - Updated booking:', updatedBooking);

      // Return updated booking using the actual bookingId
      return await this.findByBookingId(actualBookingId, userId);
    } catch (error) {
      console.error('Reject Booking Error:', error);
      console.error('Reject Booking Error Stack:', error.stack);
      
      // Re-throw known exceptions
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      
      // Wrap unexpected errors
      throw new BadRequestException('Failed to reject booking: ' + (error.message || 'Unknown error'));
    }
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

  /**
   * Migration method to update existing bookings that don't have bookingStatus set
   * Sets bookingStatus to PENDING for all bookings where bookingStatus is null, undefined, or missing
   */
  async migrateBookingStatus(): Promise<{ updated: number; message: string }> {
    try {
      console.log('Starting booking status migration...');
      
      // Find all bookings that don't have bookingStatus or have null/undefined bookingStatus
      const bookingsWithoutStatus = await this.bookingRepo.find({
        where: {
          isDeleted: false,
          $or: [
            { bookingStatus: null },
            { bookingStatus: { $exists: false } }
          ]
        } as any
      });

      console.log(`Found ${bookingsWithoutStatus.length} bookings without bookingStatus`);

      // Update all bookings without status to PENDING
      let updatedCount = 0;
      for (const booking of bookingsWithoutStatus) {
        try {
          await this.bookingRepo.update(
            { _id: (booking as any)._id || booking.id } as any,
            { bookingStatus: 'pending' } as any
          );
          updatedCount++;
        } catch (error) {
          console.error(`Error updating booking ${(booking as any).bookingId || (booking as any)._id}:`, error);
        }
      }

      // Also update bookings with empty string status
      const bookingsWithEmptyStatus = await this.bookingRepo.find({
        where: {
          isDeleted: false,
          bookingStatus: ''
        } as any
      });

      console.log(`Found ${bookingsWithEmptyStatus.length} bookings with empty bookingStatus`);

      for (const booking of bookingsWithEmptyStatus) {
        try {
          await this.bookingRepo.update(
            { _id: (booking as any)._id || booking.id } as any,
            { bookingStatus: 'pending' } as any
          );
          updatedCount++;
        } catch (error) {
          console.error(`Error updating booking ${(booking as any).bookingId || (booking as any)._id}:`, error);
        }
      }

      // Also convert all uppercase statuses to lowercase
      const uppercaseStatuses = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'REJECTED'];
      let convertedCount = 0;
      
      for (const upperStatus of uppercaseStatuses) {
        const lowerStatus = upperStatus.toLowerCase();
        const bookingsWithUpperStatus = await this.bookingRepo.find({
          where: {
            isDeleted: false,
            bookingStatus: upperStatus
          } as any
        });

        console.log(`Found ${bookingsWithUpperStatus.length} bookings with status '${upperStatus}'`);

        for (const booking of bookingsWithUpperStatus) {
          try {
            await this.bookingRepo.update(
              { _id: (booking as any)._id || booking.id } as any,
              { bookingStatus: lowerStatus } as any
            );
            convertedCount++;
          } catch (error) {
            console.error(`Error converting booking ${(booking as any).bookingId || (booking as any)._id}:`, error);
          }
        }
      }

      console.log(`Converted ${convertedCount} bookings from uppercase to lowercase status.`);
      console.log(`Migration completed. Updated ${updatedCount} bookings, converted ${convertedCount} statuses.`);
      
      return {
        updated: updatedCount + convertedCount,
        message: `Successfully updated ${updatedCount} bookings to pending status and converted ${convertedCount} uppercase statuses to lowercase`
      };
    } catch (error) {
      console.error('Error in migrateBookingStatus:', error);
      throw new BadRequestException(`Failed to migrate booking status: ${error.message}`);
    }
  }

  /**
   * Submit a vendor offer for a booking
   */
  async submitVendorOffer(bookingId: string, dto: CreateVendorOfferDto, userId: string, user?: any): Promise<VendorOffer> {
    // Find booking
    let booking = await this.bookingRepo.findOne({ where: { bookingId } as any } as any);
    if (!booking && ObjectId.isValid(bookingId)) {
      try {
        const objectId = new ObjectId(bookingId);
        booking = await this.bookingRepo.findOne({ where: { _id: objectId } as any } as any);
      } catch (error) {
        console.log('Error searching by ObjectId:', error);
      }
    }

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Verify booking status allows offers
    const currentStatus = ((booking as any).bookingStatus || '').toLowerCase();
    if (currentStatus === 'cancelled' || currentStatus === 'completed' || currentStatus === 'confirmed') {
      throw new BadRequestException('Cannot submit offer for a cancelled, completed, or confirmed booking');
    }

    // Get vendorId from user's enterprise context
    let vendorId: string | null = null;
    
    // If user has enterpriseId, find vendor associated with that enterprise and booking's category
    if (user?.enterpriseId) {
      const categoryId = (booking as any).categoryId;
      const vendors = await this.vendorRepo.find({
        where: {
          enterpriseId: user.enterpriseId,
          categoryId: categoryId || { $exists: true } as any,
          isDeleted: false,
        } as any,
      });

      if (vendors && vendors.length > 0) {
        // Use the first vendor from the enterprise that matches the category
        // If booking has a specific venueId (vendorId), prefer that one
        const bookingVendorId = (booking as any).venueId;
        const matchingVendor = vendors.find((v: any) => {
          const vId = String((v as any)._id || (v as any).id);
          return vId === bookingVendorId;
        });
        
        vendorId = matchingVendor 
          ? String((matchingVendor as any)._id || (matchingVendor as any).id)
          : String((vendors[0] as any)._id || (vendors[0] as any).id);
      }
    }

    // Fallback: use booking's venueId if no vendor found from enterprise
    if (!vendorId) {
      vendorId = (booking as any).venueId;
    }

    // If still no vendorId, use userId as vendorId (allows any user to submit offers)
    if (!vendorId) {
      vendorId = userId;
    }

    // Verify vendor exists and user has access (only if vendorId is not userId and is a valid ObjectId)
    if (vendorId !== userId && ObjectId.isValid(vendorId)) {
      try {
        const vendor = await this.vendorRepo.findOne({ where: { _id: new ObjectId(vendorId), isDeleted: false } as any } as any);
        if (!vendor) {
          // If vendor not found, fall back to using userId as vendorId
          vendorId = userId;
        } else {
          // Verify user has access to this vendor (same enterprise)
          if (user?.enterpriseId && (vendor as any).enterpriseId !== user.enterpriseId) {
            throw new BadRequestException('You do not have permission to submit offers for this vendor');
          }
        }
      } catch (error) {
        // If ObjectId conversion fails or vendor lookup fails, use userId as vendorId
        console.log('Vendor lookup failed, using userId as vendorId:', error);
        vendorId = userId;
      }
    } else if (vendorId !== userId) {
      // If vendorId is not userId and not a valid ObjectId, use userId
      vendorId = userId;
    }

    // Check if vendor already submitted an offer for this booking
    const existingOffer = await this.vendorOfferRepo.findOne({
      where: {
        bookingId: (booking as any).bookingId || bookingId,
        vendorId: vendorId,
        status: { $ne: OfferStatus.REJECTED } as any,
      } as any,
    });

    if (existingOffer) {
      throw new BadRequestException('You have already submitted an offer for this booking');
    }

    // Create vendor offer
    const offerAddedByValue = dto.offerAddedBy || userId;
    console.log('Creating vendor offer with offerAddedBy:', offerAddedByValue, 'from DTO:', dto.offerAddedBy, 'userId:', userId);
    
    // Create new VendorOffer instance and assign all properties
    const offer = new VendorOffer();
    offer.bookingId = (booking as any).bookingId || bookingId;
    offer.vendorId = vendorId;
    offer.offerAmount = dto.offerAmount;
    offer.extraServices = dto.extraServices || [];
    offer.notes = dto.notes;
    offer.status = OfferStatus.PENDING;
    offer.offerAddedBy = offerAddedByValue; // Explicitly set the field

    console.log('Vendor offer before save:', JSON.stringify(offer, null, 2));
    console.log('offerAddedBy property:', offer.offerAddedBy);
    console.log('offer object keys:', Object.keys(offer));
    
    const savedOffer = await this.vendorOfferRepo.save(offer);
    
    console.log('Vendor offer after save:', JSON.stringify(savedOffer, null, 2));
    console.log('Saved offer offerAddedBy:', (savedOffer as any).offerAddedBy);
    console.log('Saved offer keys:', Object.keys(savedOffer));
    
    // Verify the field was saved by querying the database directly
    const verifyOffer = await this.vendorOfferRepo.findOne({
      where: { _id: (savedOffer as any)._id || (savedOffer as any).id } as any,
    } as any);
    console.log('Verified offer from DB offerAddedBy:', (verifyOffer as any)?.offerAddedBy);

    // Update hasOffers flag for the booking
    await this.updateBookingHasOffersFlag((booking as any).bookingId || bookingId);

    // Send notification to booking user
    try {
      const bookingUser = await this.userService.findById((booking as any).userId);
      const offerUser = await this.userService.findById(userId);
      
      if (bookingUser) {
        // Get offer submitter name
        let offerSubmitterName = 'A vendor';
        if (offerUser) {
          offerSubmitterName = `${offerUser.firstName || ''} ${offerUser.lastName || ''}`.trim() || offerUser.organizationName || 'A vendor';
        }
        
        // Only send notification if the offer submitter is not the booking owner
        const bookingUserId = String((bookingUser as any)?.id || (bookingUser as any)?._id || (booking as any).userId || '');
        if (bookingUserId !== userId) {
          await this.notificationService.create({
            title: 'New Vendor Offer Received',
            message: `${offerSubmitterName} has submitted an offer of ₹${dto.offerAmount} for your booking ${(booking as any).bookingId}`,
            recipientId: (booking as any).userId,
            recipientEmail: bookingUser.email,
          });
        }
      }
    } catch (error) {
      console.error('Error sending notification for offer submission:', error);
    }

    return savedOffer;
  }

  /**
   * Get all offers for a booking with vendor details
   */
  async getBookingOffers(bookingId: string, userId: string): Promise<Array<VendorOffer & { vendor_name?: string } & { id?: string }>> {
    // Find booking
    let booking = await this.bookingRepo.findOne({ where: { bookingId } as any } as any);
    if (!booking && ObjectId.isValid(bookingId)) {
      try {
        const objectId = new ObjectId(bookingId);
        booking = await this.bookingRepo.findOne({ where: { _id: objectId } as any } as any);
      } catch (error) {
        console.log('Error searching by ObjectId:', error);
      }
    }

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Verify user has access (booking owner or enterprise admin)
    const bookingUserId = String((booking as any).userId || '');
    const requestUserId = String(userId || '');

    // Allow access if user is booking owner or admin
    if (bookingUserId !== requestUserId) {
      // Check if user is enterprise admin for the vendor
      const venueId = (booking as any).venueId;
      if (venueId) {
        const vendor = await this.vendorRepo.findOne({
          where: { _id: new ObjectId(venueId), isDeleted: false } as any,
        } as any);
        
        if (vendor && (vendor as any).enterpriseId) {
          const user = await this.userService.findById(userId);
          if (user && user.enterpriseId === (vendor as any).enterpriseId && user.isEnterpriseAdmin) {
            // Enterprise admin can view offers
          } else {
            throw new BadRequestException('You do not have permission to view offers for this booking');
          }
        } else {
          throw new BadRequestException('You do not have permission to view offers for this booking');
        }
      } else {
        throw new BadRequestException('You do not have permission to view offers for this booking');
      }
    }

    // Get all offers for this booking
    const offers = await this.vendorOfferRepo.find({
      where: { bookingId: (booking as any).bookingId || bookingId } as any,
      order: { createdAt: 'DESC' },
    });

    // Enrich offers with vendor names
    const offersWithVendorNames = await Promise.all(
      offers.map(async (offer) => {
        let vendorName = 'Unknown Vendor';
        try {
          const vendor = await this.vendorRepo.findOne({
            where: { _id: new ObjectId(offer.vendorId), isDeleted: false } as any,
          } as any);
          if (vendor) {
            vendorName = vendor.name || vendor.title || 'Unknown Vendor';
          }
        } catch (error) {
          console.error('Error fetching vendor name:', error);
        }
        return {
          ...offer,
          id: (offer as any).id || (offer as any)._id?.toString() || '',
          vendor_name: vendorName,
        } as VendorOffer & { vendor_name?: string } & { id?: string };
      })
    );

    return offersWithVendorNames;
  }

  /**
   * Accept or reject an offer
   */
  async acceptOrRejectOffer(bookingId: string, offerId: string, action: 'accept' | 'reject', userId: string): Promise<{ offer: any; chatId?: string; bookingStatus: string }> {
    // Find booking
    let booking = await this.bookingRepo.findOne({ where: { bookingId } as any } as any);
    if (!booking && ObjectId.isValid(bookingId)) {
      try {
        const objectId = new ObjectId(bookingId);
        booking = await this.bookingRepo.findOne({ where: { _id: objectId } as any } as any);
      } catch (error) {
        console.log('Error searching by ObjectId:', error);
      }
    }

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Verify user is the booking owner
    const bookingUserId = String((booking as any).userId || '');
    const requestUserId = String(userId || '');
    if (bookingUserId !== requestUserId) {
      throw new BadRequestException('Only the booking owner can accept or reject offers');
    }

    // Find the offer in all collections (unified, vendor, admin)
    const actualBookingId = (booking as any).bookingId || bookingId;
    let offer: any = null;
    let offerType: 'unified' | 'vendor' | 'admin' = 'vendor';
    let offerRepo: any = null;
    
    // Helper function to match offer ID (handles different ID formats)
    const matchesOfferId = (offerDoc: any, searchId: string): boolean => {
      const docId = (offerDoc._id || offerDoc.id)?.toString();
      const docOfferId = (offerDoc.offerId || (offerDoc as any).offerId)?.toString();
      const searchIdStr = searchId.toString();
      
      return docId === searchIdStr || 
             docOfferId === searchIdStr ||
             docId === searchId ||
             docOfferId === searchId;
    };
    
    // First, get all offers for this booking from all collections
    try {
      const unifiedOffers = await this.offerRepo.find({ where: { bookingId: actualBookingId } as any } as any);
      const vendorOffers = await this.vendorOfferRepo.find({ where: { bookingId: actualBookingId } as any } as any);
      const adminOffers = await this.adminOfferRepo.find({ where: { bookingId: actualBookingId } as any } as any);
      
      console.log(`[DEBUG] Searching for offer ${offerId} in booking ${actualBookingId}`);
      console.log(`[DEBUG] Found ${unifiedOffers?.length || 0} unified offers, ${vendorOffers?.length || 0} vendor offers, ${adminOffers?.length || 0} admin offers`);
      
      // Search in unified offers
      if (unifiedOffers && unifiedOffers.length > 0) {
        offer = unifiedOffers.find((o: any) => matchesOfferId(o, offerId));
        if (offer) {
          offerType = 'unified';
          offerRepo = this.offerRepo;
          console.log(`[DEBUG] Found offer ${offerId} in unified offers collection`);
        }
      }
      
      // Search in vendor offers if not found
      if (!offer && vendorOffers && vendorOffers.length > 0) {
        offer = vendorOffers.find((o: any) => matchesOfferId(o, offerId));
        if (offer) {
          offerType = 'vendor';
          offerRepo = this.vendorOfferRepo;
          console.log(`[DEBUG] Found offer ${offerId} in vendor offers collection`);
        }
      }
      
      // Search in admin offers if not found
      if (!offer && adminOffers && adminOffers.length > 0) {
        offer = adminOffers.find((o: any) => matchesOfferId(o, offerId));
        if (offer) {
          offerType = 'admin';
          offerRepo = this.adminOfferRepo;
          console.log(`[DEBUG] Found offer ${offerId} in admin offers collection`);
        }
      }
      
      // If still not found, log all available offer IDs for debugging
      if (!offer) {
        console.error(`[ERROR] Offer ${offerId} not found in any collection for booking ${actualBookingId}`);
        if (unifiedOffers?.length > 0) {
          console.log(`[DEBUG] Unified offer IDs:`, unifiedOffers.map((o: any) => ({
            _id: (o._id || o.id)?.toString(),
            offerId: (o.offerId || (o as any).offerId)?.toString(),
            bookingId: o.bookingId
          })));
        }
        if (vendorOffers?.length > 0) {
          console.log(`[DEBUG] Vendor offer IDs:`, vendorOffers.map((o: any) => ({
            _id: (o._id || o.id)?.toString(),
            offerId: (o.offerId || (o as any).offerId)?.toString(),
            bookingId: o.bookingId
          })));
        }
        if (adminOffers?.length > 0) {
          console.log(`[DEBUG] Admin offer IDs:`, adminOffers.map((o: any) => ({
            _id: (o._id || o.id)?.toString(),
            offerId: (o.offerId || (o as any).offerId)?.toString(),
            bookingId: o.bookingId
          })));
        }
        throw new NotFoundException(`Offer ${offerId} not found for booking ${actualBookingId}. Please check the offer ID and ensure it belongs to this booking.`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(`Error searching for offers for booking ${actualBookingId}:`, error);
      throw new NotFoundException(`Error searching for offer ${offerId} for booking ${actualBookingId}`);
    }

    // Verify offer belongs to this booking
    const offerBookingId = offer.bookingId || (offer as any).bookingId;
    if (offerBookingId !== actualBookingId) {
      throw new BadRequestException('Offer does not belong to this booking');
    }

    // Check current status
    const currentStatus = offer.status;
    const isPending = currentStatus === OfferStatus.PENDING || 
                     currentStatus === UnifiedOfferStatus.PENDING || 
                     currentStatus === AdminOfferStatus.PENDING;
    const isRejected = currentStatus === OfferStatus.REJECTED || 
                       currentStatus === UnifiedOfferStatus.REJECTED || 
                       currentStatus === AdminOfferStatus.REJECTED;
    const isAccepted = currentStatus === OfferStatus.ACCEPTED || 
                       currentStatus === UnifiedOfferStatus.ACCEPTED || 
                       currentStatus === AdminOfferStatus.ACCEPTED;

    // Handle REJECT action
    if (action === 'reject') {
      // Allow rejecting if pending or already rejected (idempotent operation)
      if (isAccepted) {
        throw new BadRequestException('Cannot reject an offer that has already been accepted');
      }
      
      // If already rejected, just return success (idempotent)
      if (isRejected) {
        console.log(`[INFO] Offer ${offerId} is already rejected, returning success (idempotent operation)`);
        return {
          offer: offer,
          bookingStatus: (booking as any).bookingStatus || BookingStatus.PENDING,
        };
      }
      // Update offer status to rejected
      const previousStatus = offer.status;
      const rejectedStatus = offerType === 'unified' ? UnifiedOfferStatus.REJECTED : 
                             offerType === 'admin' ? AdminOfferStatus.REJECTED : 
                             OfferStatus.REJECTED;
      
      console.log(`[INFO] Updating offer ${offerId} status from ${previousStatus} to REJECTED (offerType: ${offerType})`);
      
      // Explicitly set the status property
      offer.status = rejectedStatus;
      
      // For MongoDB/TypeORM, we need to ensure the status is properly set
      // Use Object.assign to ensure all properties are updated
      Object.assign(offer, {
        status: rejectedStatus,
        updatedAt: new Date(),
      });
      
      // Save the offer with explicit status update
      // Handle case where save() might return an array (MongoDB/TypeORM behavior)
      let savedOfferResult;
      try {
        savedOfferResult = await offerRepo.save(offer);
        const updatedOffer = Array.isArray(savedOfferResult) ? savedOfferResult[0] : savedOfferResult;
        const savedStatus = updatedOffer?.status || (updatedOffer as any)?.status;
        console.log(`[INFO] Offer ${offerId} saved via save(). Status: ${savedStatus}`);
      } catch (saveError) {
        console.error(`[ERROR] Failed to save offer using save() method:`, saveError);
        // Try using update() method as fallback
        try {
          const updateResult = await offerRepo.update(
            { _id: new ObjectId(offerId) } as any,
            { status: rejectedStatus, updatedAt: new Date() } as any
          );
          console.log(`[INFO] Offer ${offerId} updated via update() method. Result:`, updateResult);
        } catch (updateError) {
          console.error(`[ERROR] Failed to update offer using update() method:`, updateError);
          throw new BadRequestException(`Failed to update offer status: ${updateError.message}`);
        }
      }
      
      // Verify the offer was saved correctly by re-fetching from database
      let verifyOffer = null;
      try {
        verifyOffer = await offerRepo.findOne({ where: { _id: new ObjectId(offerId) } as any } as any);
        if (!verifyOffer) {
          // Try alternative ID formats
          verifyOffer = await offerRepo.findOne({ where: { _id: offerId } as any } as any);
        }
      } catch (verifyError) {
        console.error(`[ERROR] Failed to verify offer:`, verifyError);
      }
      
      if (verifyOffer) {
        const verifyStatus = verifyOffer.status || (verifyOffer as any).status;
        console.log(`[INFO] Offer ${offerId} verified from database. Status: ${verifyStatus}`);
        if (verifyStatus !== rejectedStatus) {
          console.error(`[ERROR] Offer status not updated in database! Expected: ${rejectedStatus}, Got: ${verifyStatus}`);
          // Try to update again with explicit update() method
          try {
            await offerRepo.update({ _id: new ObjectId(offerId) } as any, { status: rejectedStatus } as any);
            console.log(`[INFO] Attempted to update offer status using update() method as fallback`);
            // Re-verify after update
            const reVerifyOffer = await offerRepo.findOne({ where: { _id: new ObjectId(offerId) } as any } as any);
            if (reVerifyOffer) {
              const reVerifyStatus = reVerifyOffer.status || (reVerifyOffer as any).status;
              console.log(`[INFO] Offer status after update() fallback: ${reVerifyStatus}`);
            }
          } catch (updateError) {
            console.error(`[ERROR] Failed to update offer using update() method:`, updateError);
          }
        } else {
          console.log(`[SUCCESS] Offer ${offerId} status successfully updated to REJECTED in database`);
        }
      } else {
        console.error(`[ERROR] Could not verify offer ${offerId} from database after save`);
      }
      
      // Use the verified offer if available, otherwise use saved result
      const updatedOffer = verifyOffer || (Array.isArray(savedOfferResult) ? savedOfferResult[0] : savedOfferResult);

      // Update hasOffers flag (offers still exist, just status changed)
      await this.updateBookingHasOffersFlag(actualBookingId);

      // Check if all offers are now rejected - if so, update booking status to rejected
      // Otherwise, keep booking status as pending
      const allUnifiedOffers = await this.offerRepo.find({ where: { bookingId: actualBookingId } as any } as any);
      const allVendorOffers = await this.vendorOfferRepo.find({ where: { bookingId: actualBookingId } as any } as any);
      const allAdminOffers = await this.adminOfferRepo.find({ where: { bookingId: actualBookingId } as any } as any);
      
      const allOffers = [...allUnifiedOffers, ...allVendorOffers, ...allAdminOffers];
      const hasPendingOffers = allOffers.some((o: any) => {
        const status = o.status || (o as any).status;
        return status === OfferStatus.PENDING || 
               status === UnifiedOfferStatus.PENDING || 
               status === AdminOfferStatus.PENDING;
      });
      const hasAcceptedOffers = allOffers.some((o: any) => {
        const status = o.status || (o as any).status;
        return status === OfferStatus.ACCEPTED || 
               status === UnifiedOfferStatus.ACCEPTED || 
               status === AdminOfferStatus.ACCEPTED;
      });
      
      // Determine booking status:
      // - If an offer is accepted, booking should be confirmed (but this shouldn't happen if we're rejecting)
      // - If all offers are rejected and no pending offers, booking status should be rejected
      // - Otherwise, keep as pending
      let newBookingStatus = (booking as any).bookingStatus || BookingStatus.PENDING;
      if (hasAcceptedOffers) {
        newBookingStatus = BookingStatus.CONFIRMED;
      } else if (!hasPendingOffers && allOffers.length > 0) {
        // All offers are rejected, no pending offers
        newBookingStatus = BookingStatus.REJECTED;
        console.log(`[INFO] All offers rejected for booking ${actualBookingId}, updating booking status to REJECTED`);
      } else {
        // Still has pending offers, keep as pending
        newBookingStatus = BookingStatus.PENDING;
      }
      
      // Refresh booking from database to get latest state
      let refreshedBooking = await this.bookingRepo.findOne({ where: { bookingId: actualBookingId } as any } as any);
      if (!refreshedBooking && ObjectId.isValid(actualBookingId)) {
        try {
          const objectId = new ObjectId(actualBookingId);
          refreshedBooking = await this.bookingRepo.findOne({ where: { _id: objectId } as any } as any);
        } catch (error) {
          console.log('Error searching by ObjectId:', error);
        }
      }

      if (refreshedBooking) {
        // Use Object.assign to ensure proper update (same approach as accept flow)
        Object.assign(refreshedBooking, {
          updatedAt: new Date(),
          bookingStatus: newBookingStatus,
        });
        const savedBooking = await this.bookingRepo.save(refreshedBooking);
        const finalBookingStatus = (savedBooking as any)?.bookingStatus || (Array.isArray(savedBooking) ? (savedBooking[0] as any)?.bookingStatus : newBookingStatus);
        console.log(`[INFO] Booking ${actualBookingId} updated after offer rejection. Status: ${finalBookingStatus} (was: ${(booking as any).bookingStatus})`);
      } else {
        console.error(`[ERROR] Could not find booking ${actualBookingId} to update after offer rejection`);
      }

      // Send notification
      try {
        const offerUserId = offer.userId || offer.vendorId || (offer as any).userId;
        if (offerUserId) {
          const offerUser = await this.userService.findById(offerUserId);
          if (offerUser) {
            await this.notificationService.create({
              title: 'Offer Rejected',
              message: `Your offer for booking ${actualBookingId} has been rejected.`,
              recipientId: offerUserId,
              recipientEmail: offerUser.email,
            });
          }
        }
      } catch (error) {
        console.error('Error sending rejection notification:', error);
      }

      // Get the final booking status from the saved booking
      let finalBookingStatus = newBookingStatus;
      if (refreshedBooking) {
        // Re-fetch to get the latest status after save
        const latestBooking = await this.bookingRepo.findOne({ where: { bookingId: actualBookingId } as any } as any);
        if (latestBooking) {
          finalBookingStatus = (latestBooking as any).bookingStatus || newBookingStatus;
        }
      }

      return {
        offer: updatedOffer,
        bookingStatus: finalBookingStatus, // Booking status: rejected if all offers rejected, otherwise pending
      };
    }

    // Handle ACCEPT action
    // Only allow accepting if the offer is pending
    if (!isPending) {
      throw new BadRequestException(`Cannot accept an offer that is ${currentStatus}. Only pending offers can be accepted.`);
    }

    // Check if another offer was already accepted (check all collections)
    const acceptedUnifiedOffer = await this.offerRepo.findOne({
      where: {
        bookingId: actualBookingId,
        status: UnifiedOfferStatus.ACCEPTED,
      } as any,
    });
    const acceptedVendorOffer = await this.vendorOfferRepo.findOne({
      where: {
        bookingId: actualBookingId,
        status: OfferStatus.ACCEPTED,
      } as any,
    });
    const acceptedAdminOffer = await this.adminOfferRepo.findOne({
      where: {
        bookingId: actualBookingId,
        status: AdminOfferStatus.ACCEPTED,
      } as any,
    });

    const acceptedOffer = acceptedUnifiedOffer || acceptedVendorOffer || acceptedAdminOffer;
    if (acceptedOffer) {
      const acceptedOfferId = (acceptedOffer as any).id || (acceptedOffer as any)._id?.toString() || '';
      if (acceptedOfferId !== offerId) {
        throw new BadRequestException('Another offer has already been accepted for this booking');
      }
    }

    // Update offer status to accepted
    offer.status = offerType === 'unified' ? UnifiedOfferStatus.ACCEPTED : 
                   offerType === 'admin' ? AdminOfferStatus.ACCEPTED : 
                   OfferStatus.ACCEPTED;
    const updatedOffer = await offerRepo.save(offer);

    // Reject all other pending offers for this booking (from all collections)
    const otherUnifiedOffers = await this.offerRepo.find({
      where: {
        bookingId: actualBookingId,
        status: UnifiedOfferStatus.PENDING,
      } as any,
    });
    const otherVendorOffers = await this.vendorOfferRepo.find({
      where: {
        bookingId: actualBookingId,
        status: OfferStatus.PENDING,
      } as any,
    });
    const otherAdminOffers = await this.adminOfferRepo.find({
      where: {
        bookingId: actualBookingId,
        status: AdminOfferStatus.PENDING,
      } as any,
    });

    // Reject all other unified offers
    for (const otherOffer of otherUnifiedOffers) {
      const otherOfferId = String((otherOffer as any)._id || (otherOffer as any).id);
      if (otherOfferId !== offerId) {
        otherOffer.status = UnifiedOfferStatus.REJECTED;
        await this.offerRepo.save(otherOffer);
      }
    }

    // Reject all other vendor offers
    for (const otherOffer of otherVendorOffers) {
      const otherOfferId = String((otherOffer as any)._id || (otherOffer as any).id);
      if (otherOfferId !== offerId) {
        otherOffer.status = OfferStatus.REJECTED;
        await this.vendorOfferRepo.save(otherOffer);
      }
    }

    // Reject all other admin offers
    for (const otherOffer of otherAdminOffers) {
      const otherOfferId = String((otherOffer as any)._id || (otherOffer as any).id);
      if (otherOfferId !== offerId) {
        otherOffer.status = AdminOfferStatus.REJECTED;
        await this.adminOfferRepo.save(otherOffer);
      }
    }

    // Update booking status to confirmed
    Object.assign(booking, { bookingStatus: BookingStatus.CONFIRMED });
    await this.bookingRepo.save(booking);

    // Update hasOffers flag (offers still exist, just status changed)
    await this.updateBookingHasOffersFlag(actualBookingId);

    // Create or activate chat session
    let chatId: string | undefined;
    try {
      // Check if chat already exists by trying to get messages for this booking
      const existingMessages = await this.chatService.getMessages(userId, actualBookingId, 1, 1);
      
      if (existingMessages.data && existingMessages.data.length > 0) {
        chatId = existingMessages.data[0].chatId;
      } else {
        // Create initial chat message to initiate chat
        // Get the vendor/user ID from the offer
        const offerUserId = offer.userId || offer.vendorId || (offer as any).userId;
        let receiverId: string | null = null;

        if (offerType === 'vendor' && offer.vendorId) {
          // For vendor offers, find the enterprise admin
          const vendor = await this.vendorRepo.findOne({
            where: { _id: new ObjectId(offer.vendorId), isDeleted: false } as any,
          } as any);

          if (vendor && (vendor as any).enterpriseId) {
            // Find enterprise admin user
            const adminUsers = await this.userService['userRepository'].find({
              where: {
                enterpriseId: (vendor as any).enterpriseId,
                isEnterpriseAdmin: true,
                isDeleted: false,
              } as any,
            });

            if (adminUsers && adminUsers.length > 0) {
              const adminUser = adminUsers[0];
              receiverId = String((adminUser as any).id || (adminUser as any)._id || adminUser);
            }
          }
        } else if (offerUserId) {
          // For unified/admin offers, use the userId directly
          receiverId = offerUserId;
        }

        if (receiverId) {
          // Get offer amount (different field names in different offer types)
          const offerAmount = offer.offerAmount || offer.amount || 0;

          // Create initial message to initiate chat using ChatService
          const initialMessage = await this.chatService.createMessage(userId, {
            senderId: userId,
            receiverId: receiverId,
            bookingId: actualBookingId,
            message: `I have accepted your offer of ₹${offerAmount}. Let's discuss the details.`,
            messageType: 'text',
          });

          chatId = initialMessage.chatId;
        }
      }
    } catch (error) {
      console.error('Error creating/activating chat session:', error);
      // Don't fail the offer acceptance if chat creation fails
    }

    // Send notifications
    try {
      // Get offer amount and user ID
      const offerAmount = offer.offerAmount || offer.amount || 0;
      const offerUserId = offer.userId || offer.vendorId || (offer as any).userId;

      // Notify the offer submitter
      if (offerUserId) {
        let recipientId: string | null = null;
        let recipientEmail: string | null = null;

        if (offerType === 'vendor' && offer.vendorId) {
          // For vendor offers, find the enterprise admin
          const vendor = await this.vendorRepo.findOne({
            where: { _id: new ObjectId(offer.vendorId), isDeleted: false } as any,
          } as any);

          if (vendor && (vendor as any).enterpriseId) {
            const adminUsers = await this.userService['userRepository'].find({
              where: {
                enterpriseId: (vendor as any).enterpriseId,
                isEnterpriseAdmin: true,
                isDeleted: false,
              } as any,
            });

            if (adminUsers && adminUsers.length > 0) {
              const adminUser = adminUsers[0];
              recipientId = String((adminUser as any).id || (adminUser as any)._id || adminUser);
              recipientEmail = adminUser.email;
            }
          }
        } else {
          // For unified/admin offers, use the userId directly
          const offerUser = await this.userService.findById(offerUserId);
          if (offerUser) {
            recipientId = offerUserId;
            recipientEmail = offerUser.email;
          }
        }

        if (recipientId && recipientEmail) {
          await this.notificationService.create({
            title: 'Offer Accepted',
            message: `Your offer of ₹${offerAmount} for booking ${actualBookingId} has been accepted.`,
            recipientId: recipientId,
            recipientEmail: recipientEmail,
          });
        }
      }

      // Notify booking user
      const user = await this.userService.findById(userId);
      if (user) {
        await this.notificationService.create({
          title: 'Offer Accepted Successfully',
          message: `You have accepted the offer of ₹${offerAmount} for booking ${actualBookingId}.`,
          recipientId: userId,
          recipientEmail: user.email,
        });
      }
    } catch (error) {
      console.error('Error sending notifications for offer acceptance:', error);
    }

    return {
      offer: updatedOffer,
      chatId,
      bookingStatus: BookingStatus.CONFIRMED,
    };
  }

  /**
   * Submit an admin/enterprise offer for a booking
   */
  async submitAdminOffer(bookingId: string, dto: CreateAdminOfferDto, userId: string): Promise<AdminOffer> {
    // Find booking
    let booking = await this.bookingRepo.findOne({ where: { bookingId } as any } as any);
    if (!booking && ObjectId.isValid(bookingId)) {
      try {
        const objectId = new ObjectId(bookingId);
        booking = await this.bookingRepo.findOne({ where: { _id: objectId } as any } as any);
      } catch (error) {
        console.log('Error searching by ObjectId:', error);
      }
    }

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Verify booking status allows offers
    const currentStatus = ((booking as any).bookingStatus || '').toLowerCase();
    if (currentStatus === 'cancelled' || currentStatus === 'completed' || currentStatus === 'confirmed') {
      throw new BadRequestException('Cannot submit offer for a cancelled, completed, or confirmed booking');
    }

    // Verify user exists
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if admin already submitted an offer for this booking
    const existingOffer = await this.adminOfferRepo.findOne({
      where: {
        bookingId: (booking as any).bookingId || bookingId,
        userId: userId,
        status: { $ne: AdminOfferStatus.REJECTED } as any,
      } as any,
    });

    if (existingOffer) {
      throw new BadRequestException('You have already submitted an offer for this booking');
    }

    // Create admin offer
    const offer = this.adminOfferRepo.create({
      bookingId: (booking as any).bookingId || bookingId,
      userId: userId,
      offerAmount: dto.offer_amount,
      extraServices: dto.extra_services || [],
      notes: dto.notes,
      status: AdminOfferStatus.PENDING,
    });

    const savedOffer = await this.adminOfferRepo.save(offer);

    // Update hasOffers flag for the booking
    await this.updateBookingHasOffersFlag((booking as any).bookingId || bookingId);

    // Send notification to booking user
    try {
      const bookingUser = await this.userService.findById((booking as any).userId);
      if (bookingUser) {
        await this.notificationService.create({
          title: 'New Admin Offer Received',
          message: `An admin has submitted an offer of ₹${dto.offer_amount} for your booking ${(booking as any).bookingId}`,
          recipientId: (booking as any).userId,
          recipientEmail: bookingUser.email,
        });
      }
    } catch (error) {
      console.error('Error sending notification for admin offer submission:', error);
    }

    return savedOffer;
  }

  /**
   * Add an offer to a booking (unified endpoint for vendors/admins)
   */
  async addOfferToBooking(bookingId: string, dto: CreateOfferDto, authenticatedUserId: string): Promise<Offer & { userName?: string }> {
    // Find booking
    let booking = await this.bookingRepo.findOne({ where: { bookingId } as any } as any);
    if (!booking && ObjectId.isValid(bookingId)) {
      try {
        const objectId = new ObjectId(bookingId);
        booking = await this.bookingRepo.findOne({ where: { _id: objectId } as any } as any);
      } catch (error) {
        console.log('Error searching by ObjectId:', error);
      }
    }

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Verify booking status allows offers
    const currentStatus = ((booking as any).bookingStatus || '').toLowerCase();
    if (currentStatus === 'cancelled' || currentStatus === 'completed' || currentStatus === 'confirmed') {
      throw new BadRequestException('Cannot submit offer for a cancelled, completed, or confirmed booking');
    }

    // Verify user exists
    const user = await this.userService.findById(dto.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user already submitted an offer for this booking
    const existingOffer = await this.offerRepo.findOne({
      where: {
        bookingId: (booking as any).bookingId || bookingId,
        userId: dto.userId,
        status: { $ne: UnifiedOfferStatus.REJECTED } as any,
      } as any,
    });

    if (existingOffer) {
      throw new BadRequestException('You have already submitted an offer for this booking');
    }

    // Create offer
    const offer = this.offerRepo.create({
      bookingId: (booking as any).bookingId || bookingId,
      userId: dto.userId,
      offerAddedBy: authenticatedUserId, // Set offerAddedBy to the authenticated user who is adding the offer
      amount: dto.amount,
      extraServices: dto.extraServices || [],
      notes: dto.notes,
      status: UnifiedOfferStatus.PENDING,
    });

    const savedOffer = await this.offerRepo.save(offer);
    const savedOfferResult = Array.isArray(savedOffer) ? savedOffer[0] : savedOffer;

    // Update hasOffers flag for the booking
    await this.updateBookingHasOffersFlag((booking as any).bookingId || bookingId);

    // Get user name for response based on offerAddedBy (who actually added the offer)
    let userName = 'Unknown User';
    try {
      const userIdToLookup = authenticatedUserId || dto.userId; // Use offerAddedBy (authenticatedUserId) for name lookup
      const offerUser = await this.userService.findById(userIdToLookup);
      if (offerUser) {
        userName = `${offerUser.firstName || ''} ${offerUser.lastName || ''}`.trim() || offerUser.organizationName || 'Unknown User';
      }
    } catch (error) {
      console.error('Error fetching user name:', error);
    }

    // Send notification to booking user
    try {
      const bookingUser = await this.userService.findById((booking as any).userId);
      const bookingUserId = String((bookingUser as any)?.id || (bookingUser as any)?._id || (booking as any).userId || '');
      if (bookingUser && bookingUserId !== dto.userId) {
        await this.notificationService.create({
          title: 'New Offer Received',
          message: `A new offer of ₹${dto.amount} has been submitted for your booking ${(booking as any).bookingId}`,
          recipientId: (booking as any).userId,
          recipientEmail: bookingUser.email,
        });
      }
    } catch (error) {
      console.error('Error sending notification for offer submission:', error);
    }

    return {
      ...savedOfferResult,
      userName,
      offerAddedBy: authenticatedUserId, // Include offerAddedBy in response
    } as Offer & { userName?: string; offerAddedBy?: string };
  }

  /**
   * Get all offers for a booking (unified - returns all offers from vendors and admins)
   * Accessible to all authenticated users
   */
  async getAllOffersForBooking(bookingId: string, userId: string): Promise<Array<Offer & { userName?: string }>> {
    // Find booking
    let booking = await this.bookingRepo.findOne({ where: { bookingId } as any } as any);
    if (!booking && ObjectId.isValid(bookingId)) {
      try {
        const objectId = new ObjectId(bookingId);
        booking = await this.bookingRepo.findOne({ where: { _id: objectId } as any } as any);
      } catch (error) {
        console.log('Error searching by ObjectId:', error);
      }
    }

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    const actualBookingId = (booking as any).bookingId || bookingId;

    // Get all offers from unified offers collection
    const unifiedOffers = await this.offerRepo.find({
      where: { bookingId: actualBookingId } as any,
      order: { createdAt: 'DESC' },
    });

    // Get all vendor offers
    const vendorOffers = await this.vendorOfferRepo.find({
      where: { bookingId: actualBookingId } as any,
      order: { createdAt: 'DESC' },
    });

    // Get all admin offers
    const adminOffers = await this.adminOfferRepo.find({
      where: { bookingId: actualBookingId } as any,
      order: { createdAt: 'DESC' },
    });

    // Helper function to extract ID from MongoDB document
    const extractId = (doc: any): string => {
      // Try _id first (MongoDB ObjectId)
      if (doc._id) {
        return doc._id.toString();
      }
      // Try id field
      if (doc.id) {
        return doc.id.toString();
      }
      // Try offerId field (for unified offers)
      if (doc.offerId) {
        return doc.offerId.toString();
      }
      // If none found, throw error (should not happen)
      throw new Error(`Cannot extract ID from document: ${JSON.stringify(doc)}`);
    };

    // Convert vendor offers to unified format
    const convertedVendorOffers = vendorOffers.map((vo: any) => {
      // Convert extraServices from object array to string array if needed
      let extraServices: string[] = [];
      if (vo.extraServices && Array.isArray(vo.extraServices)) {
        extraServices = vo.extraServices.map((es: any) => {
          if (typeof es === 'string') return es;
          return es.name || JSON.stringify(es);
        });
      }

      return {
        offerId: extractId(vo), // Use consistent ID extraction
        bookingId: vo.bookingId,
        userId: vo.vendorId, // vendorId becomes userId in unified format
        offerAddedBy: vo.offerAddedBy, // Include offerAddedBy field
        amount: vo.offerAmount,
        extraServices: extraServices,
        status: vo.status,
        notes: vo.notes,
        createdAt: vo.createdAt,
        updatedAt: vo.updatedAt,
        _source: 'vendor_offer',
      };
    });

    // Convert admin offers to unified format
    const convertedAdminOffers = adminOffers.map((ao: any) => {
      // Convert extraServices from string array
      let extraServices: string[] = [];
      if (ao.extraServices && Array.isArray(ao.extraServices)) {
        extraServices = ao.extraServices;
      }

      return {
        offerId: extractId(ao), // Use consistent ID extraction
        bookingId: ao.bookingId,
        userId: ao.userId,
        amount: ao.offerAmount,
        extraServices: extraServices,
        status: ao.status,
        notes: ao.notes,
        createdAt: ao.createdAt,
        updatedAt: ao.updatedAt,
        _source: 'admin_offer',
      };
    });

    // Merge all offers and ensure offerAddedBy is set (use userId as fallback if not present)
    // Also ensure offerId is consistently extracted for unified offers
    const allOffers = [
      ...unifiedOffers.map((o: any) => ({ 
        ...o,
        offerId: o.offerId || extractId(o), // Use offerId field if available, otherwise extract from _id
        _source: 'unified_offer',
        offerAddedBy: o.offerAddedBy || o.userId, // Ensure offerAddedBy is set
      })),
      ...convertedVendorOffers,
      ...convertedAdminOffers.map((o: any) => ({
        ...o,
        offerAddedBy: o.offerAddedBy || o.userId, // Ensure offerAddedBy is set for admin offers
      })),
    ];

    // Sort by createdAt descending
    allOffers.sort((a: any, b: any) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    // Enrich offers with user names based on offerAddedBy (or userId as fallback)
    const offersWithUserNames = await Promise.all(
      allOffers.map(async (offer: any) => {
        let userName = 'Unknown User';
        try {
          // Use offerAddedBy if available, otherwise fallback to userId
          const userIdToLookup = offer.offerAddedBy || offer.userId;
          if (userIdToLookup) {
            const user = await this.userService.findById(userIdToLookup);
            if (user) {
              userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.organizationName || 'Unknown User';
            }
          }
        } catch (error) {
          console.error('Error fetching user name:', error);
        }
        return {
          ...offer,
          userName,
        } as Offer & { userName?: string };
      })
    );

    return offersWithUserNames;
  }

  /**
   * Update hasOffers flag for a booking based on actual offer counts
   */
  private async updateBookingHasOffersFlag(bookingId: string): Promise<void> {
    try {
      // Find booking
      let booking = await this.bookingRepo.findOne({ where: { bookingId } as any } as any);
      if (!booking && ObjectId.isValid(bookingId)) {
        try {
          const objectId = new ObjectId(bookingId);
          booking = await this.bookingRepo.findOne({ where: { _id: objectId } as any } as any);
        } catch (error) {
          console.log('Error searching by ObjectId in updateBookingHasOffersFlag:', error);
          return;
        }
      }

      if (!booking) {
        console.log('Booking not found for hasOffers update:', bookingId);
        return;
      }

      const actualBookingId = (booking as any).bookingId || bookingId;

      // Count offers from all collections using find().length for better MongoDB compatibility
      const unifiedOffers = await this.offerRepo.find({
        where: { bookingId: actualBookingId } as any,
      });
      const unifiedOfferCount = unifiedOffers?.length || 0;
      
      const vendorOffers = await this.vendorOfferRepo.find({
        where: { bookingId: actualBookingId } as any,
      });
      const vendorOfferCount = vendorOffers?.length || 0;
      
      const adminOffers = await this.adminOfferRepo.find({
        where: { bookingId: actualBookingId } as any,
      });
      const adminOfferCount = adminOffers?.length || 0;
      
      const hasOffers = unifiedOfferCount > 0 || vendorOfferCount > 0 || adminOfferCount > 0;

      // Update booking with hasOffers flag using save() for MongoDB compatibility
      const previousHasOffers = (booking as any).hasOffers;
      (booking as any).hasOffers = hasOffers;
      
      const savedBooking = await this.bookingRepo.save(booking);
      
      // Verify the update was successful
      const savedHasOffers = (savedBooking as any)?.hasOffers ?? (Array.isArray(savedBooking) ? (savedBooking[0] as any)?.hasOffers : null);
      
      console.log(`Updated hasOffers flag for booking ${actualBookingId}: ${previousHasOffers} -> ${hasOffers} (verified: ${savedHasOffers})`);
      console.log(`Offer counts - unified: ${unifiedOfferCount}, vendor: ${vendorOfferCount}, admin: ${adminOfferCount}`);
      
      if (savedHasOffers !== hasOffers) {
        console.warn(`⚠️ Warning: hasOffers flag update may have failed. Expected: ${hasOffers}, Got: ${savedHasOffers}`);
      }
    } catch (error) {
      console.error('Error updating hasOffers flag for booking:', bookingId, error);
      console.error('Error details:', JSON.stringify(error, null, 2));
    }
  }
}

