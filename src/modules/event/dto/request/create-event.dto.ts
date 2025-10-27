import { IsNotEmpty, IsString, IsDateString, IsEnum } from 'class-validator';
import { EventType } from '../../entities/event.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEventDto {

  @ApiProperty({ description: 'title of event', example:"Wedding Event" })
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Type of event', enum: EventType, example: EventType.WEDDING })
  @IsNotEmpty()
  @IsEnum(EventType, { message: 'Type must be one of: Wedding, Birthday, Conference, Meeting' })
  type: EventType;

  @ApiProperty({description:'Event date in ISO format', example: '2025-07-21T18:30:00.000Z'})
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @ApiProperty({ description: 'Event location', example: 'A-40, Noida UP' })
  @IsNotEmpty()
  @IsString()
  location: string;

}
