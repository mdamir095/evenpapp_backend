import { Controller, Get, Put, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { QuotationRequestService } from './quotation-request.service';
import { CreateQuotationRequestDto } from './dto/request/create-quotation-request.dto';

@ApiTags('Quotations')
@Controller('quotations')
@ApiBearerAuth()
export class QuotationController {
  constructor(private readonly quotationRequestService: QuotationRequestService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get all quotation requests (Admin)' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page', example: 100 })
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
  async getAllQuotations(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 100,
    @Query('search') search?: string,
  ) {
    console.log('Quotation Controller - getAllQuotations called with page:', page, 'limit:', limit, 'search:', search);
    const result = await this.quotationRequestService.findAllForAdmin(page, limit, search);
    
    // Ensure referenceImages are included in each quotation response
    if (result.data && result.data.length > 0) {
      result.data = result.data.map((quotation: any) => {
        let referenceImages = quotation.referenceImages;
        
        if (!referenceImages) {
          referenceImages = [];
        }
        if (!Array.isArray(referenceImages)) {
          referenceImages = [];
        }
        
        return {
          ...quotation,
          referenceImages: referenceImages,
        };
      });
    }
    
    return result;
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get quotation request by ID' })
  @ApiParam({ name: 'id', description: 'Quotation request ID', example: '68da132472afd241781ce658' })
  @ApiResponse({
    status: 200,
    description: 'Quotation request retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Quotation request not found',
  })
  async getQuotationById(@Param('id') id: string) {
    console.log('Quotation Controller - getQuotationById called with id:', id);
    const quotation = await this.quotationRequestService.findOne(id);
    
    // Ensure referenceImages are included
    let referenceImages = (quotation as any).referenceImages;
    if (!referenceImages) {
      referenceImages = [];
    }
    if (!Array.isArray(referenceImages)) {
      referenceImages = [];
    }
    
    return {
      ...quotation,
      referenceImages: referenceImages,
    };
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Update quotation request' })
  @ApiParam({ name: 'id', description: 'Quotation request ID', example: '68da132472afd241781ce658' })
  @ApiBody({ type: CreateQuotationRequestDto, description: 'Quotation request data to update' })
  @ApiResponse({
    status: 200,
    description: 'Quotation request updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Quotation request not found',
  })
  async updateQuotation(
    @Param('id') id: string,
    @Body() updateDto: Partial<CreateQuotationRequestDto>,
  ) {
    console.log('Quotation Controller - updateQuotation called with id:', id, 'data:', updateDto);
    const quotation = await this.quotationRequestService.update(id, updateDto);
    
    // Ensure referenceImages are included
    let referenceImages = (quotation as any).referenceImages;
    if (!referenceImages) {
      referenceImages = [];
    }
    if (!Array.isArray(referenceImages)) {
      referenceImages = [];
    }
    
    return {
      ...quotation,
      referenceImages: referenceImages,
    };
  }
}

