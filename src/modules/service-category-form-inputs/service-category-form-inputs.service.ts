import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { ServiceCategoryFormInput } from './entity/service-category-form-input.entity';
import { CreateServiceCategoryFormInputDto } from './dto/request/create-service-category-form-input.dto';
import { UpdateServiceCategoryFormInputDto } from './dto/request/update-service-category-form-input.dto';
import { ObjectId } from 'mongodb';

type FormInputResponse = {
  id: string;
  categoryId: string;
  label: string;
  active: boolean;
  minrange?: number;
  maxrange?: number;
};

function toDbLabel(label: string): string {
  return label.replace(/\s+/g, '_');
}

function fromDbLabel(label: string): string {
  if (label.includes('_')) {
    return label.replace(/_/g, ' ');
  }
  return label;
}

@Injectable()
export class ServiceCategoryFormInputsService {
  constructor(
    @InjectRepository(ServiceCategoryFormInput, 'mongo')
    private readonly repo: MongoRepository<ServiceCategoryFormInput>,
  ) {}

  async create(dto: CreateServiceCategoryFormInputDto): Promise<FormInputResponse> {
    const dbLabel = toDbLabel(dto.label);

    const existing = await this.repo.findOne({
      where: { categoryId: dto.categoryId, label: dbLabel } as any,
    });
    if (existing) {
      throw new BadRequestException('This label is already added for the selected category');
    }

    const entity = this.repo.create({
      ...dto,
      label: dbLabel,
    });
    const saved = await this.repo.save(entity);
    return this.toResponse(saved);
  }

  async findAll(categoryId?: string): Promise<FormInputResponse[]> {
    const where = categoryId ? { categoryId } : {} as any;
    const items = await this.repo.find({ where, order: { createdAt: 'DESC' } as any });
    return items.map((e) => this.toResponse(e));
  }

  async findOne(id: string): Promise<FormInputResponse> {
    if (!ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid form input id format: ${id}`);
    }
    const entity = await this.repo.findOneBy({ _id: new ObjectId(id) });
    if (!entity) throw new NotFoundException('Form input not found');
    return this.toResponse(entity);
  }

  async update(id: string, dto: UpdateServiceCategoryFormInputDto): Promise<FormInputResponse> {
    const entity = await this.repo.findOne({ where: { _id: new ObjectId(id) } as any });
    if (!entity) throw new NotFoundException('Form input not found');

    const updated: UpdateServiceCategoryFormInputDto = { ...dto };
    if (updated.label !== undefined) {
      updated.label = toDbLabel(updated.label as unknown as string) as any;
    }

    Object.assign(entity, updated);
    const saved = await this.repo.save(entity);
    return this.toResponse(saved);
  }

  async remove(id: string) {
    const entity = await this.repo.findOne({ where: { _id: new ObjectId(id) } as any });
    if (!entity) throw new NotFoundException('Form input not found');
    await this.repo.remove(entity);
    return { success: true };
  }

  private toResponse(e: ServiceCategoryFormInput): FormInputResponse {
    const res: FormInputResponse = {
      id: e.id?.toString?.() ?? String((e as any)._id ?? ''),
      categoryId: e.categoryId,
      label: e.label,
      active: e.active,
    };
    if (e.minrange !== undefined) res.minrange = e.minrange;
    if (e.maxrange !== undefined) res.maxrange = e.maxrange;
    return res;
  }
}
