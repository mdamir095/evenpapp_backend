import {
  Entity,
  Column,
  ObjectId
} from 'typeorm';
import { BaseModel } from '@shared/entities/base.entity';

export enum EventType {
  WEDDING = 'Wedding',
  BIRTHDAY = 'Birthday',
  CONFERENCE = 'Conference',
  MEETING = 'Meeting',
}

@Entity('events')
export class Event extends BaseModel {

  @Column()
  title:string

  @Column()
  type: EventType;

  @Column()
  date: Date;

  @Column()
  location: string;

  /** Relations */
  @Column({default:[]})
  guests: ObjectId[];

  @Column({default:[]})
  tasks: ObjectId[];

  @Column({default:[]})
  budget: ObjectId[];

}
