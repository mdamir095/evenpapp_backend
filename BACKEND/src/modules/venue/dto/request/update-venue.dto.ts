// src/modules/venue/dto/update-venue.dto.ts

import { PartialType } from '@nestjs/swagger';
import { CreateVenueDto } from './create-venue.dto';

export class UpdateVenueDto extends PartialType(CreateVenueDto) {}
