import { BaseModel } from '@shared/entities/base.entity';
import { NotificationStatus } from '@shared/enums/notificationStatus';
import { Entity, Column } from 'typeorm';


@Entity('notifications')
export class Notification extends BaseModel {
  @Column()
  title: string;

  @Column()
  message: string;

  @Column({ nullable: true })
  recipientId?: string;

  @Column({ nullable: true })
  recipientEmail?: string;

  @Column({ nullable: true })
  recipientPhone?: string;

  @Column({ default: NotificationStatus.PENDING })
  status: NotificationStatus;

  @Column({ nullable: true })
  error?: string;
}

