import { Entity, Column } from 'typeorm';
import { BaseModel } from '@shared/entities/base.entity';

@Entity({ name: 'banners' })
export class Banner extends BaseModel {
    constructor() {
    super();
  }
   
  @Column()
  title: string;

  @Column()
  imageUrl: string;

  @Column({ default: 'banner' })
  type: string;
}

