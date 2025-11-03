import {
  Controller,
  Get,
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
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SimilarService } from './similar.service';
import { VendorPaginatedResponseDto } from '../vendor/dto/response/vendor-paginated.dto';
import { VendorPaginationDto } from '../vendor/dto/request/vendor-pagination.dto';
import { VenuePaginatedResponseDto } from '../venue/dto/response/venue-paginated.dto';
import { VenuePaginationDto } from '../venue/dto/request/venue-pagination.dto';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Similar')
@Controller('')
@ApiBearerAuth()
@UsePipes(new ValidationPipe({ transform: true }))
export class SimilarController {
  constructor(private readonly similarService: SimilarService) {}

  @Get('vendors/similar')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ 
    summary: 'Get similar vendors with pagination',
    description: 'Retrieves similar vendors with pagination, search, category filtering, location filtering, and price range capabilities'
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
    description: 'Similar vendors retrieved successfully',
    type: VendorPaginatedResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid pagination parameters',
  })
  getSimilarVendors(@Query() paginationDto: VendorPaginationDto): Promise<VendorPaginatedResponseDto> {
    return this.similarService.getSimilarVendors(paginationDto);
  }

  @Get('venues/similar')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ 
    summary: 'Get similar venues with pagination',
    description: 'Retrieves similar venues with pagination, search, and category filtering capabilities'
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
    description: 'Similar venues retrieved successfully',
    type: VenuePaginatedResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid pagination parameters',
  })
  getSimilarVenues(@Query() paginationDto: VenuePaginationDto): Promise<VenuePaginatedResponseDto> {
    return this.similarService.getSimilarVenues(paginationDto);
  }
}

