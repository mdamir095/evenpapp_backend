import { ApiProperty } from "@nestjs/swagger";

export class GoogleLoginDto {
    @ApiProperty()
    token: string; // Google ID token
  }