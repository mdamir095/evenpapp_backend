import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { Field } from './entity/field.entity';
import { CreateFieldDto } from './dto/request/create-field.dto';
import { UpdateFieldDto } from './dto/request/update-field.dto';

@Injectable()
export class FieldsService {
  constructor(
    @InjectRepository(Field, 'mongo')
    private readonly fieldRepository: MongoRepository<Field>,
  ) {}

  async create(createFieldDto: CreateFieldDto): Promise<Field> {
    const field = new Field();
    Object.assign(field, createFieldDto);
    field.setDefaultValues();
    return await this.fieldRepository.save(field);
  }

  async findAll(): Promise<Field[]> {
    return await this.fieldRepository.find({ where: { isDeleted: false }, order: { order: 'ASC' } });
  }

  async findOne(key: string): Promise<Field> {
    const field = await this.fieldRepository.findOne({ where: { key, isDeleted: false } });
    if (!field) throw new NotFoundException(`Field with key ${key} not found`);
    return field;
  }

  async update(key: string, updateFieldDto: UpdateFieldDto): Promise<Field> {
    const field = await this.findOne(key);
    Object.assign(field, updateFieldDto);
    return await this.fieldRepository.save(field);
  }

  async remove(key: string): Promise<{ message: string }> {
    const field = await this.findOne(key);
    if (!field) { 
      throw new NotFoundException(`Field with key ${key} not found`);
    }
    this.fieldRepository.update({ key: key }, { isDeleted: true });
    return { message: 'Field deleted successfully' };
  }
}
