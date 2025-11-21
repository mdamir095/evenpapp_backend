import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// Allowed labels for the dropdown (derived from design screenshots)
export enum ServiceCategoryFormLabel {
  EventDate = 'Event Date',
  EndDate = 'End Date',
  StartTime = 'Start Time',
  EndTime = 'End Time',
  ExpectedGuests = 'Expected Guests',
  VenueAddress = 'Venue Address',
  PhotographerTypes = 'Photographer Types',
  DurationOfCoverage = 'Duration of Coverage(hours)',
  NumbersOfPhotographers = 'Numbers of Photographers',
  BudgetRange = 'Budget Range',
  SpecialRequirements = 'Special Requirements',
  ReferenceIdeas = 'Reference Ideas',
  // Catering Requirements
  MealType = 'Meal Type',
  CuisinePreferences = 'Cuisine Preference(s)',
  ServingStyle = 'Serving Style',
  AdditionalServices = 'Additional Services',
  SpecialInstructions = 'Special Instructions',
  MenuPreferences = 'Menu Preferences',
}
export const SERVICE_CATEGORY_FORM_LABEL_GROUPS: Record<string, ServiceCategoryFormLabel[]> = {
  photographer: [
    ServiceCategoryFormLabel.EventDate,
    ServiceCategoryFormLabel.EndDate,
    ServiceCategoryFormLabel.StartTime,
    ServiceCategoryFormLabel.EndTime,
    ServiceCategoryFormLabel.ExpectedGuests,
    ServiceCategoryFormLabel.VenueAddress,
    ServiceCategoryFormLabel.PhotographerTypes,
    ServiceCategoryFormLabel.DurationOfCoverage,
    ServiceCategoryFormLabel.NumbersOfPhotographers,
    ServiceCategoryFormLabel.BudgetRange,
    ServiceCategoryFormLabel.SpecialRequirements,
    ServiceCategoryFormLabel.ReferenceIdeas,
  ],
  catering: [
    ServiceCategoryFormLabel.EventDate,
    ServiceCategoryFormLabel.EndDate,
    ServiceCategoryFormLabel.StartTime,
    ServiceCategoryFormLabel.EndTime,
    ServiceCategoryFormLabel.ExpectedGuests,
    ServiceCategoryFormLabel.VenueAddress,
    ServiceCategoryFormLabel.BudgetRange,
    ServiceCategoryFormLabel.MealType,
    ServiceCategoryFormLabel.CuisinePreferences,
    ServiceCategoryFormLabel.ServingStyle,
    ServiceCategoryFormLabel.AdditionalServices,
    ServiceCategoryFormLabel.SpecialInstructions,
    ServiceCategoryFormLabel.MenuPreferences,
    ServiceCategoryFormLabel.ReferenceIdeas,
  ],

};

export const SERVICE_CATEGORY_FORM_LABELS: string[] = Object.values(ServiceCategoryFormLabel);

export class CreateServiceCategoryFormInputDto {
  @ApiProperty({ description: 'Service Category ObjectId this input belongs to', example: '507f1f77bcf86cd799439011' })
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({ description: 'Field label to display in UI', enum: SERVICE_CATEGORY_FORM_LABELS, enumName: 'ServiceCategoryFormLabel' })
  @IsEnum(ServiceCategoryFormLabel)
  label: ServiceCategoryFormLabel;

  @ApiProperty({ description: 'Whether this form input is active', required: false, example: true, default: true })
  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @ApiProperty({ description: 'Minimum value for number/range fields', required: false, example: 1 })
  @IsNumber()
  @IsOptional()
  minrange?: number;

  @ApiProperty({ description: 'Maximum value for number/range fields', required: false, example: 5000 })
  @IsNumber()
  @IsOptional()
  maxrange?: number;
}
