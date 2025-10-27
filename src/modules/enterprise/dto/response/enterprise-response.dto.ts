import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { IsArray, IsBoolean, ValidateNested } from 'class-validator';
import { IsString } from 'class-validator';
import { ObjectId } from 'mongodb';

class PermissionsDto {
  @ApiProperty()
  @Expose()
  @IsBoolean()
  read: boolean;
  @ApiProperty()
  @Expose()
  @IsBoolean()
  write: boolean;
  
  @ApiProperty()
  @Expose()
  @IsBoolean()
  admin: boolean;
}
class FeatureDto {
  @ApiProperty()
  @Expose()
  @IsString()
  featureId: string;
  
  @ApiProperty()
  @Expose()
  @ValidateNested()
  @Type(() => PermissionsDto)
  permissions: PermissionsDto;
}



export class EnterpriseResponseDto {
  @ApiProperty()
  @Expose()
  @Transform(({ obj }) => obj.id?.toString())
  id: string;

  @ApiProperty()
  @Expose()
  key: string;

  @ApiProperty()
  @Expose()
  firstName: string;

  @ApiProperty()
  @Expose()
  lastName: string;

  @ApiProperty()
  @Expose()
  email: string;

  @ApiProperty()
  @Expose()
  phoneNumber: string;

  @ApiProperty()
  @Expose()
  enterpriseName: string;

  @ApiProperty()
  @Expose()
  description: string;

  @ApiProperty()
  @Expose()
  address: string;

  @ApiProperty()
  @Expose()
  city: string;

  @ApiProperty()        
  @Expose()
  state: string;

  @ApiProperty()
  @Expose()
  pincode: string;

  @ApiProperty()
  @Expose()
  isActive: boolean;

  @ApiProperty()
  @Expose()
  @IsArray()
  @ValidateNested({each: true})
  @Type(() => FeatureDto)
  features: FeatureDto[];

}
