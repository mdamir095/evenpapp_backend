import { IsOptional, IsEmail, MinLength, IsString, IsNotEmpty, Matches, IsArray, ArrayNotEmpty, ArrayUnique } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'user@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;
  @ApiPropertyOptional({ example: 'admin' })
  @IsOptional()
  @IsString()
  firstName?: string;
  @ApiPropertyOptional({ example: 'admin' })
  @IsOptional()
  @IsString()
  lastName?: string;
 @IsOptional()
  @IsString()
  countryCode: string;

  @IsOptional()
  @IsString()
  phoneNumber: string;

  @ApiPropertyOptional({ example: 'company' })
  @IsOptional()
  @IsString()
  organizationName?: string;  

  @ApiPropertyOptional({ example: '/uploads/profile/image.jpg' })
  @IsOptional()
  @IsString()
  profileImage?: string;

  @ApiPropertyOptional({ example: '123 Main St, Anytown, USA' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 'New York' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'Delhi' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ example: '201001' })
  @IsOptional()
  @IsString()
  pincode?: string;

  @ApiPropertyOptional({ example: '1234567890' })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiPropertyOptional({ example: 'Male' })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional({ example: '1990-01-01' })
  @IsOptional()
  @IsString()
  birthday?: string;

  @ApiPropertyOptional({
    example: ['admin', 'editor'],
    description: 'Array of roles assigned to the user',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty({ message: 'Roles array cannot be empty' })
  @ArrayUnique({ message: 'Roles must be unique' })
  @IsString({ each: true })
  roleIds?: string[];
}
