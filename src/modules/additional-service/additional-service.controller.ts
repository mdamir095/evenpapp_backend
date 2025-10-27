import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FeatureGuard } from '@common/guards/features.guard';
import { Features } from '@common/decorators/permission.decorator';
import { FeatureType } from '@shared/enums/featureType';
import { AdditionalServiceService } from './additional-service.service';
import { CreateAdditionalServiceDto } from './dto/request/create-additional-service.dto';
import { UpdateAdditionalServiceDto } from './dto/request/update-additional-service.dto';
import { UpdateAdditionalServiceStatusDto } from './dto/request/update-additional-service-status.dto';
import { AdditionalServiceResponseDto } from './dto/response/additional-service.dto';
import { IPagination } from '@common/interfaces/pagination.interface';

@ApiTags('Additional Services')
@Controller('additional-services')
@ApiBearerAuth()
@UsePipes(new ValidationPipe({ transform: true }))
export class AdditionalServiceController {
  constructor(private readonly service: AdditionalServiceService) {}

  @Get('user')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get all additional services for user' })
  @ApiQuery({ name: 'page', type: Number, required: true })
  @ApiQuery({ name: 'limit', type: Number, required: true })
  @ApiQuery({ name: 'search', type: String, required: false })
  findAllForUser(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search: string = '',
  ): Promise<IPagination<AdditionalServiceResponseDto>> {
    return this.service.findAll(page, limit, search);
  }

  @Get('user/:id')
  @UseGuards(AuthGuard('jwt'))
  findOneForUser(@Param('id') id: string): Promise<AdditionalServiceResponseDto> {
    return this.service.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), FeatureGuard)
  @Features(FeatureType.ADDITIONAL_SERVICE)
  create(@Body() dto: CreateAdditionalServiceDto): Promise<AdditionalServiceResponseDto> {
    return this.service.create(dto);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), FeatureGuard)
  @Features(FeatureType.ADDITIONAL_SERVICE)
  @ApiOperation({ summary: 'Get all additional services' })
  @ApiQuery({ name: 'page', type: Number, required: true })
  @ApiQuery({ name: 'limit', type: Number, required: true })
  @ApiQuery({ name: 'search', type: String, required: false })
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search: string = '',
  ): Promise<IPagination<AdditionalServiceResponseDto>> {
    return this.service.findAll(page, limit, search);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), FeatureGuard)
  @Features(FeatureType.ADDITIONAL_SERVICE)
  findOne(@Param('id') id: string): Promise<AdditionalServiceResponseDto> {
    return this.service.findOne(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), FeatureGuard)
  @Features(FeatureType.ADDITIONAL_SERVICE)
  update(@Param('id') id: string, @Body() dto: UpdateAdditionalServiceDto): Promise<AdditionalServiceResponseDto> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), FeatureGuard)
  @Features(FeatureType.ADDITIONAL_SERVICE)
  delete(@Param('id') id: string): Promise<{ message: string }> {
    return this.service.delete(id);
  }

  @Patch(':id/status')
  @UseGuards(AuthGuard('jwt'), FeatureGuard)
  @Features(FeatureType.ADDITIONAL_SERVICE)
  @ApiOperation({ summary: 'Update additional service active status' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateAdditionalServiceStatusDto,
  ): Promise<{ message: string }> {
    return this.service.updateStatus(id, dto.isActive);
  }
}
