import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, UsePipes, ValidationPipe, Patch } from '@nestjs/common';
import { CreateServiceCategoryDto } from './dto/request/create-service-category.dto';
import { ServiceCategoryService } from './service-category.service';
import { UpdateServiceCategoryDto } from './dto/request/update-service-category.dto';
import { ServiceCategoryResponseDto } from './dto/response/service-category.dto';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { IPagination } from '../../common/interfaces/pagination.interface';
import { FeatureType } from '@shared/enums/featureType';
import { AuthGuard } from '@nestjs/passport';
import { FeatureGuard } from '@common/guards/features.guard';
import { Features } from '@common/decorators/permission.decorator';
import { UpdateServiceCategoryStatusDto } from './dto/request/update-service-category-status.dto';


@ApiTags('Service Category')
@Controller('service-category')
@ApiBearerAuth()
@UsePipes(new ValidationPipe({ transform: true }))
export class ServiceCategoryController {
    constructor(private readonly serviceCategoryService: ServiceCategoryService) {}
    @Get('user')
    @UseGuards(AuthGuard('jwt')) 
    @ApiOperation({ summary: 'Get all service categories for user' })
    @ApiQuery({ name: 'page', type: Number, required: true, description: 'Page number' })
    @ApiQuery({ name: 'limit', type: Number, required: true, description: 'Limit number' })
    @ApiQuery({ name: 'search', type: String, required: false, description: 'Search string' })
    findAllForUser(@Query('page') page: number = 1, 
    @Query('limit') limit: number = 10,
    @Query('search') search: string = ''): Promise<IPagination<ServiceCategoryResponseDto>> {
        return this.serviceCategoryService.findAll(page, limit, search);
    }

    @Get('user/:id')
     @UseGuards(AuthGuard('jwt'))
     @ApiQuery({ name: 'type', type: String, required: false, description: 'Filter by type: vendor or venue', enum: ['vendor', 'venue'] })
    findOneForUser(@Param('id') id: string, @Query('type') type?: string): Promise<ServiceCategoryResponseDto> {
        return this.serviceCategoryService.findOne(id, type);
    }

    @Post()
    @UseGuards(AuthGuard('jwt'), FeatureGuard)
    @Features(FeatureType.SERVICE_CATEGORY)
    create(@Body() createServiceCategoryDto: CreateServiceCategoryDto): Promise<ServiceCategoryResponseDto> {
        console.log('=== CREATE SERVICE CATEGORY CONTROLLER ===');
        console.log('Received DTO:', createServiceCategoryDto);
        console.log('formId in DTO:', createServiceCategoryDto.formId);
        console.log('formId type:', typeof createServiceCategoryDto.formId);
        console.log('========================================');
        return this.serviceCategoryService.create(createServiceCategoryDto);
    }

    @Get()
    @UseGuards(AuthGuard('jwt'), FeatureGuard)
    @Features(FeatureType.SERVICE_CATEGORY)
    @ApiOperation({ summary: 'Get all service categories' })
    @ApiQuery({ name: 'page', type: Number, required: true, description: 'Page number' })
    @ApiQuery({ name: 'limit', type: Number, required: true, description: 'Limit number' })
    @ApiQuery({ name: 'search', type: String, required: false, description: 'Search string' })
    findAll(@Query('page') page: number = 1, 
        @Query('limit') limit: number = 10,
        @Query('search') search: string = ''): Promise<IPagination<ServiceCategoryResponseDto>> {
        return this.serviceCategoryService.findAll(page, limit, search);
    }

    @Get(':id')
    @UseGuards(AuthGuard('jwt'), FeatureGuard)
    @Features(FeatureType.SERVICE_CATEGORY)
    findOne(@Param('id') id: string): Promise<ServiceCategoryResponseDto> {
        return this.serviceCategoryService.findOne(id);
    }

    @Put(':id')
    @UseGuards(AuthGuard('jwt'), FeatureGuard)
    @Features(FeatureType.SERVICE_CATEGORY)
    update(@Param('id') id: string, @Body() updateServiceCategoryDto: UpdateServiceCategoryDto): Promise<ServiceCategoryResponseDto> {
        console.log('=== UPDATE SERVICE CATEGORY CONTROLLER ===');
        console.log('Update ID:', id);
        console.log('Received DTO:', updateServiceCategoryDto);
        console.log('formId in DTO:', updateServiceCategoryDto.formId);
        console.log('formId type:', typeof updateServiceCategoryDto.formId);
        console.log('==========================================');
        return this.serviceCategoryService.update(id, updateServiceCategoryDto);
    }

    @Delete(':id')
    @UseGuards(AuthGuard('jwt'), FeatureGuard)
    @Features(FeatureType.SERVICE_CATEGORY)
    delete(@Param('id') id: string): Promise<{ message: string }> {
        return this.serviceCategoryService.delete(id);
    }

    @Patch(':id/status')
    @UseGuards(AuthGuard('jwt'), FeatureGuard)
    @Features(FeatureType.SERVICE_CATEGORY)
    @ApiOperation({ summary: 'Update service category active status' })
    updateStatus(
        @Param('id') id: string,
        @Body() dto: UpdateServiceCategoryStatusDto,
    ): Promise<{ message: string }> {
        return this.serviceCategoryService.updateStatus(id, dto.isActive);
    }

 
}
