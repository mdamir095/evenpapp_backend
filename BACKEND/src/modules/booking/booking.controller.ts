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
import { RequestBookingResponseDto } from './dto/response/request-booking-response.dto'
import { BookingDetailResponseDto } from './dto/response/booking-detail-response.dto'
import { CancelBookingResponseDto } from './dto/response/cancel-booking-response.dto'

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
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('bookingType') bookingType?: 'venue' | 'vendor',
  ): Promise<BookingUserListResponseDto> {
    const data = await this.bookingService.findAllForUser(page, limit, search, bookingType)
    
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
    const entity = await this.bookingService.createRequestBooking(dto, userId)
    return plainToInstance(
      RequestBookingResponseDto,
      {
        ...entity,
        id: (entity as any)?._id?.toString?.() ?? (entity as any)?.id?.toString?.() ?? '',
      },
      { excludeExtraneousValues: true },
    )
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

  @Put(':bookingId/cancel')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ 
    summary: 'Cancel a booking',
    description: 'Allows users to cancel their own bookings with a reason'
  })
  @ApiParam({ name: 'bookingId', description: 'Booking ID', example: 'BK-A9098A0F' })
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
}


