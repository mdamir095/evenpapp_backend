import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { Form } from './entity/form.entity';
import { FormPaginatedResponseDto } from './dto/response/form-paginated.dto';
import { CreateFormDto } from './dto/request/create-form.dto';
import { UpdateFormDto } from './dto/request/update-form.dto';
import { ObjectId } from 'mongodb';

@Injectable()
export class FormService {
  constructor(
    @InjectRepository(Form, 'mongo')
    private readonly repo: MongoRepository<Form>
  ) {}

  async create(dto: CreateFormDto): Promise<Form> {
    const form = this.repo.create(dto);
    return this.repo.save(form);
  }

  async findAll(page = 1, limit = 10, type?: string): Promise<FormPaginatedResponseDto> {
    const skip = (page - 1) * limit;
    const where: any = { isActive: true, isDeleted: false };
    if (type) {
      where.type = type;
    }
    const [data, total] = await Promise.all([
      this.repo.find({ where, skip, take: limit, order: { createdAt: 'DESC' as any } }),
      this.repo.countDocuments(where),
    ]);
    return {
      data,
      pagination: {
        total,
        szPage: Number(page),
        szLimit: Number(limit),
        totalPages: Math.ceil(total / Number(limit || 10)),
      },
    };
  }

  async findOne(key: string): Promise<Form> {
    const form = await this.repo.findOne({ where: { key, isDeleted: false } });
    if (!form) throw new NotFoundException(`Form not found`);
    return form;
  }

  async findByType(type: string): Promise<Form[]> {
    return  await this.repo.find({ where: { type, isDeleted: false } });
  }

  async update(key: string, dto: UpdateFormDto): Promise<Form> {
    await this.repo.updateOne({ key }, { $set: dto });
    return this.findOne(key);
  }

  async delete(key: string): Promise<{ message: string }> {
    const form = await this.findOne(key);
    if (!form) {
      throw new NotFoundException(`Form with key ${key} not found`);
    }
    await this.repo.update({ key }, { isActive: false, isDeleted: true }); 
    return { message: 'Form deleted successfully' };
  }
  async findById(id: string): Promise<Form> {
    const form = await this.repo.findOne({
        where: { 
          _id: new ObjectId(id),
          isDeleted: { $ne: true } 
        }
      });
    if (!form) throw new NotFoundException(`Form not found with id: ${id}`);
    return form;
  }

  async findByCategoryId(categoryId: string): Promise<Form | null> {
    const form = await this.repo.findOne({
      where: { 
        categoryId: categoryId,
        isDeleted: { $ne: true } 
      }
    });
    return form;
  }
}
