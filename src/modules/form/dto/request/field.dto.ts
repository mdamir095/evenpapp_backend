import { ApiProperty } from '@nestjs/swagger';
import { ValidateNested, IsArray, IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { FieldMetadataDto } from './field-metadata-dto';
import { FieldValidationDto } from './field-validation.dto';
import { FieldUiConfigDto } from './field-ui-config.dto';

export class FieldDto {
  @ApiProperty({ description: 'Unique field id' })
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiProperty({ description: 'Unique field key' })
  @IsNotEmpty()
  @IsString()
  key: string;

  @ApiProperty({ description: 'Field name' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Field type', example: 'text | number | dropdown' })
  @IsNotEmpty()
  @IsString()
  type: string;

  @ApiProperty({ description: 'Field metadata', type: () => FieldMetadataDto })
  @ValidateNested()
  @Type(() => FieldMetadataDto)
  metadata: FieldMetadataDto;

  @ApiProperty({ description: 'Field validation', required: false, type: () => FieldValidationDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => FieldValidationDto)
  validation?: FieldValidationDto;

  @ApiProperty({ description: 'Field order', required: false })
  @IsNumber()
  order: number;

  @ApiProperty({ description: 'Field uiConfig', required: false, type: () => FieldUiConfigDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => FieldUiConfigDto)
  uiConfig?: FieldUiConfigDto;

  @ApiProperty({ description: 'Dependent fields', required: false, type: FieldDto, isArray: true, 
    example: [
      {
        "key": "string",
        "name": "string",
        "type": "text | number | dropdown",
        "metadata": {
          "label": "string",
          "placeholder": "string",
          "options": [
            "string"
          ],
          "tooltip": "string",
          "icon": "string",
          "defaultValue": {}
        },
        "validation": {
          "required": {
            "value": true,
            "message": "This field is required"
          },
          "min": {
            "value": 1,
            "message": "This field must be greater than 1"
          },
          "max": {
            "value": 1,
            "message": "This field must be greater than 1"
          },
          "regex": {
            "value": "test",
            "message": "This field must be a string"
          },
          "invalidType": {
            "value": "test",
            "message": "This field must be a string"
          }
        },
        "order": 0,
        "uiConfig": {
          "gridColumn": 0,
          "cssClass": "string",
          "hidden": false,
          "readonly": false,
          "disabled": false
        },
        "dependencies": [
        ]
      }
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FieldDto)
  dependencies?: FieldDto[];
}
