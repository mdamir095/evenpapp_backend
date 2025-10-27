export interface VenueCategory {
  id: string;
  name: string;
  description: string;
  icon?: string;
  formId: string;
  color?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVenueCategoryDto {
  name: string;
  description: string;
  icon?: string;
  formId: string;
  color?: string;
  isActive?: boolean;
}

export interface UpdateVenueCategoryDto extends Partial<CreateVenueCategoryDto> {
  id: string;
}

export interface VenueCategoryFilters {
  search?: string;
  isActive?: boolean;
  sortBy?: 'name' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface VenueCategoryResponse {
  data: VenueCategory[];
  total: number;
  page: number;
  limit: number;
}