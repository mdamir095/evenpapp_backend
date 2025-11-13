import { Entity, Column, ObjectIdColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity('messages')
export class Message {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  senderId: string; // User ID who sent the message

  @Column()
  receiverId: string; // User ID who receives the message

  @Column()
  chatId: string; // Unique conversation/chat session ID

  @Column({ nullable: true })
  bookingId?: string; // Booking ID this chat belongs to (optional)

  @Column()
  message: string; // Message content

  @Column({ default: false })
  isRead: boolean; // Whether the message has been read

  @Column({ nullable: true })
  readAt?: Date; // When the message was read

  @Column({ default: 'text' })
  messageType: string; // text, image, file, etc.

  @Column({ nullable: true })
  attachmentUrl?: string; // URL for attachments

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: false })
  isDeleted: boolean;
}


