import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { QuotationRequest } from './entity/quotation-request.entity';
import { EventType } from './entity/event-type.entity';
import { PhotographyType } from './entity/photography-type.entity';
import { CreateQuotationRequestDto } from './dto/request/create-quotation-request.dto';
import { AwsS3Service } from '@core/aws/services/aws-s3.service';
import { ObjectId } from 'mongodb';
import path from 'path';
import fs from 'fs';

@Injectable()
export class QuotationRequestService {
  private awsConfig: any;

  constructor(
    @InjectRepository(QuotationRequest, 'mongo')
    private readonly repo: MongoRepository<QuotationRequest>,
    @InjectRepository(EventType, 'mongo')
    private readonly eventTypeRepo: MongoRepository<EventType>,
    @InjectRepository(PhotographyType, 'mongo')
    private readonly photographyTypeRepo: MongoRepository<PhotographyType>,
    private readonly configService: ConfigService,
    private readonly awsS3Service: AwsS3Service,
  ) {
    this.awsConfig = this.configService.get('aws');
  }

  async create(dto: CreateQuotationRequestDto): Promise<QuotationRequest> {
    try {
      let uploadedImageUrls: string[] = [];
    
      if (dto.referenceImages && dto.referenceImages.length > 0) {
        uploadedImageUrls = await this.uploadBase64Images(dto.referenceImages);
      }

      const entity = this.repo.create({
        ...dto,
        referenceImages: uploadedImageUrls,
        eventDate: new Date(dto.eventDate),
        endDate: new Date(dto.endDate),
        status: 'pending',
        isDeleted: false,
      });

      const savedEntity = await this.repo.save(entity);
      return savedEntity;
    } catch (error) {
      throw new Error(`Failed to create quotation request: ${error.message}`);
    }
  }

  async findAll(page = 1, limit = 10, userId?: string, search?: string): Promise<{ data: QuotationRequest[]; total: number; page: number; limit: number }> {
    try {
      const where: any = { isDeleted: false };
      if (userId) {
        where.userId = userId;
      }
      if (search && search.trim().length > 0) {
        const regex = new RegExp(search, 'i');
        where.$or = [
          { eventHall: { $regex: regex } },
          { venueAddress: { $regex: regex } },
        ];
      }

      const [data, total] = await this.repo.findAndCount({
        where,
        skip: (page - 1) * limit,
        take: limit,
        order: { createdAt: 'DESC' as any },
      });

      return { data, total, page, limit };
    } catch (error) {
      throw new Error(`Failed to fetch quotation requests: ${error.message}`);
    }
  }

  async findOne(id: string): Promise<QuotationRequest> {
    try {
      const entity = await this.repo.findOne({ 
        where: { _id: new ObjectId(id), isDeleted: false } 
      });
      
      if (!entity) {
        throw new NotFoundException('Quotation request not found');
      }
      
      return entity;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to fetch quotation request: ${error.message}`);
    }
  }

  async updateStatus(id: string, status: string, quotationAmount?: number, notes?: string): Promise<QuotationRequest> {
    try {
      const entity = await this.findOne(id);
      
      entity.status = status;
      if (quotationAmount !== undefined) {
        entity.quotationAmount = quotationAmount;
      }
      if (notes !== undefined) {
        entity.notes = notes;
      }

      return await this.repo.save(entity);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to update quotation request: ${error.message}`);
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    try {
      const entity = await this.findOne(id);
      entity.isDeleted = true;
      await this.repo.save(entity);
      
      return { message: 'Quotation request deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to delete quotation request: ${error.message}`);
    }
  }

  async findByVendor(vendorId: string, page = 1, limit = 10): Promise<{ data: QuotationRequest[]; total: number; page: number; limit: number }> {
    try {
      const [data, total] = await this.repo.findAndCount({
        where: { vendorId, isDeleted: false },
        skip: (page - 1) * limit,
        take: limit,
        order: { createdAt: 'DESC' as any },
      });

      return { data, total, page, limit };
    } catch (error) {
      throw new Error(`Failed to fetch quotation requests for vendor: ${error.message}`);
    }
  }

  async findByVenue(venueId: string, page = 1, limit = 10): Promise<{ data: QuotationRequest[]; total: number; page: number; limit: number }> {
    try {
      const [data, total] = await this.repo.findAndCount({
        where: { venueId, isDeleted: false },
        skip: (page - 1) * limit,
        take: limit,
        order: { createdAt: 'DESC' as any },
      });

      return { data, total, page, limit };
    } catch (error) {
      throw new Error(`Failed to fetch quotation requests for venue: ${error.message}`);
    }
  }

  async getEventTypes(): Promise<string[]> {
    try {
      const eventTypes = await this.eventTypeRepo.find({
        where: { isActive: true, isDeleted: false },
        order: { name: 'ASC' as any },
      });

      return eventTypes.map(eventType => eventType.name);
    } catch (error) {
      throw new Error(`Failed to fetch event types: ${error.message}`);
    }
  }

  async getPhotographyTypes(): Promise<string[]> {
    try {
      const photographyTypes = await this.photographyTypeRepo.find({
        where: { isActive: true, isDeleted: false },
        order: { name: 'ASC' as any },
      });

      return photographyTypes.map(photographyType => photographyType.name);
    } catch (error) {
      throw new Error(`Failed to fetch photography types: ${error.message}`);
    }
  }

  async seedInitialData(): Promise<{ message: string }> {
    try {
      // Seed Event Types
      const eventTypesData = [
        'Grand Ballroom',
        'Garden Paradise',
        'Rooftop Terrace',
        'Beach Resort',
        'Mountain Lodge',
        'City Convention Center',
      ];

      for (const eventTypeName of eventTypesData) {
        const existingEventType = await this.eventTypeRepo.findOne({
          where: { name: eventTypeName, isDeleted: false }
        });

        if (!existingEventType) {
          const eventType = this.eventTypeRepo.create({
            name: eventTypeName,
            isActive: true,
            isDeleted: false,
          });
          await this.eventTypeRepo.save(eventType);
        }
      }

      // Seed Photography Types
      const photographyTypesData = [
        'Portrait',
        'Wedding',
        'Fashion',
        'Event',
        'Sports',
      ];

      for (const photographyTypeName of photographyTypesData) {
        const existingPhotographyType = await this.photographyTypeRepo.findOne({
          where: { name: photographyTypeName, isDeleted: false }
        });

        if (!existingPhotographyType) {
          const photographyType = this.photographyTypeRepo.create({
            name: photographyTypeName,
            isActive: true,
            isDeleted: false,
          });
          await this.photographyTypeRepo.save(photographyType);
        }
      }

      return { message: 'Initial data seeded successfully' };
    } catch (error) {
      throw new Error(`Failed to seed initial data: ${error.message}`);
    }
  }

  async uploadReferenceImage(file: any): Promise<string> {
    if (process.env.NODE_ENV === 'local') {
      // For local development, save to local file system
      const rootDir = path.resolve(__dirname, '..', '..', '..');
      const dir = path.join(rootDir, 'uploads', 'quotation');
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Generate unique filename
      const timestamp = Date.now();
      const fileExtension = path.extname(file.originalname);
      const fileName = `reference_${timestamp}${fileExtension}`;
      const filePath = path.join(dir, fileName);
      
      fs.writeFileSync(filePath, file.buffer);
      
      // Return the URL path
      return `/uploads/quotation/${fileName}`;
    } else {
      // For production, upload to S3
      const awsUploadReqDto = {
        Bucket: this.awsConfig.bucketName,
        Key:
          this.awsConfig.bucketFolderName +
          '/' +
          'quotation' +
          '/' +
          file.originalname,
        Body: file.buffer,
        ContentType: file.mimetype,
      };
      const response = await this.awsS3Service.uploadFilesToS3Bucket(awsUploadReqDto);
      return response?.Location || '';
    }
  }

  async uploadBase64Images(base64Images: string[]): Promise<string[]> {
    const uploadedUrls: string[] = [];
    
    for (const base64Image of base64Images) {
      if (!base64Image) continue;
      
      const matches = base64Image.match(/^data:image\/(png|jpeg|jpg);base64,(.+)$/);
      if (!matches) {
        throw new BadRequestException('Invalid base64 image format');
      }

      const ext = matches[1];
      const base64Data = matches[2];
      const buffer = Buffer.from(base64Data, 'base64');
      const mimetype = `image/${ext}`;
      const timestamp = Date.now();
      const fileName = `reference_${timestamp}_${Math.random().toString(36).substring(7)}.${ext}`;
      
      let imageUrl: string = '';
      
      if (process.env.NODE_ENV === 'local') {
        const rootDir = path.resolve(__dirname, '..', '..', '..');
        const dir = path.join(rootDir, 'uploads', 'quotation');
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        
        const filePath = path.join(dir, fileName);
        fs.writeFileSync(filePath, buffer);

        imageUrl = `/uploads/quotation/${fileName}`;
      } else {
        const awsUploadReqDto = {
          Bucket: this.awsConfig.bucketName,
          Key:
            this.awsConfig.bucketFolderName +
            '/' +
            'quotation' +
            '/' +
            fileName,
          Body: buffer,
          ContentType: mimetype,
        };
        const response = await this.awsS3Service.uploadFilesToS3Bucket(awsUploadReqDto);
        imageUrl = response?.Location || '';
      }
      
      uploadedUrls.push(imageUrl);
    }
    
    return uploadedUrls;
  }
}
