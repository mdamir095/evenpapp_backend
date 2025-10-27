import { Module } from '@nestjs/common';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { Task } from './entities/task.entity';
import { Guest } from './entities/guest.entity';
import { BudgetCategory } from './entities/budget-category.entity';

@Module({
    controllers: [EventController],
    providers: [
        EventService
    ],
    exports: [
        EventService

    ],
    imports: [
        TypeOrmModule.forFeature([Event, Task, Guest, BudgetCategory], 'mongo'),
    ],
})
export class EventModule {}
