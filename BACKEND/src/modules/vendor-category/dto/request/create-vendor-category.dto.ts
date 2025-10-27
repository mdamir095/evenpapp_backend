import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsMongoId, IsNotEmpty, IsOptional, IsString, Matches } from "class-validator";

export class CreateVendorCategoryDto {
    @ApiProperty({ description: 'Vendor Category name' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({ description: 'Vendor Category description' })
    @IsOptional()
    @IsString()
    description?: string;
    
    @ApiProperty({ description: 'Form ID associated with this venue category', required: false })
    @IsOptional()
    @IsMongoId()
    formId?: string;

    @ApiProperty({ example: 'fa-solid fa-tree', required: false })
    @IsOptional()
    @IsString()
    icon?: string;

    @ApiProperty({ example: '#4CAF50', required: false, default: '#000000' })
    @IsOptional()
    @Matches(/^#([0-9A-Fa-f]{6})$/, { message: 'Color must be a valid hex code (e.g., #000000)' })
    color?: string;

    @ApiProperty({ example: true, default: true })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
