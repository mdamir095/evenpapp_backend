import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/request/create-event.dto';
import { UpdateEventDto } from './dto/request/update-event.dto';
import { CreateTaskDto } from './dto/request/create-task.dto';
import { Task } from './entities/task.entity';

@Injectable()
export class EventService {
    constructor(
        @InjectRepository(Event, 'mongo')
        private eventRepo: Repository<Event>,

        @InjectRepository(Task, 'mongo')
        private taskRepo: Repository<Task>,
    ) {}

    async create(createEventDto: CreateEventDto): Promise<Event> {
        const event = this.eventRepo.create(createEventDto);
        return this.eventRepo.save(event);
    }

    async findAll(): Promise<Event[]> {
        return this.eventRepo.find({ relations: ['tasks', 'guests', 'vendors', 'budget'] });
    }

    async findOne(key: string): Promise<any> {
        // const event = await this.eventRepo.findOne({
        // where: { key },
        // relations: ['tasks', 'guests', 'vendors', 'budget'],
        // });
        // if (!event) throw new NotFoundException(`Event with KEY ${key} not found`);
        return null;
    }

    async update(key: string, updateEventDto: UpdateEventDto): Promise<any> {
        // await this.eventRepo.update({key}, updateEventDto);
        // return this.findOne(key);
        return null
    }

    async remove(key: string): Promise<void> {
        // await this.eventRepo.delete({key});
    }

    /** Tasks APIs */
    async addTask(createTaskDto: CreateTaskDto): Promise<Task> {
        const event = await this.findOne(createTaskDto.eventId);
        const task = this.taskRepo.create({ ...createTaskDto, event });
        return this.taskRepo.save(task);
    }

    async updateTask(key: string, data: CreateTaskDto): Promise<any> {
        // const updatedTask = await this.taskRepo.findOneBy({ key:key });
        // if (!updatedTask) {
        //     throw new NotFoundException(`Task with KEY ${key} not found`);
        // }
        // await this.taskRepo.update(key, data);
        return null;
    }

    async deleteTask(key: string): Promise<void> {
        const result = await this.taskRepo.delete(key);
        if (result.affected === 0) {
            throw new NotFoundException(`Task with KEY ${key} not found`);
        }
    }
}

