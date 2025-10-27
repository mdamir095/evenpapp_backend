import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, ValidationPipe, UsePipes } from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/request/create-event.dto';
import { UpdateEventDto } from './dto/request/update-event.dto';
import { CreateTaskDto } from './dto/request/create-task.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Features } from '@common/decorators/permission.decorator';
import { FeatureGuard } from '@common/guards/features.guard';
import { FeatureType } from '@shared/enums/featureType';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Events')
@Controller('events')
@ApiBearerAuth()
@UsePipes(new ValidationPipe({ transform: true }))
@UseGuards(AuthGuard('jwt'), FeatureGuard)
@Features(FeatureType.EVENT_MANAGEMENT)
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @ApiOperation({ summary: 'Create a new event' })
  @Post()
  create(@Body() createEventDto: CreateEventDto) {
    return this.eventService.create(createEventDto);
  }

  @ApiOperation({ summary: 'Get all events' })
  @Get()
  findAll() {
    return this.eventService.findAll();
  }

  @ApiOperation({ summary: 'Get event by ID' })
  @Get(':key')
  findOne(@Param('key') key: string) {
    return this.eventService.findOne(key);
  }

  @ApiOperation({ summary: 'Update event by ID' })
  @Put(':key')
  update(@Param('key') key: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventService.update(key, updateEventDto);
  }

  @ApiOperation({ summary: 'Delete event by ID' })
  @Delete(':key')
  remove(@Param('key') key: string) {
    return this.eventService.remove(key);
  }

  /** Task APIs */
  @ApiOperation({ summary: 'Create a new Task' })
  @Post('tasks')
  addTask(@Body() createTaskDto: CreateTaskDto) {
    return this.eventService.addTask(createTaskDto);
  }

  @ApiOperation({ summary: 'Update task by ID' })
  @Put('tasks/:id')
  updateTask(@Param('id') id: string, @Body() data: CreateTaskDto) {
    return this.eventService.updateTask(id, data);
  }

  @ApiOperation({ summary: 'Delete task by ID' })
  @Delete('tasks/:key')
  deleteTask(@Param('key') key: string) {
    return this.eventService.deleteTask(key);
  }
}
