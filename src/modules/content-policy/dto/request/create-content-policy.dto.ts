import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsDateString, IsNotEmpty, IsOptional, IsString, IsEnum, ValidateIf } from "class-validator";
export class CreateContentPolicyDto {
    @ApiProperty({ description: 'Policy title' })
    @IsNotEmpty()
    @IsString()
    title: string;

    @ApiProperty({ description: 'Policy content in HTML format' })
    @IsNotEmpty()
    @IsString()
    content: string;

    @ApiProperty({ 
        description: 'Policy category - can be predefined or custom',
        example: "terms-of-service",
        enum: ['privacy-policy', 'terms-of-service', 'cookie-policy', 'data-protection','user-agreement', 'about-us']
    })
    @IsNotEmpty({ message: 'Category is required' })
    @IsString({ message: 'Category must be a string' })
    category: string;

    @ApiProperty({ description: 'Effective date of the policy', example: '2023-12-01' })
    @IsNotEmpty()
    @IsDateString()
    effectiveDate: string;
}
