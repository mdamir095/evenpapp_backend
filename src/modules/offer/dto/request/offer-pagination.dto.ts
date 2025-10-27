import { ApiProperty } from '@nestjs/swagger';
import { OfferStatus } from '@shared/enums/offerStatus';
import { OfferType } from '@shared/enums/offerType';
import { Type } from 'class-transformer';
import { IsOptional, IsNumber, IsString, Min, Max, IsEnum } from 'class-validator';

export class OfferPaginationDto {
  @ApiProperty({ description: 'Page number (starts from 1)', example: 1, default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ description: 'Number of items per page', example: 10, default: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiProperty({ description: 'Search term to filter offers by title or description', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ enum: OfferType, required: false })
  @IsOptional()
  @IsEnum(OfferType)
  type?: OfferType;

  @ApiProperty({ enum: OfferStatus, required: false })
  @IsOptional()
  @IsEnum(OfferStatus)
  status?: OfferStatus;

}

