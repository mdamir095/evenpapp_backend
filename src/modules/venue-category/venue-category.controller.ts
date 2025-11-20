import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { CreateVenueCategoryDto } from './dto/request/create-venue-category.dto';
import { VenueCategoryService } from './venue-category.service';
import { UpdateVenueCategoryDto } from './dto/request/update-venue-category.dto';
import { VenueCategoryResponseDto } from './dto/response/venue-category.dto';
import { ApiOperation, ApiQuery, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { IPagination } from '../../common/interfaces/pagination.interface';
import { UpdateVenueCategoryStatusDto } from './dto/request/update-venue-category-status.dto';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Venue Categories')
@Controller('venue-category')
@ApiBearerAuth()
export class VenueCategoryController {
    constructor(private readonly venueCategoryService: VenueCategoryService) {}

    @Post()
    create(@Body() createVenueCategoryDto: CreateVenueCategoryDto): Promise<VenueCategoryResponseDto> {
        return this.venueCategoryService.create(createVenueCategoryDto);
    }

    @Get()
      @ApiOperation({ summary: 'Get all venue categories filtered by venue-category form type' })
      @ApiQuery({ name: 'page', type: Number, required: true, description: 'Page number' })
      @ApiQuery({ name: 'limit', type: Number, required: true, description: 'Limit number' })
      @ApiQuery({ name: 'search', type: String, required: false, description: 'Search string' })
    findAll(@Query('page') page: number = 1, 
        @Query('limit') limit: number = 10,
        @Query('search') search: string = ''): Promise<IPagination<VenueCategoryResponseDto>> {
        return this.venueCategoryService.findAll(page, limit, search);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.venueCategoryService.findOne(id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateVenueCategoryDto: UpdateVenueCategoryDto): Promise<VenueCategoryResponseDto> {
        return this.venueCategoryService.update(id, updateVenueCategoryDto);
    }

    @Delete(':id')
    delete(@Param('id') id: string): Promise<{ message: string }> {
        return this.venueCategoryService.delete(id);
    }

    @Patch(':id/status')
    @ApiOperation({ summary: 'Update venue category active status' })
    updateStatus(
        @Param('id') id: string,
        @Body() dto: UpdateVenueCategoryStatusDto,
    ): Promise<{ message: string }> {
        return this.venueCategoryService.updateStatus(id, dto.isActive);
    }

     @Get('user')
     @UseGuards(AuthGuard('jwt'))
      @ApiOperation({ summary: 'Get all venue categories filtered by venue-category form type' })
      @ApiQuery({ name: 'page', type: Number, required: true, description: 'Page number' })
      @ApiQuery({ name: 'limit', type: Number, required: true, description: 'Limit number' })
      @ApiQuery({ name: 'search', type: String, required: false, description: 'Search string' })
    findAllForUser(@Query('page') page: number = 1, 
        @Query('limit') limit: number = 10,
        @Query('search') search: string = ''): Promise<IPagination<VenueCategoryResponseDto>> {
        return this.venueCategoryService.findAll(page, limit, search);
    }

    @Get('user/:id')
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Get venue category by ID filtered by venue-category form type' })
    findOneForUser(@Param('id') id: string) {
        return this.venueCategoryService.findOne(id);
    }
}
