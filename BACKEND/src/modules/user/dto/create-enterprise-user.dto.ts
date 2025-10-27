import { IsArray, IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, Matches, MinLength } from 'class-validator';
import { ObjectId } from 'typeorm';

export class CreateEnterpriseUserDto {
  @IsString()
  @IsNotEmpty()
  organizationName: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  countryCode: string;

  @IsString()
  @IsPhoneNumber() // or pass region code if needed, like 'IN'
  phoneNumber: string;

  @IsOptional()
  @IsBoolean()
  isPhoneVerified?: boolean = false;

  @IsOptional()
  @IsBoolean()
  isEmailVerified?: boolean = false;

  @IsString()
  @IsNotEmpty()
  enterpriseId: string;

  @IsString()
  @IsNotEmpty()
  token: string;

  @IsBoolean()
  isActive: boolean = false;

  @IsArray()
  @IsNotEmpty()
  roleIds: ObjectId[];

  @IsOptional()
  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  city: string;

  @IsOptional()
  @IsString()
  state: string;

  @IsOptional()
  @IsString()
  pincode: string;

  @IsOptional()
  @IsString()
  password?: string;
  
  @IsOptional()
  @IsBoolean()
  isEnterpriseAdmin?: boolean = false;

  @IsOptional()
  @IsBoolean()  
  isDeleted?: boolean = false;

  @IsOptional()
  @IsString()
  userType?: string; // 'ENTERPRISE' | 'ENTERPRISE_USER'
}
