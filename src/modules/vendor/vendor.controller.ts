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
import { VendorService } from './vendor.service';
import { CreateVendorDto } from './dto/request/create-vendor.dto';
import { UpdateVendorDto } from './dto/request/update-vendor.dto';
import { VendorResponseDto } from './dto/response/vendor-response.dto';
import { VendorDetailResponseDto } from './dto/response/vendor-detail-response.dto';
import { VendorPaginatedResponseDto } from './dto/response/vendor-paginated.dto';
import { VendorPaginationDto } from './dto/request/vendor-pagination.dto';
import { AuthGuard } from '@nestjs/passport';
import { Features } from '@common/decorators/permission.decorator';
import { FeatureGuard } from '@common/guards/features.guard';
import { FeatureType } from '@shared/enums/featureType';
import { VendorUserResponseDto } from './dto/response/vendor-user-response.dto';
import { VendorUserPaginatedResponseDto } from './dto/response/vendor-user-paginated-response.dto';
import { plainToInstance } from 'class-transformer';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Vendors')
@Controller('vendors')
@ApiBearerAuth()
@UsePipes(new ValidationPipe({ transform: true }))
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  @Get('user')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ 
    summary: 'Get all vendors with pagination',
    description: 'Retrieves vendors with pagination, search, category filtering, location filtering, and price range capabilities'
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
    description: 'Search term to filter vendors by name, services, or equipment',
    example: 'photographer',
  })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    type: String,
    description: 'Filter vendors by category ObjectId',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiQuery({
    name: 'location',
    required: false,
    type: String,
    description: 'Filter vendors by location',
    example: 'Mumbai',
  })
  @ApiQuery({
    name: 'minPrice',
    required: false,
    type: Number,
    description: 'Filter vendors by minimum price',
    example: 10000,
  })
  @ApiQuery({
    name: 'maxPrice',
    required: false,
    type: Number,
    description: 'Filter vendors by maximum price',
    example: 100000,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Vendors retrieved successfully',
    type: VendorUserPaginatedResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid pagination parameters',
  })
  async findAllForUser(@Query() paginationDto: VendorPaginationDto): Promise<VendorUserPaginatedResponseDto> {
    try {
      const { data, pagination } = await this.vendorService.findAll(paginationDto);
      
      if (!data || !Array.isArray(data)) {
        throw new Error('Invalid data format from service');
      }
      
      // Type cast to any to access raw properties that might not be in the DTO
      const rawData = data as any[];
      
      // Debug: Log first vendor to see what data we have
      if (rawData && rawData.length > 0) {
        const firstVendor = rawData[0];
        // Check for Image field in formData.fields - ensure fields is an array
        let imageField = null;
        if (firstVendor?.formData?.fields && Array.isArray(firstVendor.formData.fields)) {
          imageField = firstVendor.formData.fields.find((field: any) => 
            field?.name && field.name.toLowerCase().includes('image')
          );
        }
        
        console.log('First vendor data before transformation:', {
          id: firstVendor?.id,
          name: firstVendor?.name,
          imageUrl: firstVendor?.imageUrl,
          hasFormData: !!firstVendor?.formData,
          formDataFieldsType: typeof firstVendor?.formData?.fields,
          isFieldsArray: Array.isArray(firstVendor?.formData?.fields),
          formDataImageUrl: firstVendor?.formData?.imageUrl,
          formDataImages: firstVendor?.formData?.images,
          imageFieldName: imageField?.name,
          imageFieldType: imageField?.type,
          imageFieldActualValue: imageField?.actualValue?.[0]
        });
      }
      
      let transformedData;
      try {
        transformedData = plainToInstance(VendorUserResponseDto, rawData, { excludeExtraneousValues: true });
      } catch (transformError) {
        console.error('Error transforming vendor data:', transformError);
        throw new Error(`Failed to transform vendor data: ${transformError.message}`);
      }
      
      // Explicitly ensure categoryId, categoryName, and image are present after transformation
      // Also remove any unwanted fields like "Image" (capital I) or formData fields
      const finalData = transformedData.map((vendorDto: any, index: number) => {
        try {
          const originalVendor = rawData[index] as any;
          
          // Remove any unwanted fields that might have been exposed (like "Image", "formData", etc.)
          const cleanedDto: any = {};
          const allowedFields = ['id', 'key', 'title', 'description', 'longDescription', 'categoryId', 'categoryName', 'location', 'price', 'pricing', 'rating', 'reviews', 'image'];
          allowedFields.forEach(field => {
            if (vendorDto && vendorDto[field] !== undefined) {
              cleanedDto[field] = vendorDto[field];
            }
          });
          
          if (originalVendor) {
            cleanedDto.categoryId = originalVendor.categoryId || '';
            cleanedDto.categoryName = originalVendor.categoryName || '';
            
            // Extract image URL - ensure it's always a string from index 0
            let extractedImageUrl = '';
            
            // First check if imageUrl was extracted by service
            if (originalVendor.imageUrl && typeof originalVendor.imageUrl === 'string') {
              extractedImageUrl = originalVendor.imageUrl;
            } 
            // Check formData.imageUrl
            else if (originalVendor.formData?.imageUrl && typeof originalVendor.formData.imageUrl === 'string') {
              extractedImageUrl = originalVendor.formData.imageUrl;
            } 
            // Check formData.images array
            else if (Array.isArray(originalVendor.formData?.images) && originalVendor.formData.images.length > 0) {
              const firstImage = originalVendor.formData.images[0];
              extractedImageUrl = typeof firstImage === 'string' ? firstImage : '';
            }
            // Check formData.fields for MultiImageUpload - this is the main source
            else if (originalVendor.formData?.fields && Array.isArray(originalVendor.formData.fields)) {
              // Find any field with MultiImageUpload type OR field name containing "image" (case insensitive)
              const imageField = originalVendor.formData.fields.find((field: any) => {
                try {
                  const isMultiImageUpload = field?.type === 'MultiImageUpload';
                  const hasImageInName = field?.name && typeof field.name === 'string' && field.name.toLowerCase().includes('image');
                  const hasActualValue = field?.actualValue && Array.isArray(field.actualValue) && field.actualValue.length > 0;
                  return (isMultiImageUpload || hasImageInName) && hasActualValue;
                } catch (e) {
                  return false;
                }
              });
              
              if (imageField && imageField.actualValue && imageField.actualValue.length > 0) {
                const firstImage = imageField.actualValue[0]; // Get index 0 only
                // Extract URL from the first image object - matches structure: { id: "...", name: "...", url: { imageUrl: "..." } }
                if (firstImage?.url?.imageUrl && typeof firstImage.url.imageUrl === 'string') {
                  extractedImageUrl = firstImage.url.imageUrl;
                } else if (firstImage?.url && typeof firstImage.url === 'string') {
                  extractedImageUrl = firstImage.url;
                } else if (typeof firstImage === 'string') {
                  extractedImageUrl = firstImage;
                } else if (firstImage?.name && typeof firstImage.name === 'string' && firstImage.name.startsWith('http')) {
                  extractedImageUrl = firstImage.name;
                }
              }
            }
            
            // Set the extracted URL (ensure it's a string, not an array)
            // Always use lowercase "image" field
            cleanedDto.image = typeof extractedImageUrl === 'string' && extractedImageUrl !== '' 
              ? extractedImageUrl 
              : (vendorDto?.image && typeof vendorDto.image === 'string' ? vendorDto.image : '');
          }
          
          return cleanedDto;
        } catch (itemError) {
          console.error(`Error processing vendor at index ${index}:`, itemError);
          // Return a minimal safe object if processing fails
          return {
            id: vendorDto?.id || '',
            key: vendorDto?.key || '',
            title: vendorDto?.title || '',
            description: vendorDto?.description || '',
            longDescription: vendorDto?.longDescription || '',
            categoryId: '',
            categoryName: '',
            location: vendorDto?.location || {},
            price: vendorDto?.price || 0,
            pricing: vendorDto?.pricing || [],
            rating: vendorDto?.rating || 0,
            reviews: vendorDto?.reviews || 0,
            image: ''
          };
        }
      });
      
      // Debug: Log first transformed vendor
      if (finalData && finalData.length > 0) {
        console.log('First vendor after transformation:', {
          id: finalData[0]?.id,
          name: finalData[0]?.title,
          image: finalData[0]?.image,
          imageType: typeof finalData[0]?.image,
          isArray: Array.isArray(finalData[0]?.image),
          allKeys: Object.keys(finalData[0] || {})
        });
      }
      
      return { data: finalData, pagination };
    } catch (error) {
      console.error('Error in findAllForUser:', error);
      throw error;
    }
  }

  @Get('user/category/:categoryId')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ 
    summary: 'Get vendors by category with pagination',
    description: 'Retrieves vendors for a specific category with pagination and search'
  })
  @ApiParam({
    name: 'categoryId',
    description: 'Category ObjectId to filter vendors',
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
    description: 'Search term to filter vendors by name or services',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Vendors retrieved successfully',
    type: VendorUserPaginatedResponseDto,
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
    @Query() paginationDto: VendorPaginationDto,
  ): Promise<VendorUserPaginatedResponseDto> {
    const { data, pagination } = await this.vendorService.findByCategory(categoryId, paginationDto);
    return { data: plainToInstance(VendorUserResponseDto, data, { excludeExtraneousValues: true }), pagination };
  }
  
  @Post()
  @UseGuards(AuthGuard('jwt'), FeatureGuard)
  @Features(FeatureType.VENDOR_MANAGEMENT)
  @ApiOperation({ 
    summary: 'Create a new vendor',
    description: 'Creates a new vendor with dynamic form data. For Enterprise users, enterprise information is auto-populated from the token. For Admin users, enterprise information must be provided in the request.'
  })
  @ApiBody({ type: CreateVendorDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Vendor created successfully',
    type: VendorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation failed or vendor with this name already exists in the category',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized access',
  })
  create(@Body() createVendorDto: CreateVendorDto, @Req() req: any): Promise<VendorResponseDto> {
    return this.vendorService.create(createVendorDto, req.user);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), FeatureGuard)
  @Features(FeatureType.VENDOR_MANAGEMENT)
  @ApiOperation({ 
    summary: 'Get all vendors with pagination',
    description: 'Retrieves vendors with pagination, search, category filtering, location filtering, and price range capabilities'
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
    description: 'Search term to filter vendors by name, services, or equipment',
    example: 'photographer',
  })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    type: String,
    description: 'Filter vendors by category ObjectId',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiQuery({
    name: 'location',
    required: false,
    type: String,
    description: 'Filter vendors by location',
    example: 'Mumbai',
  })
  @ApiQuery({
    name: 'minPrice',
    required: false,
    type: Number,
    description: 'Filter vendors by minimum price',
    example: 10000,
  })
  @ApiQuery({
    name: 'maxPrice',
    required: false,
    type: Number,
    description: 'Filter vendors by maximum price',
    example: 100000,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Vendors retrieved successfully',
    type: VendorPaginatedResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid pagination parameters',
  })
  findAll(@Query() paginationDto: VendorPaginationDto): Promise<VendorPaginatedResponseDto> {
    return this.vendorService.findAll(paginationDto);
  }

  @Get('category/:categoryId')
  @UseGuards(AuthGuard('jwt'), FeatureGuard)
  @Features(FeatureType.VENDOR_MANAGEMENT)
  @ApiOperation({ 
    summary: 'Get vendors by category with pagination',
    description: 'Retrieves vendors for a specific category with pagination and search'
  })
  @ApiParam({
    name: 'categoryId',
    description: 'Category ObjectId to filter vendors',
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
    description: 'Search term to filter vendors by name or services',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Vendors retrieved successfully',
    type: VendorPaginatedResponseDto,
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
    @Query() paginationDto: VendorPaginationDto,
  ): Promise<VendorPaginatedResponseDto> {
    return this.vendorService.findByCategory(categoryId, paginationDto);
  }

  @Get('location/:location')
  @UseGuards(AuthGuard('jwt'), FeatureGuard)
  @Features(FeatureType.VENDOR_MANAGEMENT)
  @ApiOperation({ 
    summary: 'Get vendors by location with pagination',
    description: 'Retrieves vendors for a specific location with pagination and search'
  })
  @ApiParam({
    name: 'location',
    description: 'Location to filter vendors',
    example: 'Mumbai',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Vendors retrieved successfully',
    type: VendorPaginatedResponseDto,
  })
  findByLocation(
    @Param('location') location: string,
    @Query() paginationDto: VendorPaginationDto,
  ): Promise<VendorPaginatedResponseDto> {
    return this.vendorService.findByLocation(location, paginationDto);
  }

  @Get('price-range/:minPrice/:maxPrice')
  @UseGuards(AuthGuard('jwt'), FeatureGuard)
  @Features(FeatureType.VENDOR_MANAGEMENT)
  @ApiOperation({ 
    summary: 'Get vendors by price range with pagination',
    description: 'Retrieves vendors within a specific price range with pagination and search'
  })
  @ApiParam({
    name: 'minPrice',
    description: 'Minimum price',
    example: 10000,
  })
  @ApiParam({
    name: 'maxPrice',
    description: 'Maximum price',
    example: 100000,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Vendors retrieved successfully',
    type: VendorPaginatedResponseDto,
  })
  findByPriceRange(
    @Param('minPrice') minPrice: number,
    @Param('maxPrice') maxPrice: number,
    @Query() paginationDto: VendorPaginationDto,
  ): Promise<VendorPaginatedResponseDto> {
    return this.vendorService.findByPriceRange(+minPrice, +maxPrice, paginationDto);
  }

  @Get('stats')
  @UseGuards(AuthGuard('jwt'), FeatureGuard)
  @Features(FeatureType.VENDOR_MANAGEMENT)
  @ApiOperation({ 
    summary: 'Get vendor statistics',
    description: 'Retrieves statistics about vendors including total count, active, inactive, and deleted vendors'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Vendor statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number', description: 'Total number of vendors' },
        active: { type: 'number', description: 'Number of active vendors' },
        inactive: { type: 'number', description: 'Number of inactive vendors' },
        deletedCount: { type: 'number', description: 'Number of deleted vendors' },
      },
    },
  })
  getStats() {
    return this.vendorService.getVendorStats();
  }

  @Get('detail/:id')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ 
    summary: 'Get vendor details in specific format',
    description: 'Retrieves detailed vendor information in a specific JSON format with location, pricing, reviews, etc.'
  })
  @ApiParam({
    name: 'id',
    description: 'MongoDB ObjectId of the vendor',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Vendor details retrieved successfully',
    type: VendorDetailResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid ObjectId format',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Vendor not found',
  })
  findOneDetail(@Param('id') id: string): Promise<VendorDetailResponseDto> {
    return this.vendorService.findOneDetail(id);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), FeatureGuard)
  @Features(FeatureType.VENDOR_MANAGEMENT)
  @ApiOperation({ 
    summary: 'Get a vendor by ObjectId',
    description: 'Retrieves detailed information about a specific vendor',
  })
  @ApiParam({
    name: 'id',
    description: 'MongoDB ObjectId of the vendor',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Vendor retrieved successfully',
    type: VendorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid ObjectId format',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Vendor not found',
  })
  findOne(@Param('id') id: string): Promise<VendorResponseDto> {
    return this.vendorService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), FeatureGuard)
  @Features(FeatureType.VENDOR_MANAGEMENT)
  @ApiOperation({ 
    summary: 'Update a vendor',
    description: 'Updates vendor information including dynamic form data',
  })
  @ApiParam({
    name: 'id',
    description: 'MongoDB ObjectId of the vendor to update',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({ type: UpdateVendorDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Vendor updated successfully',
    type: VendorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid ObjectId format, validation failed, or vendor name already exists',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Vendor not found',
  })
  update(
    @Param('id') id: string,
    @Body() updateVendorDto: UpdateVendorDto,
    @Req() req: any,
  ): Promise<VendorResponseDto> {
    return this.vendorService.update(id, updateVendorDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), FeatureGuard)
  @Features(FeatureType.VENDOR_MANAGEMENT)
  @ApiOperation({ 
    summary: 'Delete a vendor',
    description: 'Soft deletes a vendor (marks as deleted without removing from database)',
  })
  @ApiParam({
    name: 'id',
    description: 'MongoDB ObjectId of the vendor to delete',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Vendor deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Vendor deleted successfully' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid ObjectId format',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Vendor not found',
  })
  remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.vendorService.remove(id);
  }

  @Post('upload-image')
  @UseGuards(AuthGuard('jwt'), FeatureGuard)
  @Features(FeatureType.VENDOR_MANAGEMENT)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ 
    summary: 'Upload vendor image',
    description: 'Uploads a vendor image file (PNG, JPEG, JPG). Returns the image URL that can be used in vendor creation.'
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
        status: {
          type: 'string',
          example: 'OK',
        },
        data: {
          type: 'string',
          example: '/uploads/vendors/vendor_1234567890_abc123.jpg',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid file format or no file provided',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized access',
  })
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(`Invalid file type: ${file.mimetype}. Allowed types: PNG, JPEG, JPG`);
    }
    
    const imageUrl = await this.vendorService.uploadVendorImage(file);
    
    return {
      status: 'OK',
      data: imageUrl,
    };
  }

}
  