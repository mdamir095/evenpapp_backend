import { Expose, Transform } from "class-transformer";
import { Form } from "@modules/form/entity/form.entity";

export class VenueCategoryResponseDto {
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
  isActive: boolean;

  @Expose()
  icon?: string;

   @Expose()
  color?: string;

  @Expose()
  formId?: string;

  @Expose()
  form: Form;

   @Expose()
  createdAt: string;

  @Expose()
  updatedAt: string;
  
  @Expose()
  isDeleted: boolean;
}
