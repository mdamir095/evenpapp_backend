import { PartialType } from '@nestjs/swagger';
import { CreateMealTypeDto } from './create-meal-type.dto';

export class UpdateMealTypeDto extends PartialType(CreateMealTypeDto) {}

