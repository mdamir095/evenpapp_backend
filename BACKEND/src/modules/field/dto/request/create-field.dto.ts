import { FieldMetadataDto } from '@modules/form/dto/request/field-metadata-dto';
import { FieldValidationDto } from '@modules/form/dto/request/field-validation.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsNumber, IsString, ValidateNested } from 'class-validator';

export class CreateFieldDto {
    @ApiProperty({
        description: 'The name of the field',
        example: 'Button',
    })
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        description: 'The description of the field',
        example: 'This is the description of the field',
    })
    @IsOptional()
    description?: string;

    @ApiProperty({
        description: 'The order of the field',
        example: 1,
    })
    @IsNumber()
    order: number;

    @ApiProperty({
        description: 'The field type',
        example: 'text',
    })
    @IsString()
    type: string;

    @ApiProperty({
        description: 'The field validation',
        example: {
            required: {
                value: true,
                message: 'This field is required',
            },
            min: {
                value: 1,
                message: 'This field must be greater than 1',
            },
            max: {
                value: 10,
                message: 'This field must be less than 10',
            },
            regex: {
                value: '^[a-zA-Z0-9]+$',
                message: 'This field must contain only letters and numbers',
            },
            invalidType: {
                value: 'string',
                message: 'This field must be a string',
            },
        },
    })
    @ValidateNested()
    @Type(() => FieldValidationDto)
    validation: FieldValidationDto;

    @ApiProperty({
        description: 'The field metadata',
        example: {
            label: 'Name',
            placeholder: 'Enter your name',
            tooltip: 'This is the tooltip of the field',
            options: ['Option 1', 'Option 2'],
            icon: 'fa-solid fa-user',
            defaultValue: 'John Doe',
        },
    })
    @ValidateNested()
    @Type(() => FieldMetadataDto)
    metadata: FieldMetadataDto;
 
}
