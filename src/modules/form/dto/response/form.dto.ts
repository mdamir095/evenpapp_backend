import { Expose, Transform } from "class-transformer";

export class FormResponseDto {
  @Expose()
  @Transform(({ obj }) => obj.id?.toString())
  id: string;

  @Expose()
  key: string;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  categoryId: string;

  @Expose()
  type: string;

  @Expose()
  fields: any[];

  @Expose()
  createdAt: string;

  @Expose()
  updatedAt: string;
}
