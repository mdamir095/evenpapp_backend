import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsMongoId, ValidateNested } from "class-validator";
import { FeaturePermissionItem } from "./feature-permission-item.dto";

export class CreateUserFeaturePermissionDto {
  @ApiProperty()
  @IsMongoId()
  roleId: string;

  @ApiProperty({
    type: [FeaturePermissionItem],
    description: 'List of feature permissions to assign to the user',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FeaturePermissionItem)
  permissions: FeaturePermissionItem[];

}
