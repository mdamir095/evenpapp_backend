import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { QuotationRequest } from './entity/quotation-request.entity';
import { EventType } from './entity/event-type.entity';
import { PhotographyType } from './entity/photography-type.entity';
import { CreateQuotationRequestDto } from './dto/request/create-quotation-request.dto';
import { AwsS3Service } from '@core/aws/services/aws-s3.service';
import { SupabaseService } from '@shared/modules/supabase/supabase.service';
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
    private readonly supabaseService: SupabaseService,
  ) {
    this.awsConfig = this.configService.get('aws');
  }

  async create(dto: CreateQuotationRequestDto, userId: string): Promise<QuotationRequest> {
    try {
      console.log('📝 Creating quotation request...');
      console.log('📝 Quotation Request - User ID:', userId, 'Type:', typeof userId);
      
      // Ensure userId is a string
      const userIdString = String(userId);
      
      let uploadedImageUrls: string[] = [];
    
      if (dto.referenceImages && dto.referenceImages.length > 0) {
        console.log(`📸 Processing ${dto.referenceImages.length} reference images...`);
        try {
          uploadedImageUrls = await this.uploadBase64Images(dto.referenceImages);
          console.log(`✅ Successfully processed ${uploadedImageUrls.length} reference images`);
        } catch (uploadError) {
          console.error('❌ Error uploading reference images:', uploadError);
          // Continue with empty array if image upload fails - don't block quotation creation
          uploadedImageUrls = [];
        }
      }

      const entity = this.repo.create({
        ...dto,
        userId: userIdString, // Explicitly set userId from JWT token
        referenceImages: uploadedImageUrls,
        eventDate: new Date(dto.eventDate),
        endDate: new Date(dto.endDate),
        status: 'pending',
        isDeleted: false,
      });

      console.log('💾 Saving quotation request to database...');
      console.log('💾 Quotation Request - Entity userId:', (entity as any).userId, 'Type:', typeof (entity as any).userId);
      
      const savedEntity = await this.repo.save(entity);
      console.log('✅ Quotation request created successfully:', (savedEntity as any)._id || (savedEntity as any).id);
      console.log('✅ Quotation Request - Saved entity userId:', (savedEntity as any).userId, 'Type:', typeof (savedEntity as any).userId);
      
      return savedEntity;
    } catch (error) {
      console.error('❌ Error creating quotation request:', error);
      throw new Error(`Failed to create quotation request: ${error.message}`);
    }
  }

  async findAll(page = 1, limit = 10, userId?: string, search?: string): Promise<{ data: QuotationRequest[]; total: number; page: number; limit: number }> {
    try {
      console.log('Quotation Request Service - findAll called with userId:', userId, 'Type:', typeof userId);
      
      // Always filter by userId for security - users should only see their own quotation requests
      const where: any = { 
        isDeleted: false,
      };
      
      if (userId) {
        // Filter by logged-in user's ID - handle both string and ObjectId formats
        const userIdString = String(userId);
        where.userId = userIdString;
        console.log('Quotation Request Service - Filtering by userId:', userIdString);
        console.log('Quotation Request Service - userId type:', typeof userIdString);
      } else {
        console.log('⚠️ Quotation Request Service - No userId provided, this should not happen for protected endpoints');
        // For security, if no userId provided, return empty result
        return { data: [], total: 0, page, limit };
      }
      
      if (search && search.trim().length > 0) {
        const regex = new RegExp(search, 'i');
        where.$or = [
          { eventHall: { $regex: regex } },
          { venueAddress: { $regex: regex } },
        ];
      }

      console.log('Quotation Request Service - Query where clause:', JSON.stringify(where, null, 2));

      const [data, total] = await this.repo.findAndCount({
        where,
        skip: (page - 1) * limit,
        take: limit,
        order: { createdAt: 'DESC' as any },
      });

      console.log('Quotation Request Service - Found', total, 'quotation requests for userId:', userId);
      
      // Debug: Log userIds from found quotations to see format
      if (data && data.length > 0) {
        console.log('Quotation Request Service - Sample userIds from results:', data.slice(0, 3).map((q: any) => ({
          id: q._id || q.id,
          userId: q.userId,
          userIdType: typeof q.userId
        })));
      } else {
        console.log('⚠️ Quotation Request Service - No quotations found. Checking if quotations exist without userId...');
        // Debug query to see if any quotations exist at all
        const allQuotations = await this.repo.find({ where: { isDeleted: false }, take: 5 });
        console.log('Quotation Request Service - Sample quotations (first 5, any userId):', allQuotations.map((q: any) => ({
          id: q._id || q.id,
          userId: q.userId,
          hasUserId: !!q.userId,
          userIdType: typeof q.userId
        })));
      }
      return { data, total, page, limit };
    } catch (error) {
      console.error('Quotation Request Service - Error in findAll:', error);
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

  private async uploadBase64Images(base64Images: string[]): Promise<string[]> {
    try {
      console.log('📸 Uploading reference images for quotation request...');
      const uploadedUrls: string[] = [];
      const awsConfig = this.configService.get('aws');
      
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
        const fileName = `request_quotation_${timestamp}_${Math.random()
          .toString(36)
          .substring(7)}.${ext}`;

        console.log('📁 Processing reference image:', { ext, mimetype, fileName, size: buffer.length });

        let imageUrl = '';
        
        if (process.env.NODE_ENV === 'local') {
          console.log('🏠 Using local file system for development');
          const rootDir = path.resolve(__dirname, '..', '..', '..');
          const dir = path.join(rootDir, 'uploads', 'quotation');
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          const filePath = path.join(dir, fileName);
          fs.writeFileSync(filePath, buffer);
          imageUrl = `/uploads/quotation/${fileName}`;
          console.log('✅ Local file saved:', imageUrl);
        } else {
          console.log('☁️ Using AWS S3 for production');
          try {
            // Try AWS S3 first
            const awsUploadReqDto = {
              Bucket: awsConfig.bucketName,
              Key: awsConfig.bucketFolderName + '/' + 'quotation' + '/' + fileName,
              Body: buffer,
              ContentType: mimetype,
            } as any;
            
            const response = await this.awsS3Service.uploadFilesToS3Bucket(awsUploadReqDto);
            imageUrl = (response as any)?.Location || '';
            console.log('✅ AWS S3 upload successful:', imageUrl);
          } catch (s3Error) {
            console.error('❌ AWS S3 upload failed, using Supabase fallback:', s3Error.message);
            // Fallback to Supabase if AWS S3 fails
            try {
              const { publicUrl } = await this.supabaseService.upload({
                filePath: 'quotation_' + fileName,
                file: buffer,
                contentType: mimetype,
                bucket: 'quotation',
              });
              imageUrl = publicUrl || '';
              console.log('✅ Supabase fallback upload successful:', imageUrl);
            } catch (supabaseError) {
              console.error('❌ Supabase fallback also failed:', supabaseError.message);
              // Don't save placeholder URL - skip this image instead
              console.log('⚠️ Image upload failed completely, skipping this image');
              imageUrl = ''; // Empty string instead of placeholder
            }
          }
        }
        
        // Only add non-empty URLs (skip failed uploads)
        if (imageUrl && imageUrl.trim() !== '') {
          uploadedUrls.push(imageUrl);
        } else {
          console.log('⚠️ Skipping image due to upload failure');
        }
      }
      
      console.log('✅ All reference images processed:', uploadedUrls.length);
      // Filter out any empty strings just to be safe
      return uploadedUrls.filter(url => url && url.trim() !== '');
      
    } catch (error) {
      console.error('❌ Error uploading reference images:', error);
      throw error;
    }
  }
}
