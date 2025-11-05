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
import { BookingService } from './booking.service'
import { BookingUserListResponseDto } from './dto/response/booking-user-list-response.dto'
import { CreateRequestBookingDto } from './dto/request/create-request-booking.dto'
import { UpdateBookingDto } from './dto/request/update-booking.dto'
import { CancelBookingDto } from './dto/request/cancel-booking.dto'
import { AcceptBookingDto } from './dto/request/accept-booking.dto'
import { RejectBookingDto } from './dto/request/reject-booking.dto'
import { RequestBookingResponseDto } from './dto/response/request-booking-response.dto'
import { BookingDetailResponseDto } from './dto/response/booking-detail-response.dto'
import { CancelBookingResponseDto } from './dto/response/cancel-booking-response.dto'
import { AcceptBookingResponseDto } from './dto/response/accept-booking-response.dto'
import { RejectBookingResponseDto } from './dto/response/reject-booking-response.dto'

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
  @ApiQuery({ name: 'status', required: false, type: String, example: 'pending' })
  @ApiQuery({ name: 'bookingType', required: false, enum: ['venue', 'vendor'] })
  @ApiQuery({ name: 'dateFrom', required: false, type: String, example: '2025-01-01' })
  @ApiQuery({ name: 'dateTo', required: false, type: String, example: '2025-12-31' })
  @ApiResponse({ status: HttpStatus.OK, type: BookingUserListResponseDto })
  async getAllBookings(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('bookingType') bookingType?: 'venue' | 'vendor',
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ): Promise<BookingUserListResponseDto> {
    const data = await this.bookingService.findAllForAdmin(page, limit, search, status, bookingType, dateFrom, dateTo)
    
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
  @ApiQuery({ name: 'status', required: false, type: String, example: 'pending' })
  @ApiQuery({ name: 'bookingType', required: false, enum: ['venue', 'vendor'] })
  @ApiQuery({ name: 'dateFrom', required: false, type: String, example: '2025-01-01' })
  @ApiQuery({ name: 'dateTo', required: false, type: String, example: '2025-12-31' })
  @ApiResponse({ status: HttpStatus.OK, type: BookingUserListResponseDto })
  async findAllForAdmin(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('bookingType') bookingType?: 'venue' | 'vendor',
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ): Promise<BookingUserListResponseDto> {
    const data = await this.bookingService.findAllForAdmin(page, limit, search, status, bookingType, dateFrom, dateTo)
    
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
    console.log('Booking Controller - User ID:', userId, 'Type:', typeof userId)
    console.log('Booking Controller - Incoming referenceImages count:', dto.referenceImages?.length || 0)
    
    const entity = await this.bookingService.createRequestBooking(dto, userId)
    
    // Log service response to see what's being returned
    console.log('Booking Controller - Service response referenceImages:', (entity as any).referenceImages)
    console.log('Booking Controller - Service response referenceImages count:', (entity as any).referenceImages?.length || 0)
    console.log('Booking Controller - Service response keys:', Object.keys(entity as any))
    console.log('Booking Controller - Service response has referenceImages:', 'referenceImages' in (entity as any))
    
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
    
    console.log('Booking Controller - Response data referenceImages:', responseData.referenceImages)
    console.log('Booking Controller - Response data referenceImages count:', responseData.referenceImages?.length || 0)
    console.log('Booking Controller - Response data has referenceImages:', 'referenceImages' in responseData)
    
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

  @Put(':bookingId/accept')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ 
    summary: 'Accept a booking',
    description: 'Allows vendors/admins to accept a pending booking'
  })
  @ApiParam({ name: 'bookingId', description: 'Booking ID', example: 'BK-A9098A0F' })
  @ApiBody({ type: AcceptBookingDto })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Booking accepted successfully',
    type: AcceptBookingResponseDto 
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Cannot accept booking (already confirmed, cancelled, completed, or rejected)' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Booking not found' 
  })
  async acceptBooking(
    @Param('bookingId') bookingId: string,
    @Body() dto: AcceptBookingDto,
    @Req() req: any,
  ): Promise<AcceptBookingResponseDto> {
    const userId: string = String(req?.user?.id || req?.user?._id || req?.user?.sub)
    console.log('Accept Booking Controller - User from JWT:', req?.user);
    console.log('Accept Booking Controller - Extracted userId:', userId, 'Type:', typeof userId);
    const data = await this.bookingService.acceptBooking(bookingId, dto, userId)
    
    return plainToInstance(AcceptBookingResponseDto, {
      id: data.id || data._id,
      bookingId: data.bookingId,
      bookingStatus: data.bookingStatus,
      notes: data.notes,
      updatedAt: data.updatedAt,
    }, { excludeExtraneousValues: true })
  }

  @Put(':bookingId/reject')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ 
    summary: 'Reject a booking',
    description: 'Allows vendors/admins to reject a pending booking with a reason'
  })
  @ApiParam({ name: 'bookingId', description: 'Booking ID', example: 'BK-A9098A0F' })
  @ApiBody({ type: RejectBookingDto })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Booking rejected successfully',
    type: RejectBookingResponseDto 
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Cannot reject booking (already rejected, cancelled, completed, or confirmed)' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Booking not found' 
  })
  async rejectBooking(
    @Param('bookingId') bookingId: string,
    @Body() dto: RejectBookingDto,
    @Req() req: any,
  ): Promise<RejectBookingResponseDto> {
    const userId: string = String(req?.user?.id || req?.user?._id || req?.user?.sub)
    console.log('Reject Booking Controller - User from JWT:', req?.user);
    console.log('Reject Booking Controller - Extracted userId:', userId, 'Type:', typeof userId);
    const data = await this.bookingService.rejectBooking(bookingId, dto, userId)
    
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
}


