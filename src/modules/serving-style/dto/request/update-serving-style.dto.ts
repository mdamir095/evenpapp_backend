import { PartialType } from '@nestjs/swagger';
import { CreateServingStyleDto } from './create-serving-style.dto';

export class UpdateServingStyleDto extends PartialType(CreateServingStyleDto) {}


