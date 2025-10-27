import { PartialType } from '@nestjs/swagger';
import { CreateVendorCategoryDto } from './create-vendor-category.dto';

export class UpdateVendorCategoryDto extends PartialType(CreateVendorCategoryDto) {}
