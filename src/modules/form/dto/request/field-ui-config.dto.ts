import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class FieldUiConfigDto {
    @ApiProperty({ description: 'Grid column', required: false, example: 6 })
    @IsOptional()
    @IsNumber()
    gridColumn?: number;

    @ApiProperty({ description: 'CSS class', required: false, example: 'col-md-6' })
    @IsOptional()
    @IsString()
    cssClass?: string;

    @ApiProperty({ description: 'Hidden', required: false, example: false })
    @IsOptional()
    @IsBoolean()
    hidden?: boolean;

    @ApiProperty({ description: 'Readonly', required: false, example: false })
    @IsOptional()
    @IsBoolean()
    readonly?: boolean;

    @ApiProperty({ description: 'Disabled', required: false, example: false })
    @IsOptional()
    @IsBoolean()
    disabled?: boolean;
}