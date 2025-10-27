import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export enum UserTypeEnum {
  USER = 'USER',
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  ENTERPRISE = 'ENTERPRISE',
  ENTERPRISE_USER = 'ENTERPRISE_USER',
}

export class UpdateUserTypeDto {
  @ApiProperty({ enum: UserTypeEnum, example: UserTypeEnum.USER })
  @IsEnum(UserTypeEnum)
  userType: UserTypeEnum;
}


