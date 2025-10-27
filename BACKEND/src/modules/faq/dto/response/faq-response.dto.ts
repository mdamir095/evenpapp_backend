import { ApiProperty } from '@nestjs/swagger';
import { Faq } from '../../entity/faq.entity';

export class FaqResponseDto {
  @ApiProperty({ 
    description: 'Unique identifier for the FAQ',
    type: String,
    example: '60d5ec49b1b4b123456789ab'
  })
  id: any;

  @ApiProperty({ 
    description: 'Unique key for the FAQ',
    type: String,
    example: 'unique-faq-key-123'
  })
  key: string;

  @ApiProperty({ 
    description: 'FAQ question',
    type: String,
    example: 'How do I create an event?'
  })
  question: string;

  @ApiProperty({ 
    description: 'FAQ answer',
    type: String,
    example: 'To create an event, navigate to the events section and click on "Create New Event".'
  })
  answer: string;

  @ApiProperty({ 
    description: 'Whether the FAQ is expanded by default',
    type: Boolean,
    example: false
  })
  isExpanded: boolean;

  @ApiProperty({ 
    description: 'Whether the FAQ is active',
    type: Boolean,
    example: true
  })
  isActive: boolean;

  @ApiProperty({ 
    description: 'FAQ creation date',
    type: String,
    format: 'date-time',
    example: '2023-01-01T00:00:00.000Z'
  })
  createdAt: Date;

  @ApiProperty({ 
    description: 'FAQ last update date',
    type: String,
    format: 'date-time',
    example: '2023-01-01T00:00:00.000Z'
  })
  updatedAt: Date;

  @ApiProperty({ 
    description: 'Created by user',
    type: String,
    example: 'system'
  })
  createdBy: string;

  @ApiProperty({ 
    description: 'Updated by user',
    type: String,
    example: 'system'
  })
  updatedBy: string;

  constructor(faq: Faq) {
    this.id = faq.id;
    this.key = faq.key;
    this.question = faq.question;
    this.answer = faq.answer;
    this.isExpanded = faq.isExpanded;
    this.isActive = faq.isActive;
    this.createdAt = faq.createdAt;
    this.updatedAt = faq.updatedAt;
    this.createdBy = faq.createdBy;
    this.updatedBy = faq.updatedBy;
  }
}