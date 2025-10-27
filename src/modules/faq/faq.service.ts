import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { Faq } from './entity/faq.entity';
import { CreateFaqDto } from './dto/request/create-faq.dto';
import { UpdateFaqDto } from './dto/request/update-faq.dto';
import { FaqQueryDto } from './dto/request/faq-query.dto';
import { FaqResponseDto } from './dto/response/faq-response.dto';
import { FaqPaginatedDto } from './dto/response/faq-paginated.dto';

@Injectable()
export class FaqService {
  constructor(
    @InjectRepository(Faq, 'mongo')
    private readonly faqRepository: MongoRepository<Faq>,
  ) {}

  // 1. CREATE - Create a new FAQ
  async create(createFaqDto: CreateFaqDto): Promise<FaqResponseDto> {
    try {
      const faq = this.faqRepository.create({
        ...createFaqDto,
        isExpanded: createFaqDto.isExpanded !== undefined ? createFaqDto.isExpanded : false,
      });

      const savedFaq = await this.faqRepository.save(faq);
      return new FaqResponseDto(savedFaq);
    } catch (error) {
      throw new BadRequestException('Failed to create FAQ');
    }
  }

  // 2. READ ALL - Get all FAQs with filtering and pagination
  async findAll(queryDto: FaqQueryDto): Promise<FaqPaginatedDto> {
    const { search, isActive, page = 1, limit = 10 } = queryDto;
    
    // Build MongoDB query
    const where: any = { isDeleted: false };

    if (search) {
      where.$or = [
        { question: { $regex: search, $options: 'i' } },
        { answer: { $regex: search, $options: 'i' } }
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // Apply pagination
    const skip = (page - 1) * limit;

    const [faqs, total] = await Promise.all([
      this.faqRepository.find({
        where,
        order: { createdAt: 'DESC' },
        skip,
        take: limit
      }),
      this.faqRepository.count({ where })
    ]);

    const faqResponses = faqs.map(faq => new FaqResponseDto(faq));
    return new FaqPaginatedDto(faqResponses, total, page, limit);
  }

  // 2b. READ ALL SIMPLE - Get all active FAQs without pagination and filters
  async findAllSimple(): Promise<FaqResponseDto[]> {
    const faqs = await this.faqRepository.find({
      where: { isDeleted: false, isActive: true },
      order: { createdAt: 'DESC' }
    });

    return faqs.map(faq => new FaqResponseDto(faq));
  }

  // 3. READ ONE - Get a specific FAQ by ID
  async findOne(id: string): Promise<FaqResponseDto> {
    let faq: Faq | null = null;
    
    try {
      // Try to find by ObjectId first
      faq = await this.faqRepository.findOne({ 
        where: { _id: new ObjectId(id), isDeleted: false } 
      });
    } catch (error) {
      // If ObjectId parsing fails, try to find by key
      faq = await this.faqRepository.findOne({ 
        where: { key: id, isDeleted: false } 
      });
    }
    
    if (!faq) {
      throw new NotFoundException(`FAQ with ID ${id} not found`);
    }

    return new FaqResponseDto(faq);
  }

  // 4. UPDATE - Update an existing FAQ
  async update(id: string, updateFaqDto: UpdateFaqDto): Promise<FaqResponseDto> {
    let faq: Faq | null = null;
    
    try {
      // Try to find by ObjectId first
      faq = await this.faqRepository.findOne({ 
        where: { _id: new ObjectId(id), isDeleted: false } 
      });
    } catch (error) {
      // If ObjectId parsing fails, try to find by key
      faq = await this.faqRepository.findOne({ 
        where: { key: id, isDeleted: false } 
      });
    }
    
    if (!faq) {
      throw new NotFoundException(`FAQ with ID ${id} not found`);
    }

    try {
      Object.assign(faq, updateFaqDto);
      const updatedFaq = await this.faqRepository.save(faq);
      return new FaqResponseDto(updatedFaq);
    } catch (error) {
      throw new BadRequestException('Failed to update FAQ');
    }
  }

  // 5. DELETE - Soft delete an FAQ
  async remove(id: string): Promise<void> {
    let faq: Faq | null = null;
    
    try {
      // Try to find by ObjectId first
      faq = await this.faqRepository.findOne({ 
        where: { _id: new ObjectId(id), isDeleted: false } 
      });
    } catch (error) {
      // If ObjectId parsing fails, try to find by key
      faq = await this.faqRepository.findOne({ 
        where: { key: id, isDeleted: false } 
      });
    }
    
    if (!faq) {
      throw new NotFoundException(`FAQ with ID ${id} not found`);
    }

    try {
      // Soft delete by setting isDeleted flag
      faq.isDeleted = true;
      await this.faqRepository.save(faq);
    } catch (error) {
      throw new BadRequestException('Failed to delete FAQ');
    }
  }
}