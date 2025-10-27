import { Expose, Transform, Type } from "class-transformer";
import { ObjectId } from "typeorm";
import { FormResponseDto } from "@modules/form/dto/response/form.dto";

export class ServiceCategoryResponseDto {
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
  formId: string;

  @Expose()
  @Type(() => FormResponseDto)
  form?: FormResponseDto;

  @Expose()
  isActive: boolean


   @Expose()
  createdAt: string;

  @Expose()
  updatedAt: string;
}
