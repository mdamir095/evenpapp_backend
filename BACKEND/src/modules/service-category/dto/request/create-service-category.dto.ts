import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsOptional, IsString, Matches, IsMongoId } from "class-validator";

export class CreateServiceCategoryDto {
    @ApiProperty({ description: 'Service category name' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({ description: 'Service category description' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ description: 'Form ID to link with this category', required: false })
    @IsOptional()
    @IsString()
    formId?: string;

    @ApiProperty({ example: true, default: true })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
