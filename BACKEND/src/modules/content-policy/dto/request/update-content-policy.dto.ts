import { PartialType } from "@nestjs/swagger";
import { CreateContentPolicyDto } from "./create-content-policy.dto";

export class UpdateContentPolicyDto extends PartialType(CreateContentPolicyDto) {

}
