import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ResendResetLinkDto {
  @ApiProperty({ example: 'john.doe@example.com', description: 'Email address' })
  @IsEmail()
  email: string;
}


