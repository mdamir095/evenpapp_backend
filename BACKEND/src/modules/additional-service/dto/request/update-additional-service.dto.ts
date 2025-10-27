import { PartialType } from '@nestjs/swagger';
import { CreateAdditionalServiceDto } from './create-additional-service.dto';

export class UpdateAdditionalServiceDto extends PartialType(CreateAdditionalServiceDto) {}
