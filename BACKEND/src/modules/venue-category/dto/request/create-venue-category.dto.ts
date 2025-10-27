import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsOptional, IsString, Matches, IsMongoId } from "class-validator";

export class CreateVenueCategoryDto {
    @ApiProperty({ description: 'Venue category name' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({ description: 'Venue category description' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ example: 'fa-solid fa-building', required: false })
    @IsOptional()
    @IsString()
    icon?: string;

    @ApiProperty({ example: '#4CAF50', required: false, default: '#000000' })
    @IsOptional()
    @Matches(/^#([0-9A-Fa-f]{6})$/, { message: 'Color must be a valid hex code (e.g., #000000)' })
    color?: string;

    @ApiProperty({ description: 'Form ID associated with this venue category', required: false })
    @IsOptional()
    @IsMongoId()
    formId?: string;

    @ApiProperty({ example: true, default: true })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
