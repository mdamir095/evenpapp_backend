import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { FieldsService } from './field.service';
import { CreateFieldDto } from './dto/request/create-field.dto';
import { UpdateFieldDto } from './dto/request/update-field.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FeatureType } from '@shared/enums/featureType';
import { FeatureGuard } from '@common/guards/features.guard';
import { Features } from '@common/decorators/permission.decorator';

@ApiTags('Fields')
@ApiBearerAuth()
@UsePipes(new ValidationPipe({ transform: true }))
@UseGuards(AuthGuard('jwt'), FeatureGuard)
@Features(FeatureType.FORM_BUILDER)
@Controller('fields')
export class FieldsController {
  constructor(private readonly fieldsService: FieldsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new field' })
  create(@Body() createFieldDto: CreateFieldDto) {
    return this.fieldsService.create(createFieldDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all fields' })
  findAll() {
    return this.fieldsService.findAll();
  }

  @Get(':key')
  @ApiOperation({ summary: 'Get a field by key' })
  findOne(@Param('key') key: string) {
    return this.fieldsService.findOne(key);
  }

  @Patch(':key')
  @ApiOperation({ summary: 'Update a field by key' })
  update(@Param('key') key: string, @Body() updateFieldDto: UpdateFieldDto) {
    return this.fieldsService.update(key, updateFieldDto);
  }

  @Delete(':key')
  @ApiOperation({ summary: 'Delete a field by key' }) 
  remove(@Param('key') key: string) {
    return this.fieldsService.remove(key);
  }
}
