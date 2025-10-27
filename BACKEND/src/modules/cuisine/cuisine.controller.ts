import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FeatureGuard } from '@common/guards/features.guard';
import { Features } from '@common/decorators/permission.decorator';
import { FeatureType } from '@shared/enums/featureType';
import { CuisineService } from './cuisine.service';
import { CreateCuisineDto } from './dto/request/create-cuisine.dto';
import { UpdateCuisineDto } from './dto/request/update-cuisine.dto';
import { UpdateCuisineStatusDto } from './dto/request/update-cuisine-status.dto';
import { CuisineResponseDto } from './dto/response/cuisine.dto';
import { IPagination } from '@common/interfaces/pagination.interface';

@ApiTags('Cuisines')
@Controller('cuisines')
@ApiBearerAuth()
@UsePipes(new ValidationPipe({ transform: true }))
export class CuisineController {
  constructor(private readonly service: CuisineService) {}

  @Get('user')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get all cuisines for user' })
  @ApiQuery({ name: 'page', type: Number, required: true })
  @ApiQuery({ name: 'limit', type: Number, required: true })
  @ApiQuery({ name: 'search', type: String, required: false })
  findAllForUser(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search: string = '',
  ): Promise<IPagination<CuisineResponseDto>> {
    return this.service.findAll(page, limit, search);
  }

  @Get('user/:id')
  @UseGuards(AuthGuard('jwt'))
  findOneForUser(@Param('id') id: string): Promise<CuisineResponseDto> {
    return this.service.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), FeatureGuard)
  @Features(FeatureType.CUISINE)
  create(@Body() dto: CreateCuisineDto): Promise<CuisineResponseDto> {
    return this.service.create(dto);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), FeatureGuard)
  @Features(FeatureType.CUISINE)
  @ApiOperation({ summary: 'Get all cuisines' })
  @ApiQuery({ name: 'page', type: Number, required: true })
  @ApiQuery({ name: 'limit', type: Number, required: true })
  @ApiQuery({ name: 'search', type: String, required: false })
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search: string = '',
  ): Promise<IPagination<CuisineResponseDto>> {
    return this.service.findAll(page, limit, search);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), FeatureGuard)
  @Features(FeatureType.CUISINE)
  findOne(@Param('id') id: string): Promise<CuisineResponseDto> {
    return this.service.findOne(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), FeatureGuard)
  @Features(FeatureType.CUISINE)
  update(@Param('id') id: string, @Body() dto: UpdateCuisineDto): Promise<CuisineResponseDto> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), FeatureGuard)
  @Features(FeatureType.CUISINE)
  delete(@Param('id') id: string): Promise<{ message: string }> {
    return this.service.delete(id);
  }

  @Patch(':id/status')
  @UseGuards(AuthGuard('jwt'), FeatureGuard)
  @Features(FeatureType.CUISINE)
  @ApiOperation({ summary: 'Update cuisine active status' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateCuisineStatusDto,
  ): Promise<{ message: string }> {
    return this.service.updateStatus(id, dto.isActive);
  }
}


