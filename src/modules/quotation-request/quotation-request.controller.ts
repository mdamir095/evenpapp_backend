import { Controller, Post, Get, Put, Delete, Body, Param, Query, UseInterceptors, ClassSerializerInterceptor, UseGuards, BadRequestException, UploadedFile, Req } from '@nestjs/common';
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
  @UseGuards(AuthGuard('jwt'))
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
  async createQuotationRequest(
    @Body() createQuotationRequestDto: CreateQuotationRequestDto,
    @Req() req: any,
  ): Promise<QuotationRequestResponseDto> {
    // Extract user ID from JWT token
    const userId: string = String(req?.user?.id || req?.user?._id || req?.user?.sub);
    console.log('Quotation Request Controller - User ID for create:', userId, 'Type:', typeof userId);
    console.log('Quotation Request Controller - Incoming referenceImages count:', createQuotationRequestDto.referenceImages?.length || 0);
    
    const quotationRequest = await this.quotationRequestService.create(createQuotationRequestDto, userId);
    
    // Log response to ensure referenceImages with uploaded URLs are included
    console.log('Quotation Request Controller - Service response referenceImages:', (quotationRequest as any).referenceImages);
    console.log('Quotation Request Controller - Service response referenceImages count:', (quotationRequest as any).referenceImages?.length || 0);
    console.log('Quotation Request Controller - Service response keys:', Object.keys(quotationRequest as any));
    console.log('Quotation Request Controller - Service response has referenceImages:', 'referenceImages' in (quotationRequest as any));
    
    // Explicitly ensure referenceImages are included in the response
    // Get referenceImages from the service response - handle all possible cases
    let serviceReferenceImages = (quotationRequest as any).referenceImages;
    
    // Ensure it's always an array
    if (!serviceReferenceImages) {
      serviceReferenceImages = [];
    }
    if (!Array.isArray(serviceReferenceImages)) {
      serviceReferenceImages = [];
    }
    
    // Build response object with referenceImages explicitly set
    const response: any = {
      ...quotationRequest,
      referenceImages: serviceReferenceImages // Explicitly set - MUST be included
    };
    
    // Ensure referenceImages property exists and is an array
    if (!('referenceImages' in response)) {
      response.referenceImages = serviceReferenceImages;
    }
    if (!Array.isArray(response.referenceImages)) {
      response.referenceImages = serviceReferenceImages;
    }
    
    console.log('Quotation Request Controller - Final response referenceImages:', response.referenceImages);
    console.log('Quotation Request Controller - Final response referenceImages count:', response.referenceImages?.length || 0);
    console.log('Quotation Request Controller - Final response has referenceImages:', 'referenceImages' in response);
    console.log('Quotation Request Controller - Final response type:', typeof response);
    console.log('Quotation Request Controller - Final response referenceImages type:', typeof response.referenceImages);
    console.log('Quotation Request Controller - Final response referenceImages is array:', Array.isArray(response.referenceImages));
    
    // Return the response directly - ClassSerializerInterceptor will handle serialization based on @Expose() decorators
    return response;
  }

  @Get('quotation-requests')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get all quotation requests for the logged-in user' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page' })
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
    @Req() req: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ) {
    // Extract user ID from JWT token - users should only see their own quotation requests
    const userId: string = String(req?.user?.id || req?.user?._id || req?.user?.sub);
    console.log('Quotation Request Controller - User ID for getQuotationRequests:', userId, 'Type:', typeof userId);
    
    // Force filter by logged-in user's ID (ignore any userId query parameter for security)
    const result = await this.quotationRequestService.findAll(page, limit, userId, search);
    
    // Explicitly ensure referenceImages are included in each quotation response
    if (result.data && result.data.length > 0) {
      result.data = result.data.map((quotation: any) => {
        // Get referenceImages from the quotation, ensuring it's always an array
        let referenceImages = quotation.referenceImages;
        
        if (!referenceImages) {
          referenceImages = [];
        }
        if (!Array.isArray(referenceImages)) {
          referenceImages = [];
        }
        
        // Build response object with referenceImages explicitly set
        const processedQuotation: any = {
          ...quotation,
          referenceImages: referenceImages // Explicitly set - MUST be included
        };
        
        // Ensure referenceImages property exists and is an array
        if (!('referenceImages' in processedQuotation)) {
          processedQuotation.referenceImages = referenceImages;
        }
        if (!Array.isArray(processedQuotation.referenceImages)) {
          processedQuotation.referenceImages = referenceImages;
        }
        
        return processedQuotation;
      });
      
      // Log referenceImages in response for debugging
      console.log('Quotation Request Controller - Sample referenceImages from response:', result.data.slice(0, 2).map((q: any) => ({
        id: q._id || q.id,
        referenceImages: q.referenceImages,
        referenceImagesCount: q.referenceImages?.length || 0,
        referenceImagesType: typeof q.referenceImages,
        referenceImagesIsArray: Array.isArray(q.referenceImages),
        hasReferenceImages: 'referenceImages' in q
      })));
    }
    
    return result;
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
