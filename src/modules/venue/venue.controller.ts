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
  Req,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
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
    
    // Transform to DTO and ensure categoryId and categoryName are preserved
    const transformedData = plainToInstance(VenueUserResponseDto, data, { excludeExtraneousValues: true });
    
    // Ensure categoryId and categoryName are included after transformation
    const finalData = transformedData.map((venue: any, index: number) => {
      const originalVenue = data[index];
      return {
        ...venue,
        categoryId: originalVenue?.categoryId || venue.categoryId,
        categoryName: originalVenue?.categoryName || venue.categoryName || 'General Venue'
      };
    });
    
    return { data: finalData, pagination };
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
  @UseInterceptors(AnyFilesInterceptor({
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    preservePath: false,
  }))  // Parse form-data even without files
  @UsePipes(new ValidationPipe({ 
    transform: true, 
    whitelist: false,  // Don't strip unknown properties for form-data
    forbidNonWhitelisted: false 
  }))
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiOperation({ 
    summary: 'Create a new venue',
    description: 'Creates a new venue with dynamic form data. Accepts both JSON and form-data. The formData field can contain any custom fields as defined by the venue category form. When sending as form-data, formData should be a JSON string that will be automatically parsed.'
  })
  @ApiBody({ 
    type: CreateVenueDto,
    description: 'Venue data. Can be sent as JSON or form-data. When using form-data, formData field should be a JSON string.',
    schema: {
      type: 'object',
      properties: {
        serviceCategoryId: {
          type: 'string',
          description: 'Service category ObjectId',
          example: '691e8fc691171b090482ed89'
        },
        name: {
          type: 'string',
          description: 'Venue name',
          example: 'Wankhede Stadium'
        },
        title: {
          type: 'string',
          description: 'Venue title (defaults to name if not provided)',
          example: 'Cricket Stadium'
        },
        description: {
          type: 'string',
          description: 'Short description',
          example: 'A cricket stadium description'
        },
        longDescription: {
          type: 'string',
          description: 'Detailed long description'
        },
        formData: {
          type: 'string',
          description: 'Dynamic form data as JSON string (when using form-data) or JSON object (when using JSON)',
          example: '{"location":"123 Main Street","capacity":500}'
        },
        albums: {
          type: 'array',
          description: 'Array of albums with images',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              images: { type: 'array', items: { type: 'string' } }
            }
          }
        }
      }
    }
  })
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
  create(@Body() createVenueDto: CreateVenueDto, @Req() req: any): Promise<VenueResponseDto> {
    console.log('=== VENUE CONTROLLER ===');
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Request method:', req.method);
    console.log('Request URL:', req.url);
    console.log('Raw request body keys:', Object.keys(req.body || {}));
    console.log('Raw request body:', JSON.stringify(req.body, null, 2));
    console.log('Request files:', req.files);
    console.log('Request file:', req.file);
    console.log('Initial DTO:', JSON.stringify(createVenueDto, null, 2));
    
    // Always extract from raw body first - this ensures we get form-data values
    // The ValidationPipe might have stripped or transformed them
    // When using AnyFilesInterceptor, form fields are in req.body
    const rawBody = req.body || {};
    
    // Handle form-data: Extract all fields from raw body
    const contentType = req.headers['content-type'] || '';
    const isFormData = contentType.includes('multipart/form-data') || 
                       contentType.includes('application/x-www-form-urlencoded');
    
    if (isFormData) {
      console.log('✓ Detected form-data request');
      console.log('Content-Type:', contentType);
      // When using AnyFilesInterceptor, check if body has fields
      if (Object.keys(rawBody).length === 0) {
        console.warn('⚠️ WARNING: Form-data detected but req.body is empty!');
        console.warn('This might indicate a parsing issue with Multer/AnyFilesInterceptor');
      }
    } else {
      console.log('Request is NOT form-data, Content-Type:', contentType);
    }
    
    // Parse formData if it's a JSON string
    if (rawBody.formData && typeof rawBody.formData === 'string' && rawBody.formData.trim()) {
      try {
        const parsedFormData = JSON.parse(rawBody.formData);
        (createVenueDto as any).formData = parsedFormData;
        console.log('✓ Parsed formData from JSON string');
      } catch (e) {
        console.error('✗ Failed to parse formData JSON string:', e);
        console.error('formData value (first 200 chars):', rawBody.formData?.substring(0, 200));
      }
    } else if (rawBody.formData && typeof rawBody.formData === 'object') {
      (createVenueDto as any).formData = rawBody.formData;
      console.log('✓ formData is already an object');
    }
    
    // Extract all fields from raw body - ALWAYS use raw body values
    const fieldsToExtract = [
      'serviceCategoryId',
      'name', 
      'title', 
      'description', 
      'longDescription',
      'enterpriseId',
      'enterpriseName'
    ];
    
    fieldsToExtract.forEach(field => {
      const rawValue = rawBody[field];
      // Use raw body value if it exists and is not empty string
      if (rawValue !== undefined && rawValue !== null && rawValue !== '') {
        (createVenueDto as any)[field] = rawValue;
        console.log(`✓ Set ${field} = "${rawValue}" from raw body`);
      } else {
        const dtoValue = (createVenueDto as any)[field];
        console.log(`  ${field}: raw="${rawValue}", dto="${dtoValue}"`);
      }
    });
    
    // Handle albums if it's a string (JSON string in form-data)
    if (rawBody.albums && typeof rawBody.albums === 'string' && rawBody.albums.trim()) {
      try {
        (createVenueDto as any).albums = JSON.parse(rawBody.albums);
        console.log('✓ Parsed albums from JSON string');
      } catch (e) {
        console.error('✗ Failed to parse albums JSON string:', e);
      }
    }
    
    console.log('Final DTO after processing:', JSON.stringify(createVenueDto, null, 2));
    console.log('Field values:');
    console.log('  serviceCategoryId:', createVenueDto?.serviceCategoryId, '(type:', typeof createVenueDto?.serviceCategoryId, ')');
    console.log('  name:', createVenueDto?.name, '(type:', typeof createVenueDto?.name, ')');
    console.log('  title:', createVenueDto?.title, '(type:', typeof createVenueDto?.title, ')');
    console.log('  description:', createVenueDto?.description, '(type:', typeof createVenueDto?.description, ')');
    console.log('  formData type:', typeof createVenueDto?.formData, 'is object:', typeof createVenueDto?.formData === 'object');
    console.log('========================');
    
    return this.venueService.create(createVenueDto, req.user);
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
    @Req() req: any,
  ): Promise<VenueResponseDto> {
    console.log('=== VENUE UPDATE CONTROLLER ===');
    console.log('Venue ID:', id);
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Raw request body:', JSON.stringify(req.body, null, 2));
    console.log('Received DTO:', JSON.stringify(updateVenueDto, null, 2));
    
    // Extract enterprise fields from raw body if form-data
    const rawBody = req.body || {};
    const contentType = req.headers['content-type'] || '';
    const isFormData = contentType.includes('multipart/form-data') || 
                       contentType.includes('application/x-www-form-urlencoded');
    
    if (isFormData) {
      console.log('✓ Detected form-data request for update');
      
      // Extract enterprise fields from raw body - ALWAYS extract if present
      if (rawBody.enterpriseId !== undefined && rawBody.enterpriseId !== null) {
        (updateVenueDto as any).enterpriseId = rawBody.enterpriseId === '' ? undefined : rawBody.enterpriseId;
        console.log(`✓ Extracted enterpriseId from form-data:`, rawBody.enterpriseId, '->', (updateVenueDto as any).enterpriseId);
      }
      if (rawBody.enterpriseName !== undefined && rawBody.enterpriseName !== null) {
        (updateVenueDto as any).enterpriseName = rawBody.enterpriseName === '' ? undefined : rawBody.enterpriseName;
        console.log(`✓ Extracted enterpriseName from form-data:`, rawBody.enterpriseName, '->', (updateVenueDto as any).enterpriseName);
      }
    } else {
      // For JSON requests, also check if enterprise fields are in the DTO
      console.log('Request is JSON, checking DTO for enterprise fields');
    }
    
    console.log('Final DTO after processing:', JSON.stringify(updateVenueDto, null, 2));
    console.log('enterpriseId:', (updateVenueDto as any).enterpriseId);
    console.log('enterpriseName:', (updateVenueDto as any).enterpriseName);
    console.log('================================');
    return this.venueService.update(id, updateVenueDto, req.user);
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

  @Post('upload-image')
  @UseGuards(AuthGuard('jwt'), FeatureGuard)
  @Features(FeatureType.VENUE_MANAGEMENT)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ 
    summary: 'Upload venue image',
    description: 'Uploads a venue image file (PNG, JPEG, JPG) to Supabase. Returns the public URL of the uploaded image.'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Image uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        imageUrl: {
          type: 'string',
          example: 'https://your-supabase-url.com/storage/v1/object/public/venues/venue_1234567890_abc123.jpg'
        }
      }
    }
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Invalid file format or no file provided' 
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Unauthorized access' 
  })
  async uploadImage(@UploadedFile() file: Express.Multer.File): Promise<{ imageUrl: string }> {
    try {
      console.log('Venue image upload endpoint called');
      console.log('File received:', !!file);
      
      if (!file) {
        throw new BadRequestException('No file uploaded');
      }

      const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException(`Invalid file type: ${file.mimetype}. Allowed types: PNG, JPEG, JPG`);
      }
      
      console.log('Starting venue image upload to Supabase...');
      
      // Upload the file to Supabase and get the image URL
      const imageUrl = await this.venueService.uploadImageToSupabase(file);
      console.log('Venue image uploaded successfully, URL:', imageUrl);
      
      if (!imageUrl) {
        throw new BadRequestException('File upload failed - no URL returned');
      }
      
      return { imageUrl };
      
    } catch (error) {
      console.error('Venue image upload error:', error);
      throw error;
    }
  }
}
  