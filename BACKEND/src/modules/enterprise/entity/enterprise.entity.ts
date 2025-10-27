import { BaseModel } from '@shared/entities/base.entity';
import { Entity, Column, ObjectId, BeforeInsert } from 'typeorm';

@Entity()
export class Enterprise extends BaseModel{

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  countryCode: string;

  @Column({ unique: true })
  phoneNumber: string;

  @Column({ unique: true })
  enterpriseName: string;

  @Column()
  description: string;

  @Column()
  address: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column()
  pincode: string;

  @Column()
  roleId: string;

  @Column()
  featurePermissionsIds: ObjectId[];

  @BeforeInsert()
  setDefaultValues() {
    super.setDefaultValues();
    this.firstName = this.firstName || '';
    this.lastName = this.lastName || '';
    this.email = this.email.toLowerCase() || '';
    this.countryCode = this.countryCode || '';
    this.phoneNumber = this.phoneNumber || '';
    this.enterpriseName = this.enterpriseName || '';
    this.description = this.description || '';
    this.address = this.address || '';
    this.city = this.city || '';
    this.state = this.state || '';
    this.pincode = this.pincode || '';
    this.roleId = this.roleId || '';
    this.featurePermissionsIds =  this.featurePermissionsIds || [];
  }

}