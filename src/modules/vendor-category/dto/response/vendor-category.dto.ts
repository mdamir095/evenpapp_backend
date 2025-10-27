import { Form } from "@modules/form/entity/form.entity";
import { Expose, Transform } from "class-transformer";


export class VendorCategoryResponseDto {
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
  createdAt: string;

  @Expose()
  updatedAt: string;

  @Expose()
  form: Form;
}
