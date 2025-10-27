import { Expose, Transform } from 'class-transformer';

export class MealTypeResponseDto {
  @Expose()
  @Transform(({ obj }) => obj.id?.toString())
  id: string;

  @Expose()
  key: string;

  @Expose()
  name: string;

  @Expose()
  isActive: boolean;

  @Expose()
  createdAt: string;

  @Expose()
  updatedAt: string;
}

