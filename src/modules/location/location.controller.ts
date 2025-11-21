import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, UsePipes, ValidationPipe, Patch } from '@nestjs/common';
import { LocationService } from './location.service';
import { CreateLocationDto } from './dto/request/create-location.dto';
import { UpdateLocationDto } from './dto/request/update-location.dto';
import { LocationResponseDto } from './dto/response/location.dto';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Location')
@Controller('location')
@ApiBearerAuth()
@UsePipes(new ValidationPipe({ transform: true }))
export class LocationController {
  constructor(private readonly service: LocationService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(@Body() createLocationDto: CreateLocationDto): Promise<LocationResponseDto> {
    const location = await this.service.create(createLocationDto);
    // Convert the Location entity to LocationResponseDto
    return {
      ...location,
      id: location.id.toString(), // Ensure id is a string
    } as LocationResponseDto;
  }

  @Get()
  @ApiOperation({ summary: 'List locations (filter by serviceId)' })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'serviceId', type: String, required: false })
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10, 
   @Query('serviceId') serviceId?: string,
  ) {
    return this.service.findAll(
      typeof page === 'string' ? parseInt(page, 10) : page,
      typeof limit === 'string' ? parseInt(limit, 10) : limit,
      serviceId
    );
  } 

  // @Delete(':serviceId')
  // @UseGuards(AuthGuard('jwt'))
  // removeByServiceId(@Param('serviceId') serviceId: string) {
  //   return this.service.deleteByServiceId(serviceId)  ;
  // }
  // @ApiQuery({ name: 'latitude', type: Number, required: true })
  // @ApiQuery({ name: 'longitude', type: Number, required: true })
  // @ApiQuery({ name: 'radius', type: Number, required: false, description: 'Radius in meters' })
  // @ApiQuery({ name: 'serviceId', type: String, required: false, description: 'Optional service ID to filter by' })
  // findNearby(
  //   @Query('latitude') latitude: number,
  //   @Query('longitude') longitude: number,
  //   @Query('radius') radius: number = 10000, // Default to 10km
  //   @Query('serviceId') serviceId?: string,
  // ) {
  //   return this.service.findNearby(latitude, longitude, radius, serviceId);
  // }

  // @Get(':id')
  // @UseGuards(AuthGuard('jwt'))
  // findOne(@Param('id') id: string) {
  //   return this.service.findOne(id);
  // }

  // @Put(':id')
  // @UseGuards(AuthGuard('jwt'))
  // update(@Param('id') id: string, @Body() updateLocationDto: UpdateLocationDto) {
  //   return this.service.update(id, updateLocationDto);
  // }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
  
  @Get('nearby/search')
  @ApiOperation({ summary: 'Find nearby vendors/venues by coordinates (defaults to vendors only)' })
  @ApiQuery({ name: 'lng', type: Number })
  @ApiQuery({ name: 'lat', type: Number })
  @ApiQuery({ name: 'radius', type: Number, required: false, description: 'Meters', example: 5000 })
  @ApiQuery({ name: 'type', type: String, required: false, description: 'vendor (default) | venue', enum: ['vendor', 'venue'] })
  findNearby(
    @Query('lng') lng: string,
    @Query('lat') lat: string,
    @Query('radius') radius?: string,
    @Query('type') type?: 'vendor' | 'venue',
  ) {
    // Default to 'vendor' if type is not specified - only return vendor services
    const searchType = type || 'vendor';
    return this.service.findNearby(parseFloat(lng), parseFloat(lat), radius ? parseInt(radius, 10) : 5000, searchType);
  }
}

