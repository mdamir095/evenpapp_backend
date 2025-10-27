import { ApiProperty } from '@nestjs/swagger';

export class LoginResDto {
  @ApiProperty({ example: 'jwt.token.here' })
  accessToken: string;
}

export interface IAuthPayload {
  id: string;
  accessToken: string;
  firstName: string;
  lastName: string;
  email: string;
  organizationName: string;
  roles: any[];
  profileImage?: string;
  isEmailVerified?: boolean;
  isActive?: boolean;
  enterpriseId?: string;
}
