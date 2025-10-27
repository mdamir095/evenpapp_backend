import { Expose, Transform } from "class-transformer";
import { ObjectId } from "typeorm";

export class ContentPolicyResponseDto {
  @Expose()
  @Transform(({ obj }) => obj.id?.toString())
  id: string;

  @Expose()
  key: string;

  @Expose()
  title: string;

  @Expose()
  content: string;

  @Expose()
  category: string;

  @Expose()
  version: string;

  @Expose()
  isActive: boolean;

  @Expose()
  effectiveDate: Date;

  @Expose()
  lastReviewDate?: Date;

  @Expose()
  createdAt: string;

  @Expose()
  updatedAt: string;
}
