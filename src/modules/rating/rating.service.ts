import { Injectable, BadRequestException, Inject, forwardRef, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { Rating } from './entity/rating.entity';
import { CreateRatingDto } from './dto/request/create-rating.dto';
import { UserFeedbackDto } from './dto/request/user-feedback.dto';
import { UserFeedbackResponseDto } from './dto/response/user-feedback-response.dto';
import { plainToInstance } from 'class-transformer';
import { VendorService } from '../vendor/vendor.service';
import { VenueService } from '../venue/venue.service';
import { BookingService } from '../booking/booking.service';
import { VenueBookingService } from '../venue-booking/venue-booking.service';
import { UserService } from '../user/user.service';
import { RatingWithUserResponseDto } from './dto/response/rating-with-user-response.dto';

@Injectable()
export class RatingService {
  constructor(
    @InjectRepository(Rating, 'mongo')
    private readonly ratingRepo: MongoRepository<Rating>,
    @Inject(forwardRef(() => VendorService))
    private readonly vendorService: VendorService,
    @Inject(forwardRef(() => VenueService))
    private readonly venueService: VenueService,
    @Inject(forwardRef(() => BookingService))
    private readonly bookingService: BookingService,
    @Inject(forwardRef(() => VenueBookingService))
    private readonly venueBookingService: VenueBookingService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  async createRating(createRatingDto: CreateRatingDto, userId: string): Promise<Rating> {
    const { bookingId, entityId, entityType, score, review } = createRatingDto;
    if (!ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID format');
    }
    if (!ObjectId.isValid(entityId)) {
      throw new BadRequestException('Invalid entity ID format');
    }

    // Validate that the booking exists and belongs to the authenticated user
    await this.validateBookingOwnership(bookingId, userId, entityId, entityType);

    // Check if user has already rated this entity for this booking
    const existingRating = await this.ratingRepo.findOne({
      where: {
        userId: userId,
        bookingId: bookingId,
        entityId: entityId,
        entityType: entityType,
      },
    });

    if (existingRating) {
      throw new BadRequestException('You have already rated this entity for this booking');
    }

    const rating = this.ratingRepo.create({
      userId,
      bookingId,
      entityId,
      entityType,
      score,
      review,
    });

    const savedRating = await this.ratingRepo.save(rating);

    // Trigger update of aggregated rating in Vendor or Venue entity
    if (entityType === 'vendor') {
      await this.vendorService.updateAggregatedRating(entityId);
    } else if (entityType === 'venue') {
      await this.venueService.updateAggregatedRating(entityId);
    }

    return savedRating;
  }

  private async validateBookingOwnership(
    bookingId: string,
    userId: string,
    entityId: string,
    entityType: 'vendor' | 'venue'
  ): Promise<void> {
    try {
      let booking = null;
      try {
        booking = await this.bookingService.findByBookingId(bookingId);
      } catch (error) {
        try {
          booking = await this.venueBookingService.findOne(bookingId);
        } catch (venueBookingError) {
          throw new NotFoundException('Booking not found');
        }
      }

      // Validate booking ownership
      if ((booking as any).userId !== userId) {
        throw new BadRequestException('You can only rate entities from your own bookings');
      }

      // Validate that the booking is for the correct entity
      const bookingEntityId = (booking as any).venueId;
      if (bookingEntityId !== entityId) {
        throw new BadRequestException('The booking does not match the entity being rated');
      }

      // // Validate that the booking status allows rating (completed bookings only)
      // const bookingStatus = (booking as any).bookingStatus;
      // if (bookingStatus !== 'COMPLETED') {
      //   throw new BadRequestException('You can only rate entities from completed bookings');
      // }

    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to validate booking ownership');
    }
  }

  async findRatingsByEntity(entityId: string, entityType: 'vendor' | 'venue'): Promise<RatingWithUserResponseDto[]> {
    if (!ObjectId.isValid(entityId)) {
      throw new BadRequestException('Invalid entity ID format');
    }
    
    const ratings = await this.ratingRepo.find({ where: { entityId, entityType } });
    
    // Fetch user information for each rating
    const ratingsWithUsers = await Promise.all(
      ratings.map(async (rating) => {
        try {
          // Get user information
          const user = await this.userService.findById(rating.userId);
          
          // Handle user image URL - use dummy URL for local uploads
          let userImageUrl = user?.profileImage || null;
          if (userImageUrl && userImageUrl.startsWith('/uploads/')) {
            // Use dummy URL until AWS is configured
            userImageUrl = 'https://media2.dev.to/dynamic/image/width=320,height=320,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Fuser%2Fprofile_image%2F483102%2F6d940290-12d0-4c4a-8be9-1a9fc955d203.jpeg';
          }

          return {
            id: rating.id,
            userId: rating.userId,
            userName: user?.firstName + ' ' + user?.lastName || 'Unknown User',
            userImage: userImageUrl,
            bookingId: rating.bookingId,
            entityId: rating.entityId,
            entityType: rating.entityType,
            score: rating.score,
            review: rating.review,
            createdAt: rating.createdAt,
            updatedAt: rating.updatedAt,
          };
        } catch (error) {
          // If user not found, return rating without user info
          return {
            id: rating.id,
            userId: rating.userId,
            userName: 'Unknown User',
            userImage: null,
            bookingId: rating.bookingId,
            entityId: rating.entityId,
            entityType: rating.entityType,
            score: rating.score,
            review: rating.review,
            createdAt: rating.createdAt,
            updatedAt: rating.updatedAt,
          };
        }
      })
    );
    
    return plainToInstance(RatingWithUserResponseDto, ratingsWithUsers, {
      excludeExtraneousValues: true,
    });
  }

  async submitUserFeedback(userFeedbackDto: UserFeedbackDto, userId: string): Promise<UserFeedbackResponseDto> {
    const { rating, feedback, id, bookingType } = userFeedbackDto;

    // Validate entity ID format
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid entity ID format');
    }

    // Check if user has already rated this entity
    const existingRating = await this.ratingRepo.findOne({
      where: {
        userId,
        entityId: id,
        entityType: bookingType,
      },
    });

    if (existingRating) {
      throw new BadRequestException('You have already rated this entity');
    }

    // Create the rating
    const ratingData = this.ratingRepo.create({
      userId,
      entityId: id,
      entityType: bookingType,
      score: rating,
      review: feedback,
      bookingId: `USER_FEEDBACK_${Date.now()}`, // Generate a unique booking ID for user feedback
    });

    const savedRating = await this.ratingRepo.save(ratingData);

    // Update the entity's average rating
    await this.updateEntityRating(id, bookingType);

    return plainToInstance(UserFeedbackResponseDto, savedRating, {
      excludeExtraneousValues: true,
    });
  }

  private async updateEntityRating(entityId: string, entityType: 'vendor' | 'venue'): Promise<void> {
    try {
      // Get all ratings for this entity
      const ratings = await this.ratingRepo.find({
        where: {
          entityId,
          entityType,
        },
      });

      if (ratings.length === 0) return;

      // Calculate average rating
      const totalScore = ratings.reduce((sum, rating) => sum + rating.score, 0);
      const averageRating = totalScore / ratings.length;

      // Update the entity's rating
      if (entityType === 'vendor') {
        await this.vendorService.updateRating(entityId, averageRating, ratings.length);
      } else if (entityType === 'venue') {
        await this.venueService.updateRating(entityId, averageRating, ratings.length);
      }
    } catch (error) {
      console.error('Failed to update entity rating:', error);
      // Don't throw error as this is not critical for the user feedback submission
    }
  }
}
