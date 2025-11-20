import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Req,
  Param,
  ParseArrayPipe,
  DefaultValuePipe,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'
import { plainToInstance } from 'class-transformer'
import { ObjectId } from 'mongodb'
import { BookingService } from './booking.service'
import { BookingUserListResponseDto } from './dto/response/booking-user-list-response.dto'
import { CreateRequestBookingDto } from './dto/request/create-request-booking.dto'
import { UpdateBookingDto } from './dto/request/update-booking.dto'
import { CancelBookingDto } from './dto/request/cancel-booking.dto'
import { AcceptBookingDto } from './dto/request/accept-booking.dto'
import { RejectBookingDto } from './dto/request/reject-booking.dto'
import { CreateVendorOfferDto } from './dto/offer/create-vendor-offer.dto'
import { CreateAdminOfferDto } from './dto/offer/create-admin-offer.dto'
import { CreateOfferDto } from './dto/offer/create-offer.dto'
import { AcceptOfferDto } from './dto/offer/accept-offer.dto'
import { RequestBookingResponseDto } from './dto/response/request-booking-response.dto'
import { BookingDetailResponseDto } from './dto/response/booking-detail-response.dto'
import { CancelBookingResponseDto } from './dto/response/cancel-booking-response.dto'
import { AcceptBookingResponseDto } from './dto/response/accept-booking-response.dto'
import { RejectBookingResponseDto } from './dto/response/reject-booking-response.dto'
import { VendorOfferResponseDto, VendorOfferListResponseDto, AcceptOfferResponseDto } from './dto/response/vendor-offer-response.dto'
import { AdminOfferResponseDto } from './dto/response/admin-offer-response.dto'
import { OfferResponseDto } from './dto/response/offer-response.dto'
import { BadRequestException } from '@nestjs/common'

@ApiTags('Booking')
@Controller('booking')
@ApiBearerAuth()
@UsePipes(new ValidationPipe({ transform: true }))
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Get('user')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Get bookings for user',
    description: 'Retrieves venue bookings with venue details for regular users',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String, example: 'Banquet hall mumbai' })
  @ApiQuery({ name: 'bookingType', required: false, enum: ['venue', 'vendor'] })
  @ApiResponse({ status: HttpStatus.OK, type: BookingUserListResponseDto })
  async findAllForUser(
    @Req() req: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('bookingType') bookingType?: 'venue' | 'vendor',
  ): Promise<BookingUserListResponseDto> {
    const userId: string = String(req?.user?.id || req?.user?._id || req?.user?.sub)
    console.log('Booking Controller - User ID for findAllForUser:', userId, 'Type:', typeof userId)
    const data = await this.bookingService.findAllForUser(userId, page, limit, search, bookingType)
    
    return {
      bookings: data.bookings,
      total: data.total,
      page: data.page,
      limit: data.limit,
    }
  }

  @Get('all')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Get all bookings',
    description: 'Retrieves all bookings with pagination, search, and filters',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String, example: 'Wedding' })
  @ApiQuery({ name: 'status', required: false, type: [String], isArray: true, example: ['pending', 'confirmed'] })
  @ApiQuery({ name: 'bookingType', required: false, enum: ['venue', 'vendor'] })
  @ApiQuery({ name: 'dateFrom', required: false, type: String, example: '2025-01-01' })
  @ApiQuery({ name: 'dateTo', required: false, type: String, example: '2025-12-31' })
  @ApiResponse({ status: HttpStatus.OK, type: BookingUserListResponseDto })
  async getAllBookings(
    @Query('page', new DefaultValuePipe(1)) page: number,
    @Query('limit', new DefaultValuePipe(10)) limit: number,
    @Query('search') search?: string,
    @Query('status') status?: string | string[],
    @Query('bookingType') bookingType?: 'venue' | 'vendor',
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ): Promise<BookingUserListResponseDto> {
    // Handle status parameter - support both string and array formats
    let statusFilter: string | string[] | undefined;
    if (status) {
      if (Array.isArray(status)) {
        // Already an array, use as is
        statusFilter = status.length === 1 ? status[0] : status;
      } else if (typeof status === 'string') {
        // If it's a string, check if it contains commas (multiple values)
        if (status.includes(',')) {
          statusFilter = status.split(',').map(s => s.trim()).filter(s => s);
        } else {
          // Single status value
          statusFilter = status.trim();
        }
      }
    }
    
    console.log('Booking Controller - getAllBookings - status parameter:', status);
    console.log('Booking Controller - getAllBookings - statusFilter:', statusFilter);
    
    const data = await this.bookingService.findAllForAdmin(page, limit, search, statusFilter, bookingType, dateFrom, dateTo)
    
    return {
      bookings: data.bookings,
      total: data.total,
      page: data.page,
      limit: data.limit,
    }
  }

  @Get('admin')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Get all bookings for admin',
    description: 'Retrieves all bookings with pagination and search for admin users',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String, example: 'Wedding' })
  @ApiQuery({ name: 'status', required: false, type: [String], isArray: true, example: ['pending', 'confirmed'] })
  @ApiQuery({ name: 'bookingType', required: false, enum: ['venue', 'vendor'] })
  @ApiQuery({ name: 'dateFrom', required: false, type: String, example: '2025-01-01' })
  @ApiQuery({ name: 'dateTo', required: false, type: String, example: '2025-12-31' })
  @ApiResponse({ status: HttpStatus.OK, type: BookingUserListResponseDto })
  async findAllForAdmin(
    @Query('page', new DefaultValuePipe(1)) page: number,
    @Query('limit', new DefaultValuePipe(10)) limit: number,
    @Query('search') search?: string,
    @Query('status') status?: string | string[],
    @Query('bookingType') bookingType?: 'venue' | 'vendor',
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Req() req?: any,
  ): Promise<BookingUserListResponseDto> {
    // Handle status parameter - support both string and array formats (same as /all endpoint)
    let statusFilter: string | string[] | undefined;
    if (status) {
      if (Array.isArray(status)) {
        // Already an array, use as is
        statusFilter = status.length === 1 ? status[0] : status;
      } else if (typeof status === 'string') {
        // If it's a string, check if it contains commas (multiple values)
        if (status.includes(',')) {
          statusFilter = status.split(',').map(s => s.trim()).filter(s => s);
        } else {
          // Single status value
          statusFilter = status.trim();
        }
      }
    }
    
    const authenticatedUserId: string = String(req?.user?.id || req?.user?._id || req?.user?.sub);
    
    console.log('Booking Controller - findAllForAdmin - status parameter:', status);
    console.log('Booking Controller - findAllForAdmin - statusFilter:', statusFilter);
    
    const data = await this.bookingService.findAllForAdmin(page, limit, search, statusFilter, bookingType, dateFrom, dateTo, authenticatedUserId)
    
    return {
      bookings: data.bookings,
      total: data.total,
      page: data.page,
      limit: data.limit,
    }
  }

  @Post('request-booking')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Create a booking request' })
  @ApiResponse({ status: HttpStatus.CREATED, type: RequestBookingResponseDto })
  async createRequestBooking(
    @Body() dto: CreateRequestBookingDto,
    @Req() req: any,
  ): Promise<RequestBookingResponseDto> {
    const userId: string = String(req?.user?.id || req?.user?._id || req?.user?.sub)
    const entity = await this.bookingService.createRequestBooking(dto, userId)
    // Get referenceImages from entity - ensure it's always an array
    let referenceImages = (entity as any).referenceImages || []
    if (!Array.isArray(referenceImages)) {
      referenceImages = []
    }
    
    // Build response object with referenceImages explicitly included
    const responseData: any = {
      ...entity,
      id: (entity as any)?._id?.toString?.() ?? (entity as any)?.id?.toString?.() ?? '',
      referenceImages: referenceImages, // Explicitly set - MUST be included
    }
    
    // Ensure referenceImages property exists
    if (!('referenceImages' in responseData)) {
      responseData.referenceImages = referenceImages
    }
    if (!Array.isArray(responseData.referenceImages)) {
      responseData.referenceImages = referenceImages
    }
    
    const transformedResponse = plainToInstance(
      RequestBookingResponseDto,
      responseData,
      { excludeExtraneousValues: true },
    )
    
    // Explicitly set referenceImages on transformed response to ensure it's included
    ;(transformedResponse as any).referenceImages = responseData.referenceImages
    
    console.log('Booking Controller - Final transformed response referenceImages:', (transformedResponse as any).referenceImages)
    console.log('Booking Controller - Final transformed response referenceImages count:', (transformedResponse as any).referenceImages?.length || 0)
    
    return transformedResponse
  }

  @Post(':bookingId/offers')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Add an offer to a booking',
    description: 'Save a new offer (with offer amount and extra services) for a specific booking, linked to the user/vendor posting the offer'
  })
  @ApiParam({ name: 'bookingId', description: 'Booking ID', example: 'BK-7AA6B9CD' })
  @ApiBody({ type: CreateOfferDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Offer created successfully',
    type: OfferResponseDto
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cannot submit offer (booking not found, or offer already submitted)'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Booking not found'
  })
  async addOfferToBooking(
    @Param('bookingId') bookingId: string,
    @Body() dto: CreateOfferDto,
    @Req() req: any,
  ): Promise<OfferResponseDto> {
    const authenticatedUserId: string = String(req?.user?.id || req?.user?._id || req?.user?.sub);
    
    // Validate that the userId in the body matches the authenticated user (or user has permission)
    if (dto.userId !== authenticatedUserId) {
      // Allow if user is admin/enterprise admin, otherwise require match
      const user = await this.bookingService['userService'].findById(authenticatedUserId);
      if (!user || (!user.isEnterpriseAdmin && authenticatedUserId !== dto.userId)) {
        throw new BadRequestException('userId must match the authenticated user or you must be an admin');
      }
    }
    
    const data = await this.bookingService.addOfferToBooking(bookingId, dto, authenticatedUserId);
    
    return plainToInstance(OfferResponseDto, {
      offerId: data.offerId,
      bookingId: data.bookingId,
      userId: data.userId,
      userName: (data as any).userName,
      offerAddedBy: (data as any).offerAddedBy,
      amount: data.amount,
      extraServices: data.extraServices,
      notes: data.notes,
      createdAt: data.createdAt,
    }, { excludeExtraneousValues: true });
  }

  @Get(':bookingId/offers')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'List all offers for a booking',
    description: 'Return all offers made on this booking, including userId and offer details. Accessible to all authenticated users.'
  })
  @ApiParam({ name: 'bookingId', description: 'Booking ID', example: 'BK-7AA6B9CD' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of offers',
    type: [OfferResponseDto]
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Booking not found'
  })
  async getBookingOffers(
    @Param('bookingId') bookingId: string,
    @Req() req: any,
  ): Promise<OfferResponseDto[]> {
    const userId: string = String(req?.user?.id || req?.user?._id || req?.user?.sub);
    const offers = await this.bookingService.getAllOffersForBooking(bookingId, userId);
    
    return offers.map(offer => {
      // Ensure extraServices is always a string array
      let extraServices: string[] = [];
      if (offer.extraServices) {
        if (Array.isArray(offer.extraServices)) {
          extraServices = offer.extraServices.map((es: any) => {
            if (typeof es === 'string') return es;
            if (typeof es === 'object' && es.name) return es.name;
            return JSON.stringify(es);
          });
        }
      }

      return plainToInstance(OfferResponseDto, {
        offerId: offer.offerId,
        bookingId: offer.bookingId,
        userId: offer.userId,
        userName: (offer as any).userName,
        offerAddedBy: (offer as any).offerAddedBy,
        amount: offer.amount,
        extraServices: extraServices,
        notes: offer.notes,
        createdAt: offer.createdAt,
      }, { excludeExtraneousValues: true });
    });
  }

  @Get(':bookingId')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get booking details by bookingId' })
  @ApiParam({ name: 'bookingId', description: 'Booking ID', example: 'BK-A9098A0F' })
  @ApiResponse({ status: HttpStatus.OK, type: BookingDetailResponseDto })
  async findByBookingId(
    @Param('bookingId') bookingId: string,
    @Req() req: any,
  ): Promise<BookingDetailResponseDto> {
    const userId: string = String(req?.user?.id || req?.user?._id || req?.user?.sub)
    console.log('findByBookingId Controller - User from JWT:', req?.user);
    console.log('findByBookingId Controller - Extracted userId:', userId, 'Type:', typeof userId);
    const data = await this.bookingService.findByBookingId(bookingId, userId)
    
    return plainToInstance(BookingDetailResponseDto, data, { excludeExtraneousValues: true })
  }

  @Post('accept')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ 
    summary: 'Accept a booking',
    description: 'Allows admins/enterprises to accept a pending venue booking. Vendors cannot accept bookings - they must submit offers instead.'
  })
  @ApiBody({ type: AcceptBookingDto })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Booking accepted successfully',
    type: AcceptBookingResponseDto 
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Cannot accept booking (already confirmed, cancelled, completed, rejected, or is a vendor booking)' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Booking not found' 
  })
  async acceptBooking(
    @Body() dto: AcceptBookingDto,
    @Req() req: any,
  ): Promise<AcceptBookingResponseDto> {
    const userId: string = String(req?.user?.id || req?.user?._id || req?.user?.sub)
    console.log('Accept Booking Controller - User from JWT:', req?.user);
    console.log('Accept Booking Controller - Extracted userId:', userId, 'Type:', typeof userId);
    
    // Check if booking is a vendor booking - vendors cannot accept bookings directly
    const booking = await this.bookingService.findByBookingId(dto.bookingId, userId);
    if (booking && (booking as any).bookingType === 'vendor') {
      throw new BadRequestException('Vendors cannot accept bookings directly. Please submit an offer instead using the /bookings/{bookingId}/vendor-offer endpoint.');
    }
    
    const data = await this.bookingService.acceptBooking(dto.bookingId, dto, userId)
    
    return plainToInstance(AcceptBookingResponseDto, {
      id: data.id || data._id,
      bookingId: data.bookingId,
      bookingStatus: data.bookingStatus,
      notes: data.notes,
      updatedAt: data.updatedAt,
    }, { excludeExtraneousValues: true })
  }

  @Post('reject')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ 
    summary: 'Reject a booking',
    description: 'Allows admins/enterprises to reject a pending venue booking. Vendors cannot reject bookings - they simply do not submit offers.'
  })
  @ApiBody({ type: RejectBookingDto })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Booking rejected successfully',
    type: RejectBookingResponseDto 
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Cannot reject booking (already rejected, cancelled, completed, confirmed, or is a vendor booking)' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Booking not found' 
  })
  async rejectBooking(
    @Body() dto: RejectBookingDto,
    @Req() req: any,
  ): Promise<RejectBookingResponseDto> {
    const userId: string = String(req?.user?.id || req?.user?._id || req?.user?.sub)
    console.log('Reject Booking Controller - User from JWT:', req?.user);
    console.log('Reject Booking Controller - Extracted userId:', userId, 'Type:', typeof userId);
    
    // Check if booking is a vendor booking - vendors cannot reject bookings directly
    const booking = await this.bookingService.findByBookingId(dto.bookingId, userId);
    if (booking && (booking as any).bookingType === 'vendor') {
      throw new BadRequestException('Vendors cannot reject bookings directly. Simply do not submit an offer if you are not interested.');
    }
    
    const data = await this.bookingService.rejectBooking(dto.bookingId, dto, userId)
    
    return plainToInstance(RejectBookingResponseDto, {
      id: data.id || data._id,
      bookingId: data.bookingId,
      bookingStatus: data.bookingStatus,
      rejectionReason: data.rejectionReason,
      rejectionDate: data.rejectionDate,
      notes: data.notes,
      updatedAt: data.updatedAt,
    }, { excludeExtraneousValues: true })
  }

  @Put(':bookingId/cancel')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ 
    summary: 'Cancel a booking',
    description: 'Allows users to cancel their own bookings with a reason'
  })
  @ApiParam({ name: 'bookingId', description: 'Booking ID', example: 'BK-A9098A0F' })
  @ApiBody({ type: CancelBookingDto })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Booking cancelled successfully',
    type: CancelBookingResponseDto 
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Cannot cancel booking (already cancelled, completed, or rejected)' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Booking not found' 
  })
  async cancelBooking(
    @Param('bookingId') bookingId: string,
    @Body() dto: CancelBookingDto,
    @Req() req: any,
  ): Promise<CancelBookingResponseDto> {
    const userId: string = String(req?.user?.id || req?.user?._id || req?.user?.sub)
    console.log('Cancel Booking Controller - User from JWT:', req?.user);
    console.log('Cancel Booking Controller - Extracted userId:', userId, 'Type:', typeof userId);
    const data = await this.bookingService.cancelBooking(bookingId, dto, userId)
    
    return plainToInstance(CancelBookingResponseDto, {
      id: data.id || data._id,
      bookingId: data.bookingId,
      bookingStatus: data.bookingStatus,
      cancellationReason: data.cancellationReason,
      cancellationDate: data.cancellationDate,
      notes: data.notes,
      updatedAt: data.updatedAt,
    }, { excludeExtraneousValues: true })
  }

  @Put(':bookingId')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Update booking details by bookingId' })
  @ApiParam({ name: 'bookingId', description: 'Booking ID', example: 'BK-A9098A0F' })
  @ApiResponse({ status: HttpStatus.OK, type: BookingDetailResponseDto })
  async updateBooking(
    @Param('bookingId') bookingId: string,
    @Body() dto: UpdateBookingDto,
    @Req() req: any,
  ): Promise<BookingDetailResponseDto> {
    const userId: string = req?.user?.id || req?.user?._id || req?.user?.sub
    const data = await this.bookingService.updateBooking(bookingId, dto, userId)
    
    return plainToInstance(BookingDetailResponseDto, data, { excludeExtraneousValues: true })
  }

  @Post('migrate-status')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Migrate booking status',
    description: 'Updates all existing bookings without bookingStatus to PENDING. Admin only operation.'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Migration completed successfully',
    schema: {
      type: 'object',
      properties: {
        updated: { type: 'number', description: 'Number of bookings updated' },
        message: { type: 'string', description: 'Success message' }
      }
    }
  })
  async migrateBookingStatus(): Promise<{ updated: number; message: string }> {
    return this.bookingService.migrateBookingStatus();
  }

  @Post(':bookingId/vendor-offer')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Submit a vendor offer for a booking',
    description: 'Allows any user/vendor to submit an offer (amount + extra services) for any booking'
  })
  @ApiParam({ name: 'bookingId', description: 'Booking ID', example: 'BK-A9098A0F' })
  @ApiBody({ type: CreateVendorOfferDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Vendor offer submitted successfully',
    type: VendorOfferResponseDto
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cannot submit offer (booking not found, or offer already submitted)'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Booking or vendor not found'
  })
  async submitVendorOffer(
    @Param('bookingId') bookingId: string,
    @Body() dto: CreateVendorOfferDto,
    @Req() req: any,
  ): Promise<VendorOfferResponseDto> {
    const userId: string = String(req?.user?.id || req?.user?._id || req?.user?.sub);
    const user = req?.user;
    
    // Get vendorId from user's enterprise context
    // The vendor submitting the offer should be associated with the user's enterprise
    const data = await this.bookingService.submitVendorOffer(bookingId, dto, userId, user);
    
    // Get vendor name
    let vendorName = 'Unknown Vendor';
    try {
      // Try to find vendor first
      const vendor = await this.bookingService['vendorRepo'].findOne({
        where: { _id: new ObjectId(data.vendorId), isDeleted: false } as any,
      } as any);
      if (vendor) {
        vendorName = vendor.name || vendor.title || 'Unknown Vendor';
      } else {
        // If vendor not found, try to get user name (vendorId might be userId)
        const user = await this.bookingService['userService'].findById(data.vendorId);
        if (user) {
          vendorName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.organizationName || 'Unknown Vendor';
        }
      }
    } catch (error) {
      console.error('Error fetching vendor name:', error);
      // If ObjectId conversion fails, try to get user name
      try {
        const user = await this.bookingService['userService'].findById(data.vendorId);
        if (user) {
          vendorName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.organizationName || 'Unknown Vendor';
        }
      } catch (userError) {
        console.error('Error fetching user name:', userError);
      }
    }

    return plainToInstance(VendorOfferResponseDto, {
      id: (data as any).id || (data as any)._id?.toString() || '',
      bookingId: data.bookingId,
      vendor_id: data.vendorId,
      vendor_name: vendorName,
      offerAddedBy: data.offerAddedBy,
      amount: data.offerAmount,
      extra_services: data.extraServices,
      status: data.status,
      notes: data.notes,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    }, { excludeExtraneousValues: true });
  }

  @Post(':bookingId/accept-offer')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Accept or reject an offer',
    description: 'Allows booking owner to accept or reject an offer. Accepting will mark the selected offer as accepted, reject others, update booking status to confirmed, and initiate a chat session. Rejecting will only mark the offer as rejected.'
  })
  @ApiParam({ name: 'bookingId', description: 'Booking ID', example: 'BK-A9098A0F' })
  @ApiBody({ type: AcceptOfferDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Offer action completed successfully',
    type: AcceptOfferResponseDto
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cannot process offer (not booking owner, offer not found, or offer already processed)'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Booking or offer not found'
  })
  async acceptOffer(
    @Param('bookingId') bookingId: string,
    @Body() dto: AcceptOfferDto,
    @Req() req: any,
  ): Promise<AcceptOfferResponseDto> {
    const userId: string = String(req?.user?.id || req?.user?._id || req?.user?.sub);
    const data = await this.bookingService.acceptOrRejectOffer(bookingId, dto.offer_id, dto.action, userId);
    
    // Handle different offer types (unified, vendor, admin)
    const offer = data.offer;
    const offerId = (offer as any).id || (offer as any)._id?.toString() || '';
    const offerBookingId = offer.bookingId || (offer as any).bookingId;
    const vendorId = offer.vendorId || offer.userId || (offer as any).vendorId || (offer as any).userId;
    const amount = offer.offerAmount || offer.amount || 0;
    const extraServices = offer.extraServices || offer.extra_services || [];
    const status = offer.status;
    const notes = offer.notes;

    return plainToInstance(AcceptOfferResponseDto, {
      offer: {
        id: offerId,
        bookingId: offerBookingId,
        vendor_id: vendorId,
        amount: amount,
        extra_services: extraServices,
        status: status,
        notes: notes,
        createdAt: offer.createdAt,
        updatedAt: offer.updatedAt,
      },
      chatId: data.chatId,
      bookingStatus: data.bookingStatus,
    }, { excludeExtraneousValues: true });
  }

  @Post(':bookingId/admin-offer')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Submit an admin/enterprise offer for a booking',
    description: 'Allows admins/enterprises to submit an offer (amount + extra services) for a booking'
  })
  @ApiParam({ name: 'bookingId', description: 'Booking ID', example: 'BK-A9098A0F' })
  @ApiBody({ type: CreateAdminOfferDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Admin offer submitted successfully',
    type: AdminOfferResponseDto
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cannot submit offer (booking not found, or offer already submitted)'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Booking not found'
  })
  async submitAdminOffer(
    @Param('bookingId') bookingId: string,
    @Body() dto: CreateAdminOfferDto,
    @Req() req: any,
  ): Promise<AdminOfferResponseDto> {
    const userId: string = String(req?.user?.id || req?.user?._id || req?.user?.sub);
    const data = await this.bookingService.submitAdminOffer(bookingId, dto, userId);
    
    return plainToInstance(AdminOfferResponseDto, {
      id: (data as any).id || (data as any)._id?.toString() || '',
      bookingId: data.bookingId,
      user_id: data.userId,
      offer_amount: data.offerAmount,
      extra_services: data.extraServices,
      status: data.status,
      notes: data.notes,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    }, { excludeExtraneousValues: true });
  }
}


