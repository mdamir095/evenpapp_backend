import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { VenueBookingService } from './venue-booking.service';
import { CreateVenueBookingDto } from './dto/request/create-venue-booking.dto';
import { UpdateVenueBookingDto } from './dto/request/update-venue-booking.dto';
import { VenueBookingResponseDto } from './dto/response/venue-booking-response.dto';
import { BookingStatus } from '@shared/enums/bookingStatus';
import { FeatureGuard } from '@common/guards/features.guard';
import { FeatureType } from '@shared/enums/featureType';
import { AuthGuard } from '@nestjs/passport';
import { Features } from '@common/decorators/permission.decorator';

@ApiTags('Venue Booking')
@Controller('venue-booking')
@ApiBearerAuth()
@UsePipes(new ValidationPipe({ transform: true }))
@UseGuards(AuthGuard('jwt'), FeatureGuard)
@Features(FeatureType.VENUE_BOOKING)
export class VenueBookingController {
  constructor(private readonly venueBookingService: VenueBookingService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new venue booking' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Venue booking created successfully',
    type: VenueBookingResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Venue is already booked for the selected time slot',
  })
  create(@Body() createVenueBookingDto: CreateVenueBookingDto) {
    return this.venueBookingService.create(createVenueBookingDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all venue bookings' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: BookingStatus,
    description: 'Filter by booking status',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of venue bookings',
    type: [VenueBookingResponseDto],
  })
  findAll(@Query('status') status?: BookingStatus) {
    if (status) {
      return this.venueBookingService.findByStatus(status);
    }
    return this.venueBookingService.findAll();
  }

  @Get('event/:eventId')
  @ApiOperation({ summary: 'Get venue bookings by event ID' })
  @ApiParam({ name: 'eventId', description: 'Event ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Venue bookings for the event',
    type: [VenueBookingResponseDto],
  })
  findByEventId(@Param('eventId') eventId: string) {
    return this.venueBookingService.findByEventId(eventId);
  }

  @Get('venue/:venueId')
  @ApiOperation({ summary: 'Get venue bookings by venue ID' })
  @ApiParam({ name: 'venueId', description: 'Venue ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Venue bookings for the venue',
    type: [VenueBookingResponseDto],
  })
  findByVenueId(@Param('venueId') venueId: string) {
    return this.venueBookingService.findByVenueId(venueId);
  }

  @Get(':key')
  @ApiOperation({ summary: 'Get a venue booking by key' })
  @ApiParam({ name: 'key', description: 'Venue booking key' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Venue booking details',
    type: VenueBookingResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Venue booking not found',
  })
  findOne(@Param('key') key: string) {
    return this.venueBookingService.findOne(key);
  }

  @Patch(':key')
  @ApiOperation({ summary: 'Update a venue booking' })
  @ApiParam({ name: 'key', description: 'Venue booking key' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Venue booking updated successfully',
    type: VenueBookingResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Venue booking not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Venue is already booked for the selected time slot',
  })
  update(
    @Param('key') key: string,
    @Body() updateVenueBookingDto: UpdateVenueBookingDto,
  ) {
    return this.venueBookingService.update(key, updateVenueBookingDto);
  }

  @Delete(':key')
  @ApiOperation({ summary: 'Delete a venue booking' })
  @ApiParam({ name: 'key', description: 'Venue booking key' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Venue booking deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Venue booking not found',
  })
  remove(@Param('key') key: string) {
    return this.venueBookingService.remove(key);
  }

  @Patch(':key/confirm')
  @ApiOperation({ summary: 'Confirm a venue booking' })
  @ApiParam({ name: 'key', description: 'Venue booking key' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Venue booking confirmed successfully',
    type: VenueBookingResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Venue booking not found',
  })
  confirmBooking(@Param('key') key: string) {
    return this.venueBookingService.confirmBooking(key);
  }

  @Patch(':key/cancel')
  @ApiOperation({ summary: 'Cancel a venue booking' })
  @ApiParam({ name: 'key', description: 'Venue booking key' })
  @ApiQuery({
    name: 'reason',
    required: false,
    description: 'Cancellation reason',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Venue booking cancelled successfully',
    type: VenueBookingResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Venue booking not found',
  })
  cancelBooking(
    @Param('key') key: string,
    @Query('reason') reason?: string,
  ) {
    return this.venueBookingService.cancelBooking(key, reason);
  }

  @Patch(':key/complete')
  @ApiOperation({ summary: 'Mark a venue booking as completed' })
  @ApiParam({ name: 'key', description: 'Venue booking key' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Venue booking completed successfully',
    type: VenueBookingResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Venue booking not found',
  })
  completeBooking(@Param('key') key: string) {
    return this.venueBookingService.completeBooking(key);
  }

  @Patch(':key/payment')
  @ApiOperation({ summary: 'Update payment status for a venue booking' })
  @ApiParam({ name: 'key', description: 'Venue booking key' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment status updated successfully',
    type: VenueBookingResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Venue booking not found',
  })
  updatePaymentStatus(
    @Param('key') key: string,
    @Body()
    paymentData: {
      paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
      transactionId?: string;
    },
  ) {
    return this.venueBookingService.updatePaymentStatus(
      key,
      paymentData.paymentStatus,
      paymentData.transactionId,
    );
  }
}