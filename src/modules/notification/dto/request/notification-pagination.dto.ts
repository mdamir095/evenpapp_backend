import { ApiProperty } from '@nestjs/swagger';
import { NotificationStatus } from '@shared/enums/notificationStatus';
import { Type } from 'class-transformer';
import { IsOptional, IsNumber, Min, Max, IsString, IsEnum } from 'class-validator';
export class NotificationPaginationDto {
  @ApiProperty({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ example: 10, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiProperty({ required: false, description: 'Search by title/message' })
  @IsOptional()
  @IsString()
  search?: string;


  @ApiProperty({ enum: NotificationStatus, required: false })
  @IsOptional()
  @IsEnum(NotificationStatus)
  status?: NotificationStatus;
}

