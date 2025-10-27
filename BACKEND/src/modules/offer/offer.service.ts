import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { plainToInstance } from 'class-transformer';
import { CreateOfferDto } from './dto/request/create-offer.dto';
import { UpdateOfferDto } from './dto/request/update-offer.dto';
import { OfferResponseDto } from './dto/response/offer-response.dto';
import { OfferPaginatedResponseDto } from './dto/response/offer-paginated.dto';
import { OfferPaginationDto } from './dto/request/offer-pagination.dto';
import { IPaginationMeta } from '@common/interfaces/paginationMeta.interface';
import { Offer } from './entity/offer.entity';
import { OfferStatus } from '@shared/enums/offerStatus';

@Injectable()
export class OfferService {
  constructor(
    @InjectRepository(Offer, 'mongo')
    private readonly offerRepo: MongoRepository<Offer>,
  ) {}

  async create(createDto: CreateOfferDto): Promise<OfferResponseDto> {
    // Validate dates
    const start = new Date(createDto.startDate);
    const end = new Date(createDto.endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException('Invalid startDate or endDate');
    }
    if (end < start) {
      throw new BadRequestException('endDate must be after startDate');
    }

    if (createDto.couponCode) {
      const existingCode = await this.offerRepo.findOne({ where: { couponCode: createDto.couponCode, isDeleted: false } });
      if (existingCode) throw new BadRequestException('Coupon code already exists');
    }

    const offer = this.offerRepo.create({
      ...createDto,
      startDate: start,
      endDate: end,
      status: createDto.status ?? OfferStatus.INACTIVE,
      usageCount: 0,
    });
    const saved = await this.offerRepo.save(offer);
    return plainToInstance(OfferResponseDto, saved, { excludeExtraneousValues: true });
  }

  async findAll(paginationDto: OfferPaginationDto): Promise<OfferPaginatedResponseDto> {
    const { page = 1, limit = 10, search, type, status } = paginationDto;
    const skip = (page - 1) * limit;

    const query: any = { isDeleted: false };
    if (type) query.type = type;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: new RegExp(search, 'i') } },
        { description: { $regex: new RegExp(search, 'i') } },
      ];
    }

    const [offers, total] = await Promise.all([
      this.offerRepo.find({ where: query, skip, take: limit, order: { createdAt: 'DESC' } }),
      this.offerRepo.count(query),
    ]);

    const data = plainToInstance(OfferResponseDto, offers, { excludeExtraneousValues: true });
    const pagination: IPaginationMeta = { total, page, limit, totalPages: Math.ceil(total / limit) };
    return { data, pagination };
  }

  async findOne(id: string): Promise<OfferResponseDto> {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid offer ID format');
    }
    const offer = await this.offerRepo.findOneBy({ _id: new ObjectId(id) });
    if (!offer || offer.isDeleted) throw new NotFoundException('Offer not found');
    return plainToInstance(OfferResponseDto, offer, { excludeExtraneousValues: true });
  }

  async update(id: string, updateDto: UpdateOfferDto): Promise<OfferResponseDto> {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid offer ID format');
    }
    const existing = await this.offerRepo.findOneBy({ _id: new ObjectId(id) });
    if (!existing || existing.isDeleted) throw new NotFoundException('Offer not found');

    if (updateDto.couponCode && updateDto.couponCode !== existing.couponCode) {
      const duplicate = await this.offerRepo.findOne({ where: { couponCode: updateDto.couponCode, isDeleted: false, _id: { $ne: new ObjectId(id) } } as any });
      if (duplicate) throw new BadRequestException('Coupon code already exists');
    }

    const updateData: any = { ...updateDto };
    if (updateDto.startDate) updateData.startDate = new Date(updateDto.startDate);
    if (updateDto.endDate) updateData.endDate = new Date(updateDto.endDate);
    updateData.updatedAt = new Date();

    await this.offerRepo.updateOne({ _id: new ObjectId(id) }, { $set: updateData });
    return this.findOne(id);
  }

  async remove(id: string): Promise<{ message: string }> {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid offer ID format');
    }
    const existing = await this.offerRepo.findOneBy({ _id: new ObjectId(id) });
    if (!existing || existing.isDeleted) throw new NotFoundException('Offer not found');

    await this.offerRepo.updateOne({ _id: new ObjectId(id) }, { $set: { isDeleted: true, updatedAt: new Date() } });
    return { message: 'Offer deleted successfully' };
  }

  async getActiveOffers(page = 1, limit = 10, type?: string): Promise<OfferPaginatedResponseDto> {
    const skip = (page - 1) * limit;
    const match: any = { isDeleted: false, status: OfferStatus.ACTIVE };
    if (type) match.type = type;

    // Build aggregation for pagination
    const pipeline: any[] = [
      { $match: match },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
    ];
    const countPipeline: any[] = [{ $match: match }];

    const [countResult, dataResult] = await Promise.all([
      this.offerRepo.aggregate([...countPipeline, { $count: 'total' }]).toArray(),
      this.offerRepo.aggregate(pipeline).toArray(),
    ]);
    const total = countResult[0]?.total ?? 0;
    const data = plainToInstance(OfferResponseDto, dataResult, { excludeExtraneousValues: true });
    const pagination: IPaginationMeta = { total, page, limit, totalPages: Math.ceil(total / limit) };
    return { data, pagination };
  }

  async getFeaturedOffers(limit = 5): Promise<OfferResponseDto[]> {
    const match: any = { isDeleted: false, status: OfferStatus.ACTIVE };
    const pipeline: any[] = [
      { $match: match },
      { $sort: { createdAt: -1 } },
      { $limit: limit },
    ];
    const result = await this.offerRepo.aggregate(pipeline).toArray();
    return plainToInstance(OfferResponseDto, result, { excludeExtraneousValues: true });
  }

  async getOffersByCategory(category: string, limit = 10): Promise<OfferResponseDto[]> {
    const match: any = { isDeleted: false, status: OfferStatus.ACTIVE, categoryId: category };
    const pipeline: any[] = [
      { $match: match },
      { $sort: { createdAt: -1 } },
      { $limit: limit },
    ];
    const result = await this.offerRepo.aggregate(pipeline).toArray();
    return plainToInstance(OfferResponseDto, result, { excludeExtraneousValues: true });
  }

  async getOfferById(id: string): Promise<OfferResponseDto> {
    if (!ObjectId.isValid(id)) throw new NotFoundException(`Invalid offer id format: ${id}`);
    const pipeline: any[] = [
      { $match: { _id: new ObjectId(id), isDeleted: false } },
      { $limit: 1 },
    ];
    const result = await this.offerRepo.aggregate(pipeline).toArray();
    if (!result || result.length === 0) throw new NotFoundException(`Offer not found with id: ${id}`);
    return plainToInstance(OfferResponseDto, result[0], { excludeExtraneousValues: true });
  }

  async validateCouponCode(couponCode: string): Promise<{ valid: boolean; message: string }> {
    if (!couponCode) throw new BadRequestException('couponCode is required');
    const match: any = { couponCode: couponCode, isDeleted: false, status: OfferStatus.ACTIVE };
    const pipeline: any[] = [
      { $match: match },
      { $limit: 1 },
    ];
    const result = await this.offerRepo.aggregate(pipeline).toArray();
    if (!result || result.length === 0) {
      return { valid: false, message: 'Invalid or inactive coupon code' };
    }

    const offer = result[0];
    const now = new Date();
    if (offer.startDate && new Date(offer.startDate) > now) {
      return { valid: false, message: 'Coupon not yet active' };
    }
    if (offer.endDate && new Date(offer.endDate) < now) {
      return { valid: false, message: 'Coupon expired' };
    }
    if (offer.usageLimit && offer.usageCount >= offer.usageLimit) {
      return { valid: false, message: 'Coupon usage limit exceeded' };
    }
    return { valid: true, message: 'Coupon is valid' };
  }

  async incrementOfferUsage(id: string): Promise<void> {
    if (!ObjectId.isValid(id)) throw new BadRequestException('Invalid offer ID format');
    await this.offerRepo.updateOne(
      { _id: new ObjectId(id) },
      { $inc: { usageCount: 1 }, $set: { updatedAt: new Date() } },
    );
  }
}

