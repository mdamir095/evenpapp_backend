import { Entity, Column } from 'typeorm';
import { BaseModel } from '@shared/entities/base.entity';

@Entity('forms')
export class Form extends BaseModel {
  @Column()
  name: string; // Form name

  @Column()
  description?: string; // Optional form description

  @Column()
  categoryId: string;

  @Column()
  type: string; // Form type (e.g., venue-category, vendor-service)

  @Column({default:[]}) // Use 'json' for Postgres or 'simple-json' for MySQL
  fields: Field[]; // Use the type matching DTO

}

// Define TypeScript type for fields
export interface Field {
  id: string;
  key: string;
  name: string;
  type: string;
  order: number;
  metadata: {
    label: string;
    placeholder?: string;
    options?: string[];
    tooltip?: string;
    icon?: string;
    defaultValue?: string | number | boolean;
  };
  validation?: {
    required?:{
      value: boolean;
      message: string;
    };
    min?: {
      value: number;
      message: string;
    };
    max?: {
      value: number;
      message: string;
    };
    regex?: {
      value: string;
      message: string;
    };
    invalidType?: {
      value: string;
      message: string;
    };
  };

  uiConfig?: {
    gridColumn?: number; // 1-12 (Bootstrap style grid)
    cssClass?: string;
    hidden?: boolean;
    readonly?: boolean;
    disabled?: boolean;
    inline?: boolean;
    align?: string;
  };
  dependencies?: Field[]; // Recursive structure
}