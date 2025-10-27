import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsBoolean, MinLength, MaxLength } from 'class-validator';

export class CreateFaqDto {
  @ApiProperty({
    description: 'FAQ question',
    example: 'How do I create an event?',
    minLength: 10,
    maxLength: 500
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  question: string;

  @ApiProperty({
    description: 'FAQ answer',
    example: 'To create an event, navigate to the events section and click on "Create New Event". Fill in all required fields including event name, date, venue, and description.',
    minLength: 20
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(20)
  answer: string;

  @ApiProperty({
    description: 'Whether the FAQ is expanded',
    example: true,
    required: false,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  isExpanded?: boolean;

}
