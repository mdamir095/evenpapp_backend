import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpStatus, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { OfferService } from './offer.service';
import { CreateOfferDto } from './dto/request/create-offer.dto';
import { UpdateOfferDto } from './dto/request/update-offer.dto';
import { OfferResponseDto } from './dto/response/offer-response.dto';
import { OfferPaginatedResponseDto } from './dto/response/offer-paginated.dto';
import { OfferPaginationDto } from './dto/request/offer-pagination.dto';


@ApiTags('Offers')
@Controller('offers')
@ApiBearerAuth()
@UsePipes(new ValidationPipe({ transform: true }))
export class OfferController {
  constructor(private readonly offerService: OfferService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new offer' })
  @ApiBody({ type: CreateOfferDto })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Offer created successfully', type: OfferResponseDto })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Validation failed' })
  create(@Body() dto: CreateOfferDto): Promise<OfferResponseDto> {
    return this.offerService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all offers with pagination and filters' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by title or description' })
  @ApiQuery({ name: 'type', required: false, type: String, description: 'Filter by offer type' })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Filter by offer status' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Offers retrieved successfully', type: OfferPaginatedResponseDto })
  findAll(@Query() paginationDto: OfferPaginationDto): Promise<OfferPaginatedResponseDto> {
    return this.offerService.findAll(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get offer by ID' })
  @ApiParam({ name: 'id', description: 'Offer ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Offer retrieved successfully', type: OfferResponseDto })
  getById(@Param('id') id: string): Promise<OfferResponseDto> {
    return this.offerService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an offer by ID' })
  @ApiParam({ name: 'id', description: 'Offer ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Offer updated successfully', type: OfferResponseDto })
  update(@Param('id') id: string, @Body() dto: UpdateOfferDto): Promise<OfferResponseDto> {
    return this.offerService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an offer by ID' })
  @ApiParam({ name: 'id', description: 'Offer ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Offer deleted successfully' })
  remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.offerService.remove(id);
  }

  // Public utility endpoints for active/coupon
  @Get('public/active')
  @ApiOperation({ summary: 'Get all active offers with pagination and filters' })
  @ApiQuery({ name: 'page', type: Number, required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', type: Number, required: false, description: 'Items per page', example: 10 })
  @ApiQuery({ name: 'type', type: String, required: false, description: 'Filter by offer type' })
  getActiveOffers(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('type') type?: string,
  ): Promise<OfferPaginatedResponseDto> {
    return this.offerService.getActiveOffers(page ?? 1, limit ?? 10, type);
  }

  @Get('public/coupon/:couponCode')
  @ApiOperation({ summary: 'Validate a coupon code' })
  @ApiParam({ name: 'couponCode', description: 'Coupon code' })
  validateCoupon(@Param('couponCode') couponCode: string): Promise<{ valid: boolean; message: string }> {
    return this.offerService.validateCouponCode(couponCode);
  }

  @Post(':id/usage')
  @ApiOperation({ summary: 'Increment offer usage count' })
  @ApiParam({ name: 'id', description: 'Offer ID' })
  async incrementOfferUsage(@Param('id') id: string): Promise<{ message: string }> {
    await this.offerService.incrementOfferUsage(id);
    return { message: 'Offer usage incremented successfully' };
  }
}

