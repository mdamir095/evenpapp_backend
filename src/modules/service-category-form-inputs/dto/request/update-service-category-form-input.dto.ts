import { PartialType } from '@nestjs/swagger';
import { CreateServiceCategoryFormInputDto } from './create-service-category-form-input.dto';

export class UpdateServiceCategoryFormInputDto extends PartialType(CreateServiceCategoryFormInputDto) {}
