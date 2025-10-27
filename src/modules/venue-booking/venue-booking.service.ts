import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository, ObjectId } from 'typeorm';
import { VenueBooking } from './entities/venue-booking.entity';
import { CreateVenueBookingDto } from './dto/request/create-venue-booking.dto';
import { UpdateVenueBookingDto } from './dto/request/update-venue-booking.dto';
import { BookingStatus } from '@shared/enums/bookingStatus';

@Injectable()
export class VenueBookingService {
  constructor(
    @InjectRepository(VenueBooking, 'mongo')
    private readonly venueBookingRepo: MongoRepository<VenueBooking>,
  ) {}

  async create(createDto: CreateVenueBookingDto): Promise<VenueBooking> {
    // Check for conflicting bookings
    const conflictingBooking = await this.checkBookingConflict(
      createDto.venueId,
      new Date(createDto.startDateTime),
      new Date(createDto.endDateTime)
    );

    if (conflictingBooking) {
      throw new BadRequestException('Venue is already booked for the selected time slot');
    }

    const venueBooking = this.venueBookingRepo.create({
      ...createDto,
      startDateTime: new Date(createDto.startDateTime),
      endDateTime: new Date(createDto.endDateTime),
      bookingStatus: createDto.bookingStatus || BookingStatus.PENDING,
    });

    return this.venueBookingRepo.save(venueBooking);
  }

  async findAll(): Promise<VenueBooking[]> {
    return this.venueBookingRepo.find({
      where: { isDeleted: false },
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(key: string): Promise<VenueBooking> {
    const booking = await this.venueBookingRepo.findOne({
      where: { key, isDeleted: false }
    });

    if (!booking) {
      throw new NotFoundException('Venue booking not found');
    }

    return booking;
  }

  async findByEventId(eventId: string): Promise<VenueBooking[]> {
    return this.venueBookingRepo.find({
      where: { eventId, isDeleted: false },
      order: { createdAt: 'DESC' }
    });
  }

  async findByVenueId(venueId: string): Promise<VenueBooking[]> {
    return this.venueBookingRepo.find({
      where: { venueId, isDeleted: false },
      order: { createdAt: 'DESC' }
    });
  }

  async findByStatus(status: BookingStatus): Promise<VenueBooking[]> {
    return this.venueBookingRepo.find({
      where: { bookingStatus: status, isDeleted: false },
      order: { createdAt: 'DESC' }
    });
  }

  async update(key: string, updateDto: UpdateVenueBookingDto): Promise<VenueBooking> {
    const existingBooking = await this.findOne(key);

    // If updating date/time, check for conflicts
    if (updateDto.startDateTime || updateDto.endDateTime) {
      const startDate = updateDto.startDateTime ? new Date(updateDto.startDateTime) : existingBooking.startDateTime;
      const endDate = updateDto.endDateTime ? new Date(updateDto.endDateTime) : existingBooking.endDateTime;
      
      const conflictingBooking = await this.checkBookingConflict(
        existingBooking.venueId,
        startDate,
        endDate,
        key // Exclude current booking from conflict check
      );

      if (conflictingBooking) {
        throw new BadRequestException('Venue is already booked for the selected time slot');
      }
    }

    // Convert date strings to Date objects if provided
    const updateData = {
      ...updateDto,
      ...(updateDto.startDateTime && { startDateTime: new Date(updateDto.startDateTime) }),
      ...(updateDto.endDateTime && { endDateTime: new Date(updateDto.endDateTime) }),
      ...(updateDto.cancellationDate && { cancellationDate: new Date(updateDto.cancellationDate) }),
      updatedAt: new Date(),
    };

    await this.venueBookingRepo.update({ key }, updateData);
    return this.findOne(key);
  }

  async remove(key: string): Promise<{ message: string }> {
    const booking = await this.findOne(key);
    
    await this.venueBookingRepo.update(
      { key },
      { 
        isDeleted: true,
        updatedAt: new Date()
      }
    );

    return { message: 'Venue booking deleted successfully' };
  }

  async confirmBooking(key: string): Promise<VenueBooking> {
    return this.updateBookingStatus(key, BookingStatus.CONFIRMED);
  }

  async cancelBooking(key: string, reason?: string): Promise<VenueBooking> {
    const updateData: Partial<VenueBooking> = {
      bookingStatus: BookingStatus.CANCELLED,
      updatedAt: new Date(),
    };

    if (reason) {
      updateData.cancellationReason = reason;
      updateData.cancellationDate = new Date();
    }

    await this.venueBookingRepo.update({ key }, updateData);
    return this.findOne(key);
  }

  async completeBooking(key: string): Promise<VenueBooking> {
    return this.updateBookingStatus(key, BookingStatus.COMPLETED);
  }

  async updatePaymentStatus(
    key: string, 
    paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED',
    transactionId?: string
  ): Promise<VenueBooking> {
    const booking = await this.findOne(key);
    
    const updatedPaymentDetails = {
      ...booking.paymentDetails,
      paymentStatus,
      ...(transactionId && { transactionId }),
      ...(paymentStatus === 'PAID' && { paidAt: new Date() })
    };

    await this.venueBookingRepo.update(
      { key },
      { 
        paymentDetails: updatedPaymentDetails,
        updatedAt: new Date()
      }
    );

    return this.findOne(key);
  }

  private async updateBookingStatus(key: string, status: BookingStatus): Promise<VenueBooking> {
    await this.venueBookingRepo.update(
      { key },
      { 
        bookingStatus: status,
        updatedAt: new Date()
      }
    );

    return this.findOne(key);
  }

  private async checkBookingConflict(
    venueId: string,
    startDateTime: Date,
    endDateTime: Date,
    excludeKey?: string
  ): Promise<boolean> {
    const query: any = {
      venueId,
      isDeleted: false,
      bookingStatus: { $in: [BookingStatus.CONFIRMED, BookingStatus.PENDING] },
      $or: [
        {
          startDateTime: { $lt: endDateTime },
          endDateTime: { $gt: startDateTime }
        }
      ]
    };

    if (excludeKey) {
      query.key = { $ne: excludeKey };
    }

    const conflictingBooking = await this.venueBookingRepo.findOne({
      where: query
    });

    return !!conflictingBooking;
  }
}