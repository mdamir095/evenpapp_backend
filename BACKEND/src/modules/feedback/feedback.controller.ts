import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpStatus, UsePipes, ValidationPipe, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/request/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/request/update-feedback.dto';
import { FeedbackResponseDto } from './dto/response/feedback-response.dto';
import { FeedbackPaginatedResponseDto } from './dto/response/feedback-paginated.dto';
import { FeedbackPaginationDto } from './dto/request/feedback-pagination.dto';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Feedback')
@Controller('feedback')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@UsePipes(new ValidationPipe({ transform: true }))
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @ApiOperation({ summary: 'Submit feedback' })
  @ApiBody({ type: CreateFeedbackDto })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Feedback submitted', type: FeedbackResponseDto })
  create(@Req() req: any,@Body() dto: CreateFeedbackDto): Promise<FeedbackResponseDto> {
    return this.feedbackService.create(req,dto);
  }

  @Get()
  @ApiOperation({ summary: 'List feedback with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: HttpStatus.OK, type: FeedbackPaginatedResponseDto })
  findAll(@Query() pagination: FeedbackPaginationDto): Promise<FeedbackPaginatedResponseDto> {
    return this.feedbackService.findAll(pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get feedback by ID' })
  @ApiParam({ name: 'id', description: 'Feedback ID' })
  @ApiResponse({ status: HttpStatus.OK, type: FeedbackResponseDto })
  findOne(@Param('id') id: string): Promise<FeedbackResponseDto> {
    return this.feedbackService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update feedback' })
  @ApiParam({ name: 'id', description: 'Feedback ID' })
  @ApiResponse({ status: HttpStatus.OK, type: FeedbackResponseDto })
  update(@Param('id') id: string, @Body() dto: UpdateFeedbackDto): Promise<FeedbackResponseDto> {
    return this.feedbackService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete feedback' })
  @ApiParam({ name: 'id', description: 'Feedback ID' })
  @ApiResponse({ status: HttpStatus.OK })
  remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.feedbackService.remove(id);
  }
}

