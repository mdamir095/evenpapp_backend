import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty } from "class-validator";

export class GoogleLoginDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: 'Google ID token',
        example: 'eyJhbGciOiJSUzI1NiIs...',
        required: true
    })
    token: string;
}