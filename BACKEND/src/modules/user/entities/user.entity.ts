import { Entity, Column, ObjectId, BeforeInsert } from "typeorm";
import { BaseModel } from "@shared/entities/base.entity";
import { Exclude } from "class-transformer";

@Entity({ name: 'users' })
export class User extends BaseModel {
  constructor() {
    super();
  }

  @Column()
  firstName: string;

  @Column()
  lastName: string;
  
  @Column()
  email: string;
  
  @Column()
  organizationName: string;

  @Column()
  countryCode: string;
  
  @Column()
  phoneNumber: string;
  
  @Exclude()
  @Column()
  password: string;
  
  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ nullable: true })
  otp: string;

  @Column({ nullable: true })
  expireAt: Date | null;

  @Column({ default: false })
  isPhoneVerified: boolean;

  @Column()
  roleIds: ObjectId[];

  @Column({ nullable: true })
  profileImage: string;

  @Column({ nullable: true })
  gender: string;

  @Column({ nullable: true })
  birthday: string;

  @Column({ nullable: true })
  enterpriseId: string;

  @Column()
  isEnterpriseAdmin: boolean;

  @Column({ nullable: true })
  token: string;
  
  @Column()
  address: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column()
  pincode: string;

  @Column({ default: false })
  isMobileAppUser: boolean;

  @Column({ default: false })
  isBlocked: boolean;

  @Column({ default: 'USER' })
  userType: string; // 'USER' | 'SUPER_ADMIN' | 'ADMIN' | 'ENTERPRISE' | 'ENTERPRISE_USER'

  @Column({ nullable: true })
  fcmToken: string;

  @BeforeInsert()
  setDefaultValues() {
    this.email = this.email.toLowerCase() || '';
    this.isBlocked = this.isBlocked || false;
    this.isActive = this.isActive || false;
    this.isMobileAppUser = this.isMobileAppUser || false;
    this.isEnterpriseAdmin = this.isEnterpriseAdmin || false;
  }
  
}
