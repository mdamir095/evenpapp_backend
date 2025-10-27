import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { CreateVendorCategoryDto } from './dto/request/create-vendor-category.dto';
import { VendorCategoryService } from './vendor-category.service';
import { UpdateVendorCategoryDto } from './dto/request/update-vendor-category.dto';
import { VendorCategoryResponseDto } from './dto/response/vendor-category.dto';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { IPagination } from '../../common/interfaces/pagination.interface';
import { FeatureGuard } from '@common/guards/features.guard';
import { FeatureType } from '@shared/enums/featureType';
import { AuthGuard } from '@nestjs/passport';
import { Features } from '@common/decorators/permission.decorator';
import { UpdateVendorCategoryStatusDto } from './dto/request/update-vendor-category-status.dto';

@ApiTags('Vendor Categories')
@Controller('vendor-categories')
@ApiBearerAuth()
@UsePipes(new ValidationPipe({ transform: true }))
@UseGuards(AuthGuard('jwt'), FeatureGuard)
@Features(FeatureType.VENDOR_CATEGORY)
export class VendorCategoryController {
    constructor(private readonly vendorCategoryService: VendorCategoryService) {}

    @Post()
    create(@Body() createVendorCategoryDto: CreateVendorCategoryDto): Promise<VendorCategoryResponseDto> {
        return this.vendorCategoryService.create(createVendorCategoryDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all vendor categories' })
    @ApiQuery({ name: 'page', type: Number, required: true, description: 'Page number' })
    @ApiQuery({ name: 'limit', type: Number, required: true, description: 'Limit number' })
    @ApiQuery({ name: 'search', type: String, required: false, description: 'Search string' })
    findAll(@Query('page') page: number = 1, 
        @Query('limit') limit: number = 10,
        @Query('search') search: string = ''): Promise<IPagination<VendorCategoryResponseDto>> {
        return this.vendorCategoryService.findAll(page, limit, search);
    }

    @Get(':id')
    findOne(@Param('id') id: string): Promise<VendorCategoryResponseDto> {
        return this.vendorCategoryService.findOne(id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateVendorCategoryDto: UpdateVendorCategoryDto): Promise<VendorCategoryResponseDto> {
        return this.vendorCategoryService.update(id, updateVendorCategoryDto);
    }

    @Delete(':id')
    delete(@Param('id') id: string): Promise<{ message: string }> {
        return this.vendorCategoryService.delete(id);
    }

    @Patch(':id/status')
    @ApiOperation({ summary: 'Update vendor category active status' })
    updateStatus(
        @Param('id') id: string,
        @Body() dto: UpdateVendorCategoryStatusDto,
    ): Promise<{ message: string }> {
        return this.vendorCategoryService.updateStatus(id, dto.isActive);
    }

    
    @Get('user')
    @ApiOperation({ summary: 'Get all vendor categories for user' })
    @ApiQuery({ name: 'page', type: Number, required: true, description: 'Page number' })
    @ApiQuery({ name: 'limit', type: Number, required: true, description: 'Limit number' })
    @ApiQuery({ name: 'search', type: String, required: false, description: 'Search string' })
    findAllForUser(@Query('page') page: number = 1, 
        @Query('limit') limit: number = 10,
        @Query('search') search: string = ''): Promise<IPagination<VendorCategoryResponseDto>> {
        return this.vendorCategoryService.findAll(page, limit, search);
    }

    @Get('user/:id')
    findOneForUser(@Param('id') id: string): Promise<VendorCategoryResponseDto> {
        return this.vendorCategoryService.findOne(id);
    }
}
