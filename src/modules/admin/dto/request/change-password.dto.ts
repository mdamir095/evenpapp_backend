import { IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ example: 'OldPassword@123' })
  @IsString()
  currentPassword: string;

  @ApiProperty({
    example: 'NewPassword@123',
    description: 'Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char',
  })
  @IsString()
  @MinLength(8)
  @Matches(/(?=.*[a-z])/, { message: 'Must contain at least one lowercase letter' })
  @Matches(/(?=.*[A-Z])/, { message: 'Must contain at least one uppercase letter' })
  @Matches(/(?=.*\d)/, { message: 'Must contain at least one number' })
  @Matches(/(?=.*[@$!%*?&])/, { message: 'Must contain at least one special character' })
  newPassword: string;

  @ApiProperty({ example: 'NewPassword@123' })
  @IsString()
  confirmPassword: string;
}
