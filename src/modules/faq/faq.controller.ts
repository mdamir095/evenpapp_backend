import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
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
import { FaqService } from './faq.service';
import { CreateFaqDto } from './dto/request/create-faq.dto';
import { UpdateFaqDto } from './dto/request/update-faq.dto';
import { FaqQueryDto } from './dto/request/faq-query.dto';
import { FaqResponseDto } from './dto/response/faq-response.dto';
import { FaqPaginatedDto } from './dto/response/faq-paginated.dto';

@ApiTags('FAQ')
@Controller('faq')
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  // 1. CREATE - Create a new FAQ
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new FAQ',
    description: 'Creates a new frequently asked question with answer'
  })
  @ApiBody({ type: CreateFaqDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'FAQ has been successfully created',
    type: FaqResponseDto
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data or validation failed'
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized access'
  })
  @ApiBearerAuth()
  async create(@Body() createFaqDto: CreateFaqDto): Promise<FaqResponseDto> {
    return await this.faqService.create(createFaqDto);
  }

  // 2a. READ ALL SIMPLE - Get all FAQs without pagination and filters
  @Get('all')
  @ApiOperation({
    summary: 'Get all active FAQs',
    description: 'Retrieves all active FAQs without pagination and filters'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of all active FAQs retrieved successfully',
    type: [FaqResponseDto]
  })
  async findAllSimple(): Promise<FaqResponseDto[]> {
    return await this.faqService.findAllSimple();
  }

  // 2. READ ALL - Get all FAQs with filtering and pagination
  @Get()
  @ApiOperation({
    summary: 'Get all FAQs with filtering and pagination',
    description: 'Retrieves a paginated list of FAQs with optional filtering by search term and active status'
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search term to filter FAQs by question or answer',
    example: 'event creation'
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    description: 'Filter FAQs by active status',
    example: true,
    type: Boolean
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination',
    example: 1,
    type: Number
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page',
    example: 10,
    type: Number
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of FAQs retrieved successfully',
    type: FaqPaginatedDto
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid query parameters'
  })
  async findAll(@Query() queryDto: FaqQueryDto): Promise<FaqPaginatedDto> {
    return await this.faqService.findAll(queryDto);
  }

  // 3. READ ONE - Get FAQ by ID
  @Get(':id')
  @ApiOperation({
    summary: 'Get FAQ by ID',
    description: 'Retrieves a specific FAQ by its unique identifier'
  })
  @ApiParam({
    name: 'id',
    description: 'FAQ unique identifier (ObjectId or key)',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'FAQ retrieved successfully',
    type: FaqResponseDto
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'FAQ not found'
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid ID format'
  })
  async findOne(@Param('id') id: string): Promise<FaqResponseDto> {
    return await this.faqService.findOne(id);
  }

  // 4. UPDATE - Update FAQ
  @Patch(':id')
  @ApiOperation({
    summary: 'Update FAQ',
    description: 'Updates an existing FAQ with new information'
  })
  @ApiParam({
    name: 'id',
    description: 'FAQ unique identifier (ObjectId or key)',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiBody({ type: UpdateFaqDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'FAQ updated successfully',
    type: FaqResponseDto
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'FAQ not found'
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data or ID format'
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized access'
  })
  @ApiBearerAuth()
  async update(
    @Param('id') id: string,
    @Body() updateFaqDto: UpdateFaqDto
  ): Promise<FaqResponseDto> {
    return await this.faqService.update(id, updateFaqDto);
  }

  // 5. DELETE - Delete FAQ
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete FAQ',
    description: 'Soft deletes an FAQ from the system'
  })
  @ApiParam({
    name: 'id',
    description: 'FAQ unique identifier (ObjectId or key)',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'FAQ deleted successfully'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'FAQ not found'
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid ID format or operation failed'
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized access'
  })
  @ApiBearerAuth()
  async remove(@Param('id') id: string): Promise<void> {
    return await this.faqService.remove(id);
  }
}