import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { plainToInstance } from 'class-transformer';
import { Feedback } from './entity/feedback.entity';
import { CreateFeedbackDto } from './dto/request/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/request/update-feedback.dto';
import { FeedbackResponseDto } from './dto/response/feedback-response.dto';
import { FeedbackPaginatedResponseDto } from './dto/response/feedback-paginated.dto';
import { FeedbackPaginationDto } from './dto/request/feedback-pagination.dto';
import { IPaginationMeta } from '@common/interfaces/paginationMeta.interface';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback, 'mongo')
    private readonly feedbackRepo: MongoRepository<Feedback>,
  ) {}

  async create(req:any, dto: CreateFeedbackDto): Promise<FeedbackResponseDto> {
     const email = req.user?.email;
     const name = req.user?.firstName + ' ' + req.user?.lastName;
    if (!email) {
      throw new BadRequestException('User email is required');  
    }
    
    const feedback = this.feedbackRepo.create({ ...dto, email, name });
    const saved = await this.feedbackRepo.save(feedback);
    return plainToInstance(FeedbackResponseDto, saved, { excludeExtraneousValues: true });
  }

  async findAll(pagination: FeedbackPaginationDto): Promise<FeedbackPaginatedResponseDto> {
    const { page = 1, limit = 10, search } = pagination;
    const skip = (page - 1) * limit;
    const where: any = { isDeleted: false };
    if (search) {
      where.$or = [
        { name: { $regex: new RegExp(search, 'i') } },
        { feedback: { $regex: new RegExp(search, 'i') } },
      ];
    }

    const [items, total] = await Promise.all([
      this.feedbackRepo.find({ where, skip, take: limit, order: { createdAt: 'DESC' } }),
      this.feedbackRepo.count(where),
    ]);
    const data = plainToInstance(FeedbackResponseDto, items, { excludeExtraneousValues: true });
    const meta: IPaginationMeta = { total, page, limit, totalPages: Math.ceil(total / limit) };
    return { data, pagination: meta };
  }

  async findOne(id: string): Promise<FeedbackResponseDto> {
    if (!ObjectId.isValid(id)) throw new BadRequestException('Invalid feedback id');
    const item = await this.feedbackRepo.findOneBy({ _id: new ObjectId(id) });
    if (!item || item.isDeleted) throw new NotFoundException('Feedback not found');
    return plainToInstance(FeedbackResponseDto, item, { excludeExtraneousValues: true });
  }

  async update(id: string, dto: UpdateFeedbackDto): Promise<FeedbackResponseDto> {
    if (!ObjectId.isValid(id)) throw new BadRequestException('Invalid feedback id');
    const existing = await this.feedbackRepo.findOneBy({ _id: new ObjectId(id) });
    if (!existing || existing.isDeleted) throw new NotFoundException('Feedback not found');
    await this.feedbackRepo.updateOne({ _id: new ObjectId(id) }, { $set: { ...dto, updatedAt: new Date() } });
    return this.findOne(id);
  }

  async remove(id: string): Promise<{ message: string }> {
    if (!ObjectId.isValid(id)) throw new BadRequestException('Invalid feedback id');
    const existing = await this.feedbackRepo.findOneBy({ _id: new ObjectId(id) });
    if (!existing || existing.isDeleted) throw new NotFoundException('Feedback not found');
    await this.feedbackRepo.updateOne({ _id: new ObjectId(id) }, { $set: { isDeleted: true, updatedAt: new Date() } });
    return { message: 'Feedback deleted successfully' };
  }
}

