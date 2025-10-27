import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsBoolean, IsNumber, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

class BooleanRuleDto {
  @ApiProperty({ description: 'Value', example: true })
  @IsBoolean()
  value: boolean;

  @ApiProperty({ description: 'Message', example: 'This field is required' })
  @IsString()
  message: string;
}

class NumberRuleDto {
  @ApiProperty({ description: 'Value', example: 1 })
  @IsNumber()
  value: number;

  @ApiProperty({ description: 'Message', example: 'This field must be greater than 1' })
  @IsString()
  message: string;
}

class StringRuleDto {
  @ApiProperty({ description: 'Value', example: 'test' })
  @IsString()
  value: string;

  @ApiProperty({ description: 'Message', example: 'This field must be a string' })
  @IsString()
  message: string;
}

// Main validation DTO
export class FieldValidationDto {
    @ApiProperty({ description: 'Is field required?', required: false, type: () => BooleanRuleDto })
    @IsOptional()
    @ValidateNested()
    @Type(() => BooleanRuleDto)
    required?: BooleanRuleDto;
  
    @ApiProperty({ description: 'Minimum value', required: false, type: () => NumberRuleDto })
    @IsOptional()
    @ValidateNested()
    @Type(() => NumberRuleDto)
    min?: NumberRuleDto;
  
    @ApiProperty({ description: 'Maximum value', required: false, type: () => NumberRuleDto })
    @IsOptional()
    @ValidateNested()
    @Type(() => NumberRuleDto)
    max?: NumberRuleDto;
  
    @ApiProperty({ description: 'Regex pattern', required: false, type: () => StringRuleDto })
    @IsOptional()
    @ValidateNested()
    @Type(() => StringRuleDto)
    regex?: StringRuleDto;

    @ApiProperty({ description: 'Invalid type', required: false, type: () => StringRuleDto })
    @IsOptional()
    @ValidateNested()
    @Type(() => StringRuleDto)
    invalidType?: StringRuleDto;
  }