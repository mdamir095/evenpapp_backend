import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { plainToInstance } from 'class-transformer';
import { Notification } from './entity/notification.entity';
import { CreateNotificationDto } from './dto/request/create-notification.dto';
import { UpdateNotificationDto } from './dto/request/update-notification.dto';
import { NotificationResponseDto } from './dto/response/notification-response.dto';
import { NotificationPaginatedResponseDto } from './dto/response/notification-paginated.dto';
import { NotificationGroupedResponseDto, NotificationGroupDto } from './dto/response/notification-grouped.dto';
import { NotificationPaginationDto } from './dto/request/notification-pagination.dto';
import { IPaginationMeta } from '@common/interfaces/paginationMeta.interface';
import { NotificationStatus } from '@shared/enums/notificationStatus';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification, 'mongo')
    private readonly notifRepo: MongoRepository<Notification>,
  ) {}

  async create(dto: CreateNotificationDto): Promise<NotificationResponseDto> {
    const notify = this.notifRepo.create({ ...dto, status: NotificationStatus.PENDING });
    const saved = await this.notifRepo.save(notify);
    return plainToInstance(NotificationResponseDto, saved, { excludeExtraneousValues: true });
  }

  async findAll(pagination: NotificationPaginationDto): Promise<NotificationPaginatedResponseDto> {
    const { page = 1, limit = 10, search, status } = pagination;
    const skip = (page - 1) * limit;
    const where: any = { isDeleted: false };
    if (search) where.$or = [{ title: { $regex: new RegExp(search, 'i') } }, { message: { $regex: new RegExp(search, 'i') } }];
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      this.notifRepo.find({ where, skip, take: limit, order: { createdAt: 'DESC' } }),
      this.notifRepo.count(where),
    ]);
    const data = plainToInstance(NotificationResponseDto, items, { excludeExtraneousValues: true });
    const meta: IPaginationMeta = { total, page, limit, totalPages: Math.ceil(total / limit) };
    return { data, pagination: meta };
  }

  private getLabelForDate(date: Date): string {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isSameDay = (a: Date, b: Date) =>
      a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

    if (isSameDay(d, today)) return 'Today';
    if (isSameDay(d, yesterday)) return 'Yesterday';
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  async findAllGrouped(pagination: NotificationPaginationDto): Promise<NotificationGroupedResponseDto> {
    const { page = 1, limit = 10, search, status } = pagination;
    const skip = (page - 1) * limit;

    const match: any = { isDeleted: false };
    if (search) {
      match.$or = [
        { title: { $regex: new RegExp(search, 'i') } },
        { message: { $regex: new RegExp(search, 'i') } },
      ];
    }
    if (status) match.status = status;

    const pipeline: any[] = [
      { $match: match },
      {
        $set: {
          _date: { $dateToString: { date: '$createdAt', format: '%Y-%m-%d' } },
          _today: { $dateToString: { date: '$$NOW', format: '%Y-%m-%d' } },
          _yesterday: {
            $dateToString: {
              date: { $dateSubtract: { startDate: '$$NOW', unit: 'day', amount: 1 } },
              format: '%Y-%m-%d',
            },
          },
        },
      },
      {
        $set: {
          label: {
            $switch: {
              branches: [
                { case: { $eq: ['$_date', '$_today'] }, then: 'Today' },
                { case: { $eq: ['$_date', '$_yesterday'] }, then: 'Yesterday' },
              ],
              default: '$_date',
            },
          },
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          meta: [{ $count: 'total' }],
          paged: [
            { $skip: skip },
            { $limit: limit },
            { $group: { _id: '$label', items: { $push: '$$ROOT' } } },
            { $project: { _id: 0, label: '$_id', items: 1 } },
          ],
        },
      },
    ];

    const aggResult = await this.notifRepo.aggregate(pipeline).toArray();
    const first = aggResult[0] || { meta: [], paged: [] };
    const total = first.meta?.[0]?.total ?? 0;
    const groups = (first.paged as Array<{ label: string; items: any[] }>) || [];

    const data: NotificationGroupDto[] = groups.map((g) => ({
      label: g.label,
      items: g.items.map((doc) => plainToInstance(NotificationResponseDto, doc, { excludeExtraneousValues: true })),
    }));

    const meta: IPaginationMeta = { total, page, limit, totalPages: Math.ceil(total / limit) };
    return { data, pagination: meta };
  }

  async findOne(id: string): Promise<NotificationResponseDto> {
    if (!ObjectId.isValid(id)) throw new BadRequestException('Invalid notification id');
    const item = await this.notifRepo.findOneBy({ _id: new ObjectId(id) });
    if (!item || item.isDeleted) throw new NotFoundException('Notification not found');
    return plainToInstance(NotificationResponseDto, item, { excludeExtraneousValues: true });
  }

  async update(id: string, dto: UpdateNotificationDto): Promise<NotificationResponseDto> {
    if (!ObjectId.isValid(id)) throw new BadRequestException('Invalid notification id');
    const existing = await this.notifRepo.findOneBy({ _id: new ObjectId(id) });
    if (!existing || existing.isDeleted) throw new NotFoundException('Notification not found');
    await this.notifRepo.updateOne({ _id: new ObjectId(id) }, { $set: { ...dto, updatedAt: new Date() } });
    return this.findOne(id);
  }

  async markAsSent(id: string): Promise<NotificationResponseDto> {
    if (!ObjectId.isValid(id)) throw new BadRequestException('Invalid notification id');
    await this.notifRepo.updateOne({ _id: new ObjectId(id) }, { $set: { status: NotificationStatus.SENT, updatedAt: new Date() } });
    return this.findOne(id);
  }

  async markAsFailed(id: string, error?: string): Promise<NotificationResponseDto> {
    if (!ObjectId.isValid(id)) throw new BadRequestException('Invalid notification id');
    await this.notifRepo.updateOne({ _id: new ObjectId(id) }, { $set: { status: NotificationStatus.FAILED, error: error ?? null, updatedAt: new Date() } });
    return this.findOne(id);
  }

  async remove(id: string): Promise<{ message: string }> {
    if (!ObjectId.isValid(id)) throw new BadRequestException('Invalid notification id');
    const existing = await this.notifRepo.findOneBy({ _id: new ObjectId(id) });
    if (!existing || existing.isDeleted) throw new NotFoundException('Notification not found');
    await this.notifRepo.updateOne({ _id: new ObjectId(id) }, { $set: { isDeleted: true, updatedAt: new Date() } });
    return { message: 'Notification deleted successfully' };
  }
}

