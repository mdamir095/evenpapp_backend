import { BaseModel } from '@shared/entities/base.entity';
import { ErrorMessages } from '@shared/enums/errorMessages';
import { Entity, Column, BeforeInsert } from 'typeorm';

@Entity('fields')
export class Field extends BaseModel {
  @Column()
  name: string;
  
  @Column()
  type: string; 

  @Column()
  description: string;

  @Column()
  order: number; // field order to sort the list

  @Column()
  metadata: {
    label: string;
    placeholder?: string;
    tooltip?: string;
    options?: string[];
    icon?: string;
    defaultValue?: string | number | boolean;
  };

  @Column()
  validation?: {
    required?:{
      value: boolean;
      message: ErrorMessages.REQUIRED_FIELD;
    };
    min?: {
      value: number;
      message: ErrorMessages.MIN_VALUE;
    };
    max?: {
      value: number;
      message: ErrorMessages.MAX_VALUE;
    };
    regex?: {
      value: string;
      message: ErrorMessages.INVALID_REGEX;
    };
    invalidType?: {
      value: string;
      message: ErrorMessages.INVALID_TYPE;
    };
  };

}
