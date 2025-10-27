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
  ApiBody,
} from '@nestjs/swagger';
import { VenueService } from './venue.service';
import { CreateVenueDto } from './dto/request/create-venue.dto';
import { UpdateVenueDto } from './dto/request/update-venue.dto';
import { VenueResponseDto } from './dto/response/venue-response.dto';
import { VenueDetailResponseDto } from './dto/response/venue-detail-response.dto';
import { VenuePaginatedResponseDto } from './dto/response/venue-paginated.dto';
import { VenuePaginationDto } from './dto/request/venue-pagination.dto';
import { AuthGuard } from '@nestjs/passport';
import { FeatureGuard } from '@common/guards/features.guard';
import { Features } from '@common/decorators/permission.decorator';
import { FeatureType } from '@shared/enums/featureType';
import { VenueUserResponseDto } from './dto/response/venue-user-response.dto';
import { VenueUserPaginatedResponseDto } from './dto/response/venue-user-paginated-response.dto';
import { plainToInstance } from 'class-transformer';

@ApiTags('Venues')
@Controller('venues')
@ApiBearerAuth()
@UsePipes(new ValidationPipe({ transform: true }))
export class VenueController {
  constructor(private readonly venueService: VenueService) {}

  @Get('user')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ 
    summary: 'Get all venues with pagination',
    description: 'Retrieves venues with pagination, search, and category filtering capabilities'
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (starts from 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page (max 100)',
    example: 10,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search term to filter venues by name or location',
    example: 'wedding hall',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Venues retrieved successfully',
    type: VenueUserPaginatedResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid pagination parameters',
  })
  async findAllForUser(@Query() paginationDto: VenuePaginationDto): Promise<VenueUserPaginatedResponseDto> {
    const { data, pagination } = await this.venueService.findAllForUser(paginationDto);
    return { data: plainToInstance(VenueUserResponseDto, data, { excludeExtraneousValues: true }), pagination };
  }

@Get('user/category/:categoryId')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ 
    summary: 'Get venues by category with pagination',
    description: 'Retrieves venues for a specific category with pagination and search'
  })
  @ApiParam({
    name: 'categoryId',
    description: 'Category ObjectId to filter venues',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (starts from 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page (max 100)',
    example: 10,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search term to filter venues by name or location',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Venues retrieved successfully',
    type: VenueUserPaginatedResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid ObjectId format',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Category not found',
  })
  async findByCategoryForUser(
    @Param('categoryId') categoryId: string,
    @Query() paginationDto: VenuePaginationDto,
  ): Promise<VenueUserPaginatedResponseDto> {
    const { data, pagination } = await this.venueService.findByCategoryForUser(categoryId, paginationDto);
    return { data: plainToInstance(VenueUserResponseDto, data, { excludeExtraneousValues: true }), pagination };
  }
  
  @Post()
  @UseGuards(AuthGuard('jwt'), FeatureGuard)
  @Features(FeatureType.VENUE_MANAGEMENT)
  @ApiOperation({ 
    summary: 'Create a new venue',
    description: 'Creates a new venue with dynamic form data. The formData field can contain any custom fields as defined by the venue category form.'
  })
  @ApiBody({ type: CreateVenueDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Venue created successfully',
    type: VenueResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation failed or venue with this name already exists in the category',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized access',
  })
  create(@Body() createVenueDto: CreateVenueDto): Promise<VenueResponseDto> {
    return this.venueService.create(createVenueDto);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), FeatureGuard)
  @Features(FeatureType.VENUE_MANAGEMENT)
  @ApiOperation({ 
    summary: 'Get all venues with pagination',
    description: 'Retrieves venues with pagination, search, and category filtering capabilities'
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (starts from 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page (max 100)',
    example: 10,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search term to filter venues by name or location',
    example: 'wedding hall',
  })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    type: String,
    description: 'Filter venues by category ObjectId',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Venues retrieved successfully',
    type: VenuePaginatedResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid pagination parameters',
  })
  findAll(@Query() paginationDto: VenuePaginationDto): Promise<VenuePaginatedResponseDto> {
    return this.venueService.findAll(paginationDto);
  }

  @Get('category/:categoryId')
  @UseGuards(AuthGuard('jwt'), FeatureGuard)
  @Features(FeatureType.VENUE_MANAGEMENT)
  @ApiOperation({ 
    summary: 'Get venues by category with pagination',
    description: 'Retrieves venues for a specific category with pagination and search'
  })
  @ApiParam({
    name: 'categoryId',
    description: 'Category ObjectId to filter venues',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (starts from 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page (max 100)',
    example: 10,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search term to filter venues by name or location',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Venues retrieved successfully',
    type: VenuePaginatedResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid ObjectId format',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Category not found',
  })
  findByCategory(
    @Param('categoryId') categoryId: string,
    @Query() paginationDto: VenuePaginationDto,
  ): Promise<VenuePaginatedResponseDto> {
    return this.venueService.findByCategory(categoryId, paginationDto);
  }

  @Get('stats')
  @UseGuards(AuthGuard('jwt'), FeatureGuard)
  @Features(FeatureType.VENUE_MANAGEMENT)
  @ApiOperation({ 
    summary: 'Get venue statistics',
    description: 'Retrieves statistics about venues including total count, active, inactive, and deleted venues'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Venue statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number', description: 'Total number of venues' },
        active: { type: 'number', description: 'Number of active venues' },
        inactive: { type: 'number', description: 'Number of inactive venues' },
        deletedCount: { type: 'number', description: 'Number of deleted venues' },
      },
    },
  })
  getStats() {
    return this.venueService.getVenueStats();
  }

  @Get('detail/:id')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ 
    summary: 'Get venue details in specific format',
    description: 'Retrieves detailed venue information in a specific JSON format with location, pricing, reviews, etc.'
  })
  @ApiParam({
    name: 'id',
    description: 'MongoDB ObjectId of the venue',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Venue details retrieved successfully',
    type: VenueDetailResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid ObjectId format',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Venue not found',
  })
  findOneDetail(@Param('id') id: string): Promise<VenueDetailResponseDto> {
    return this.venueService.findOneDetail(id);
  }


  @Get(':id')
  @UseGuards(AuthGuard('jwt'), FeatureGuard)
  @Features(FeatureType.VENUE_MANAGEMENT)
  @ApiOperation({ 
    summary: 'Get a venue by ObjectId',
    description: 'Retrieves detailed information about a specific venue'
  })
  @ApiParam({
    name: 'id',
    description: 'MongoDB ObjectId of the venue',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Venue retrieved successfully',
    type: VenueResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid ObjectId format',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Venue not found',
  })
  findOne(@Param('id') id: string): Promise<VenueResponseDto> {
    return this.venueService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), FeatureGuard)
  @Features(FeatureType.VENUE_MANAGEMENT)
  @ApiOperation({ 
    summary: 'Update a venue',
    description: 'Updates venue information including dynamic form data'
  })
  @ApiParam({
    name: 'id',
    description: 'MongoDB ObjectId of the venue to update',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({ type: UpdateVenueDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Venue updated successfully',
    type: VenueResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid ObjectId format, validation failed, or venue name already exists',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Venue not found',
  })
  update(
    @Param('id') id: string,
    @Body() updateVenueDto: UpdateVenueDto,
  ): Promise<VenueResponseDto> {
    return this.venueService.update(id, updateVenueDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), FeatureGuard)
  @Features(FeatureType.VENUE_MANAGEMENT)
  @ApiOperation({ 
    summary: 'Delete a venue',
    description: 'Soft deletes a venue (marks as deleted without removing from database)'
  })
  @ApiParam({
    name: 'id',
    description: 'MongoDB ObjectId of the venue to delete',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Venue deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Venue deleted successfully' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid ObjectId format',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Venue not found',
  })
  remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.venueService.remove(id);
  }
}
  