import { PartialType } from "@nestjs/swagger";
import { CreateVenueCategoryDto } from "./create-venue-category.dto";

export class UpdateVenueCategoryDto extends PartialType(CreateVenueCategoryDto) {

}
