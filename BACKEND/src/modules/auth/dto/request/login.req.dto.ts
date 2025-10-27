import { IsOptionalBoolean } from '@common/decorators/validation/validation.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export * from '../../../../shared/dto/login.req.dto';

export class LoginReqDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Secret123!' })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;
}
