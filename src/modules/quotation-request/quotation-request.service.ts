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
      console.log('💾 Quotation Request - Entity referenceImages (uploaded URLs):', (entity as any).referenceImages);
      console.log('💾 Quotation Request - Entity referenceImages count:', (entity as any).referenceImages?.length || 0);
      
      const savedEntity = await this.repo.save(entity);
      console.log('✅ Quotation request created successfully:', (savedEntity as any)._id || (savedEntity as any).id);
      console.log('✅ Quotation Request - Saved entity userId:', (savedEntity as any).userId, 'Type:', typeof (savedEntity as any).userId);
      console.log('✅ Quotation Request - Saved entity referenceImages (uploaded URLs):', (savedEntity as any).referenceImages);
      console.log('✅ Quotation Request - Saved entity referenceImages count:', (savedEntity as any).referenceImages?.length || 0);
      console.log('✅ Quotation Request - Saved entity keys:', Object.keys(savedEntity));
      
      // Get referenceImages from multiple possible sources (MongoDB might store it differently)
      const savedReferenceImages = (savedEntity as any).referenceImages || 
                                   (savedEntity as any).referenceimages || 
                                   uploadedImageUrls || 
                                   [];
      
      console.log('✅ Quotation Request - Resolved referenceImages:', savedReferenceImages);
      
      // Ensure referenceImages are explicitly included in the response with uploaded URLs
      // Build response explicitly to ensure all fields are included
      const response: any = {
        id: (savedEntity as any)._id?.toString() || (savedEntity as any).id?.toString(),
        _id: (savedEntity as any)._id || (savedEntity as any).id,
        eventHall: (savedEntity as any).eventHall,
        eventDate: (savedEntity as any).eventDate,
        endDate: (savedEntity as any).endDate,
        startTime: (savedEntity as any).startTime,
        endTime: (savedEntity as any).endTime,
        venueAddress: (savedEntity as any).venueAddress,
        photographerType: (savedEntity as any).photographerType,
        specialRequirement: (savedEntity as any).specialRequirement,
        expectedGuests: (savedEntity as any).expectedGuests,
        coverageDuration: (savedEntity as any).coverageDuration,
        numberOfPhotographers: (savedEntity as any).numberOfPhotographers,
        budgetRange: (savedEntity as any).budgetRange,
        referenceImages: savedReferenceImages, // Explicitly set - MUST be included
        status: (savedEntity as any).status,
        userId: (savedEntity as any).userId,
        vendorId: (savedEntity as any).vendorId,
        venueId: (savedEntity as any).venueId,
        quotationAmount: (savedEntity as any).quotationAmount,
        notes: (savedEntity as any).notes,
        createdAt: (savedEntity as any).createdAt,
        updatedAt: (savedEntity as any).updatedAt,
        isDeleted: (savedEntity as any).isDeleted,
      };
      
      // Also spread to catch any other fields
      Object.assign(response, savedEntity);
      // Override referenceImages again to ensure it's not overwritten
      response.referenceImages = savedReferenceImages;
      
      console.log('✅ Quotation Request - Response referenceImages (uploaded URLs):', response.referenceImages);
      console.log('✅ Quotation Request - Response referenceImages count:', response.referenceImages?.length || 0);
      console.log('✅ Quotation Request - Response keys:', Object.keys(response));
      console.log('✅ Quotation Request - Response has referenceImages:', 'referenceImages' in response);
      
      return response;
    } catch (error) {
      console.error('❌ Error creating quotation request:', error);
      throw new Error(`Failed to create quotation request: ${error.message}`);
    }
  }

  async findAllForAdmin(page = 1, limit = 10, search?: string): Promise<{ data: QuotationRequest[]; total: number; page: number; limit: number }> {
    try {
      console.log('Quotation Request Service - findAllForAdmin called');
      
      const where: any = { 
        isDeleted: false,
      };
      
      if (search && search.trim().length > 0) {
        const regex = new RegExp(search, 'i');
        where.$or = [
          { eventHall: { $regex: regex } },
          { venueAddress: { $regex: regex } },
        ];
      }

      console.log('Quotation Request Service - Admin query where clause:', JSON.stringify(where, null, 2));

      const [data, total] = await this.repo.findAndCount({
        where,
        skip: (page - 1) * limit,
        take: limit,
        order: { createdAt: 'DESC' as any },
      });

      console.log('Quotation Request Service - Admin found', total, 'quotation requests');
      
      // Process referenceImages for each quotation
      const processedData = data.map((quotation: any) => {
        let referenceImages = quotation.referenceImages || 
                             quotation.referenceimages || 
                             (quotation as any).reference_images || 
                             [];
        
        if (Array.isArray(referenceImages)) {
          referenceImages = referenceImages.filter((url: string) => {
            if (!url || typeof url !== 'string') {
              return false;
            }
            return !url.includes('via.placeholder.com') && !url.includes('placeholder');
          });
        } else {
          referenceImages = [];
        }
        
        return {
          ...quotation,
          referenceImages: referenceImages,
        };
      });
      
      return {
        data: processedData,
        total,
        page,
        limit,
      };
    } catch (error) {
      console.error('❌ Error in findAllForAdmin:', error);
      throw new Error(`Failed to fetch quotation requests: ${error.message}`);
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
      
      // Log raw data from database to see what's being retrieved
      if (data && data.length > 0) {
        console.log('Quotation Request Service - Sample raw data from DB:', data.slice(0, 2).map((q: any) => ({
          id: q._id || q.id,
          hasReferenceImages: 'referenceImages' in q,
          referenceImages: q.referenceImages,
          referenceImagesType: typeof q.referenceImages,
          referenceImagesIsArray: Array.isArray(q.referenceImages),
          referenceImagesCount: Array.isArray(q.referenceImages) ? q.referenceImages.length : 0,
          keys: Object.keys(q)
        })));
      }
      
      // Process referenceImages for each quotation - filter out placeholder URLs and ensure proper format
      const processedData = data.map((quotation: any) => {
        // Get referenceImages from the quotation - check multiple possible field names
        let referenceImages = quotation.referenceImages || 
                             quotation.referenceimages || 
                             (quotation as any).reference_images || 
                             [];
        
        console.log('Quotation Request Service - Processing quotation:', {
          id: quotation._id || quotation.id,
          originalReferenceImages: referenceImages,
          originalType: typeof referenceImages,
          originalIsArray: Array.isArray(referenceImages)
        });
        
        if (Array.isArray(referenceImages)) {
          // Filter out placeholder URLs if any exist
          const beforeFilter = referenceImages.length;
          referenceImages = referenceImages.filter((url: string) => {
            if (!url || typeof url !== 'string') {
              return false;
            }
            // Keep only actual image URLs, not placeholder URLs
            return !url.includes('via.placeholder.com') && !url.includes('placeholder');
          });
          console.log('Quotation Request Service - Filtered referenceImages:', {
            id: quotation._id || quotation.id,
            before: beforeFilter,
            after: referenceImages.length,
            urls: referenceImages
          });
        } else {
          // If referenceImages is not an array, convert to array or set to empty
          console.log('Quotation Request Service - referenceImages is not an array, converting to empty array:', {
            id: quotation._id || quotation.id,
            value: referenceImages
          });
          referenceImages = [];
        }
        
        // Explicitly include referenceImages in the response
        const processedQuotation: any = {
          ...quotation,
          referenceImages: referenceImages, // Explicitly set processed referenceImages
        };
        
        // Ensure referenceImages is always explicitly set
        if (!('referenceImages' in processedQuotation)) {
          processedQuotation.referenceImages = referenceImages;
        }
        
        console.log('Quotation Request Service - Processed quotation:', {
          id: processedQuotation._id || processedQuotation.id,
          hasReferenceImages: 'referenceImages' in processedQuotation,
          referenceImages: processedQuotation.referenceImages,
          referenceImagesCount: processedQuotation.referenceImages?.length || 0
        });
        
        return processedQuotation;
      });
      
      // Log summary of referenceImages processing
      if (processedData.length > 0) {
        const withImages = processedData.filter((q: any) => q.referenceImages && q.referenceImages.length > 0).length;
        console.log(`Quotation Request Service - Processed ${processedData.length} quotations, ${withImages} have reference images`);
      }
      
      // Debug: Log userIds from found quotations to see format
      if (processedData && processedData.length > 0) {
        console.log('Quotation Request Service - Sample userIds from results:', processedData.slice(0, 3).map((q: any) => ({
          id: q._id || q.id,
          userId: q.userId,
          userIdType: typeof q.userId,
          referenceImagesCount: q.referenceImages?.length || 0
        })));
      } else {
        console.log('⚠️ Quotation Request Service - No quotations found. Checking if quotations exist without userId...');
        // Debug query to see if any quotations exist at all
        const allQuotations = await this.repo.find({ where: { isDeleted: false }, take: 5 });
        console.log('Quotation Request Service - Sample quotations (first 5, any userId):', allQuotations.map((q: any) => ({
          id: q._id || q.id,
          userId: q.userId,
          hasUserId: !!q.userId,
          userIdType: typeof q.userId,
          referenceImagesCount: q.referenceImages?.length || 0
        })));
      }
      
      return { data: processedData, total, page, limit };
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

  async update(id: string, updateDto: Partial<CreateQuotationRequestDto>): Promise<QuotationRequest> {
    try {
      const entity = await this.findOne(id);
      
      // Handle reference images if provided
      let uploadedImageUrls: string[] = entity.referenceImages || [];
      
      if (updateDto.referenceImages && updateDto.referenceImages.length > 0) {
        // Check if images are base64 (new uploads) or URLs (existing)
        const base64Images = updateDto.referenceImages.filter(img => img.startsWith('data:image'));
        const existingUrls = updateDto.referenceImages.filter(img => !img.startsWith('data:image'));
        
        if (base64Images.length > 0) {
          try {
            const newUploadedUrls = await this.uploadBase64Images(base64Images);
            uploadedImageUrls = [...existingUrls, ...newUploadedUrls];
          } catch (uploadError) {
            console.error('❌ Error uploading reference images during update:', uploadError);
            // Keep existing images if upload fails
            uploadedImageUrls = existingUrls.length > 0 ? existingUrls : entity.referenceImages || [];
          }
        } else {
          // All are existing URLs
          uploadedImageUrls = existingUrls;
        }
      }
      
      // Update entity fields
      if (updateDto.eventHall !== undefined) entity.eventHall = updateDto.eventHall;
      if (updateDto.eventDate !== undefined) entity.eventDate = new Date(updateDto.eventDate);
      if (updateDto.endDate !== undefined) entity.endDate = new Date(updateDto.endDate);
      if (updateDto.startTime !== undefined) entity.startTime = updateDto.startTime;
      if (updateDto.endTime !== undefined) entity.endTime = updateDto.endTime;
      if (updateDto.venueAddress !== undefined) entity.venueAddress = updateDto.venueAddress;
      if (updateDto.photographerType !== undefined) entity.photographerType = updateDto.photographerType;
      if (updateDto.specialRequirement !== undefined) entity.specialRequirement = updateDto.specialRequirement;
      if (updateDto.expectedGuests !== undefined) entity.expectedGuests = updateDto.expectedGuests;
      if (updateDto.coverageDuration !== undefined) entity.coverageDuration = updateDto.coverageDuration;
      if (updateDto.numberOfPhotographers !== undefined) entity.numberOfPhotographers = updateDto.numberOfPhotographers;
      if (updateDto.budgetRange !== undefined) entity.budgetRange = updateDto.budgetRange;
      if (updateDto.vendorId !== undefined) entity.vendorId = updateDto.vendorId;
      if (updateDto.venueId !== undefined) entity.venueId = updateDto.venueId;
      if (updateDto.userId !== undefined) entity.userId = updateDto.userId;
      
      // Update reference images
      entity.referenceImages = uploadedImageUrls;

      return await this.repo.save(entity);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to update quotation request: ${error.message}`);
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

  // Helper function to wrap upload with timeout
  private async uploadWithTimeout(
    uploadPromise: Promise<any>,
    timeoutMs: number = 30000 // 30 seconds timeout
  ): Promise<any> {
    return Promise.race([
      uploadPromise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error(`Upload timeout after ${timeoutMs}ms`)), timeoutMs)
      )
    ]);
  }

  private async uploadBase64Images(base64Images: string[]): Promise<string[]> {
    try {
      console.log(`📸 Uploading ${base64Images.length} reference images for quotation request...`);
      const uploadedUrls: string[] = [];
      const awsConfig = this.configService.get('aws');
      const hasAwsConfig = awsConfig && awsConfig.bucketName && awsConfig.bucketFolderName;
      
      for (let i = 0; i < base64Images.length; i++) {
        const base64Image = base64Images[i];
        const imageIndex = i + 1;
        
        if (!base64Image) {
          console.log(`⚠️ Skipping image ${imageIndex}/${base64Images.length}: empty base64 data`);
          continue;
        }
        
        try {
          const matches = base64Image.match(/^data:image\/(png|jpeg|jpg);base64,(.+)$/);
          if (!matches) {
            console.error(`❌ Image ${imageIndex}/${base64Images.length}: Invalid base64 image format`);
            continue; // Skip invalid images instead of throwing
          }
        
        const ext = matches[1];
        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, 'base64');
        const mimetype = `image/${ext}`;
        const timestamp = Date.now();
        const fileName = `request_quotation_${timestamp}_${Math.random()
          .toString(36)
          .substring(7)}.${ext}`;

          console.log(`📁 Processing image ${imageIndex}/${base64Images.length}:`, { ext, mimetype, fileName, size: buffer.length });

          let imageUrl = '';
          let uploadSuccess = false;
          
          if (process.env.NODE_ENV === 'local') {
            console.log(`🏠 Image ${imageIndex}/${base64Images.length}: Using Supabase for local development (same as profile uploads)`);
            // Use Supabase with 'profiles' bucket (same as profile uploads)
            const supabaseBuckets = ['profiles', 'uploads'];
            for (const bucket of supabaseBuckets) {
              try {
                console.log(`☁️ Image ${imageIndex}/${base64Images.length}: Trying Supabase bucket: ${bucket}`);
                const { publicUrl } = await this.uploadWithTimeout(
                  this.supabaseService.upload({
                    filePath: `quotation/${fileName}`,
                    file: buffer,
                    contentType: mimetype,
                    bucket: bucket,
                    upsert: true,
                  }),
                  30000 // 30 second timeout per upload
                );
                if (publicUrl) {
                  imageUrl = publicUrl;
                  console.log(`✅ Image ${imageIndex}/${base64Images.length}: Supabase upload successful (bucket: ${bucket}):`, imageUrl);
                  uploadSuccess = true;
                  break;
                }
              } catch (supabaseError: any) {
                console.log(`⚠️ Image ${imageIndex}/${base64Images.length}: Supabase bucket ${bucket} failed:`, supabaseError.message);
                continue;
              }
            }
          } else {
            // Production: Try Supabase first (same as profile uploads), then AWS S3 as fallback
            console.log(`☁️ Image ${imageIndex}/${base64Images.length}: Using Supabase for production (same as profile uploads)`);
            
            // Try Supabase first with 'profiles' bucket (same as profile uploads)
            const supabaseBuckets = ['profiles', 'uploads'];
            for (const bucket of supabaseBuckets) {
              try {
                console.log(`☁️ Image ${imageIndex}/${base64Images.length}: Trying Supabase bucket: ${bucket}`);
                const { publicUrl } = await this.uploadWithTimeout(
                  this.supabaseService.upload({
                    filePath: `quotation/${fileName}`,
                    file: buffer,
                    contentType: mimetype,
                    bucket: bucket,
                    upsert: true,
                  }),
                  30000 // 30 second timeout per upload
                );
                if (publicUrl) {
                  imageUrl = publicUrl;
                  console.log(`✅ Image ${imageIndex}/${base64Images.length}: Supabase upload successful (bucket: ${bucket}):`, imageUrl);
                  uploadSuccess = true;
                  break;
                }
              } catch (supabaseError: any) {
                console.log(`⚠️ Image ${imageIndex}/${base64Images.length}: Supabase bucket ${bucket} failed:`, supabaseError.message);
                continue;
              }
            }
            
            // If Supabase failed, try AWS S3 as fallback (only if configured)
            if (!uploadSuccess && hasAwsConfig) {
              try {
                console.log(`☁️ Image ${imageIndex}/${base64Images.length}: Trying AWS S3 as fallback`);
                const awsUploadReqDto = {
                  Bucket: awsConfig.bucketName,
                  Key: awsConfig.bucketFolderName + '/' + 'quotation' + '/' + fileName,
                  Body: buffer,
                  ContentType: mimetype,
                } as any;
                
                const response = await this.awsS3Service.uploadFilesToS3Bucket(awsUploadReqDto);
                imageUrl = (response as any)?.Location || '';
                if (imageUrl) {
                  console.log(`✅ Image ${imageIndex}/${base64Images.length}: AWS S3 upload successful:`, imageUrl);
                  uploadSuccess = true;
                }
              } catch (s3Error: any) {
                console.error(`❌ Image ${imageIndex}/${base64Images.length}: AWS S3 upload also failed:`, s3Error.message);
              }
            }
            
            // If all uploads failed
            if (!uploadSuccess) {
              console.error(`❌ Image ${imageIndex}/${base64Images.length}: All upload methods failed - Supabase buckets unavailable and AWS config missing or failed`);
              console.log(`⚠️ Image ${imageIndex}/${base64Images.length}: Image upload failed completely, skipping this image`);
              imageUrl = '';
            }
          }
          
          // Only add non-empty URLs (skip failed uploads)
          if (imageUrl && imageUrl.trim() !== '') {
            uploadedUrls.push(imageUrl);
            console.log(`✅ Image ${imageIndex}/${base64Images.length}: Successfully added to upload list`);
          } else {
            console.log(`⚠️ Image ${imageIndex}/${base64Images.length}: Skipping image due to upload failure`);
          }
          
          // Add a delay between uploads to avoid rate limiting (except for the last image)
          // Increased delay to 500ms to prevent rate limiting with multiple images
          if (imageIndex < base64Images.length) {
            await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay between uploads
          }
        } catch (imageError: any) {
          // Catch any error during image processing and continue with next image
          console.error(`❌ Image ${imageIndex}/${base64Images.length}: Error processing image:`, imageError.message);
          console.error(`❌ Image ${imageIndex}/${base64Images.length}: Error stack:`, imageError.stack);
          // Continue processing other images
          // Still add delay even on error to avoid rate limiting
          if (imageIndex < base64Images.length) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
      }
      
      console.log('✅ All reference images processed:', uploadedUrls.length);
      console.log('✅ Uploaded URLs:', uploadedUrls);
      // Filter out any empty strings just to be safe
      const filteredUrls = uploadedUrls.filter(url => url && url.trim() !== '');
      console.log('✅ Filtered URLs to return:', filteredUrls);
      return filteredUrls;
      
    } catch (error) {
      console.error('❌ Error uploading reference images:', error);
      throw error;
    }
  }
}
