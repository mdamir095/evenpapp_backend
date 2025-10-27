import { Controller, Post, Get, Put, Delete, Body, Param, Query, UseInterceptors, ClassSerializerInterceptor, UseGuards, BadRequestException, UploadedFile } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { QuotationRequestService } from './quotation-request.service';
import { CreateQuotationRequestDto } from './dto/request/create-quotation-request.dto';
import { QuotationRequestResponseDto } from './dto/response/quotation-request-response.dto';

@ApiTags('Quotation Requests')
@Controller('user')
@UseInterceptors(ClassSerializerInterceptor)
export class QuotationRequestController {
  constructor(private readonly quotationRequestService: QuotationRequestService) {}

  @Post('requestquation')
  @ApiOperation({ summary: 'Create a new quotation request' })
  @ApiResponse({
    status: 201,
    description: 'Quotation request created successfully',
    type: QuotationRequestResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async createQuotationRequest(@Body() createQuotationRequestDto: CreateQuotationRequestDto): Promise<QuotationRequestResponseDto> {
    const quotationRequest = await this.quotationRequestService.create(createQuotationRequestDto);
    return quotationRequest as any;
  }

  @Get('quotation-requests')
  @ApiOperation({ summary: 'Get all quotation requests for a user' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page' })
  @ApiQuery({ name: 'userId', required: false, type: String, description: 'User ID to filter requests' })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search by quotation requests eventHall or location',
    example: 'Mountain Lodge',
  })
  @ApiResponse({
    status: 200,
    description: 'Quotation requests retrieved successfully',
  })
  async getQuotationRequests(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('userId') userId?: string,
    @Query('search') search?: string,
  ) {
    return await this.quotationRequestService.findAll(page, limit, userId, search);
  }

  @Get('quotation-requests/:id')
  @ApiOperation({ summary: 'Get a specific quotation request by ID' })
  @ApiParam({ name: 'id', description: 'Quotation request ID' })
  @ApiResponse({
    status: 200,
    description: 'Quotation request retrieved successfully',
    type: QuotationRequestResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Quotation request not found',
  })
  async getQuotationRequest(@Param('id') id: string): Promise<QuotationRequestResponseDto> {
    const quotationRequest = await this.quotationRequestService.findOne(id);
    return quotationRequest as any;
  }

  @Put('quotation-requests/:id/status')
  @ApiOperation({ summary: 'Update quotation request status' })
  @ApiParam({ name: 'id', description: 'Quotation request ID' })
  @ApiResponse({
    status: 200,
    description: 'Quotation request status updated successfully',
    type: QuotationRequestResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Quotation request not found',
  })
  async updateQuotationRequestStatus(
    @Param('id') id: string,
    @Body() updateData: { status: string; quotationAmount?: number; notes?: string },
  ): Promise<QuotationRequestResponseDto> {
    const quotationRequest = await this.quotationRequestService.updateStatus(
      id,
      updateData.status,
      updateData.quotationAmount,
      updateData.notes,
    );
    return quotationRequest as any;
  }

  @Delete('quotation-requests/:id')
  @ApiOperation({ summary: 'Delete a quotation request' })
  @ApiParam({ name: 'id', description: 'Quotation request ID' })
  @ApiResponse({
    status: 200,
    description: 'Quotation request deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Quotation request not found',
  })
  async deleteQuotationRequest(@Param('id') id: string) {
    return await this.quotationRequestService.remove(id);
  }

  @Get('quotation-requests/vendor/:vendorId')
  @ApiOperation({ summary: 'Get quotation requests for a specific vendor' })
  @ApiParam({ name: 'vendorId', description: 'Vendor ID' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page' })
  @ApiResponse({
    status: 200,
    description: 'Vendor quotation requests retrieved successfully',
  })
  async getVendorQuotationRequests(
    @Param('vendorId') vendorId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return await this.quotationRequestService.findByVendor(vendorId, page, limit);
  }

  @Get('quotation-requests/venue/:venueId')
  @ApiOperation({ summary: 'Get quotation requests for a specific venue' })
  @ApiParam({ name: 'venueId', description: 'Venue ID' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page' })
  @ApiResponse({
    status: 200,
    description: 'Venue quotation requests retrieved successfully',
  })
  async getVenueQuotationRequests(
    @Param('venueId') venueId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return await this.quotationRequestService.findByVenue(venueId, page, limit);
  }

  @Get('event-types')
  @ApiOperation({ summary: 'Get all available event types' })
  @ApiResponse({
    status: 200,
    description: 'Event types retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'string',
      },
      example: [
        'Grand Ballroom',
        'Garden Paradise',
        'Rooftop Terrace',
        'Beach Resort',
        'Mountain Lodge',
        'City Convention Center',
      ],
    },
  })
  async getEventTypes(): Promise<string[]> {
    return await this.quotationRequestService.getEventTypes();
  }

  @Get('photography-types')
  @ApiOperation({ summary: 'Get all available photography types' })
  @ApiResponse({
    status: 200,
    description: 'Photography types retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'string',
      },
      example: [
        'Portrait',
        'Wedding',
        'Fashion',
        'Event',
        'Sports',
      ],
    },
  })
  async getPhotographyTypes(): Promise<string[]> {
    return await this.quotationRequestService.getPhotographyTypes();
  }

  @Post('seed-initial-data')
  @ApiOperation({ summary: 'Seed initial event types and photography types data' })
  @ApiResponse({
    status: 201,
    description: 'Initial data seeded successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Initial data seeded successfully',
        },
      },
    },
  })
  async seedInitialData(): Promise<{ message: string }> {
    return await this.quotationRequestService.seedInitialData();
  }

  @Post('upload-reference-image')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload reference image for quotation request' })
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
    status: 201,
    description: 'Reference image uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          example: 'OK',
        },
        data: {
          type: 'string',
          example: 'http://localhost:10030/uploads/profile/image.png',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid file type or no file uploaded',
  })
  async uploadReferenceImage(@UploadedFile() file: Express.Multer.File) {
    const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(`Invalid file type: ${file.mimetype}`);
    }

    const imageUrl = await this.quotationRequestService.uploadReferenceImage(file);
    return {
      status: 'OK',
      data: imageUrl,
    };
  }
}
