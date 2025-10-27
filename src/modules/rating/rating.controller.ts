import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ValidationPipe,
  UsePipes,
  BadRequestException,
  Post,
  Body,
  HttpStatus,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RatingService } from './rating.service';
import { Rating } from './entity/rating.entity';
import { ObjectId } from 'mongodb';
import { CreateRatingDto } from './dto/request/create-rating.dto';
import { UserFeedbackDto } from './dto/request/user-feedback.dto';
import { UserFeedbackResponseDto } from './dto/response/user-feedback-response.dto';
import { RatingWithUserResponseDto } from './dto/response/rating-with-user-response.dto';

@ApiTags('Ratings')
@Controller('ratings')
@ApiBearerAuth()
@UsePipes(new ValidationPipe({ transform: true }))
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Submit a new rating for an entity (vendor or venue)',
    description:
      'Allows authenticated users to submit a rating and an optional review for a specified vendor or venue.',
  })
  @ApiBody({ type: CreateRatingDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Rating submitted successfully',
    type: Rating,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Invalid entity ID or user ID format, user has already rated this entity, or validation failed',
  })
  async createRating(
    @Body() createRatingDto: CreateRatingDto,
    @Req() req: any,
  ): Promise<Rating> {
    const userId = req.user.id;
    return this.ratingService.createRating(createRatingDto, userId);
  }

  @Get('entity/:entityId')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Get all ratings for a specific entity (vendor or venue)',
    description:
      'Retrieves a list of all individual ratings and reviews submitted for a given vendor or venue.',
  })
  @ApiParam({
    name: 'entityId',
    description: 'ID of the entity (vendor or venue) to retrieve ratings for',
    example: '60d0fe4f53c113001f2f0001',
  })
  @ApiQuery({
    name: 'entityType',
    description: 'Type of the entity (vendor or venue)',
    enum: ['vendor', 'venue'],
    required: true,
    example: 'vendor',
  })
  async findRatingsByEntity(
    @Param('entityId') entityId: string,
    @Query('entityType') entityType: 'vendor' | 'venue',
  ): Promise<RatingWithUserResponseDto[]> {
    if (!ObjectId.isValid(entityId)) {
      throw new BadRequestException('Invalid entity ID format');
    }
    if (!entityType || !['vendor', 'venue'].includes(entityType)) {
      throw new BadRequestException(
        "Invalid entity type. Must be 'vendor' or 'venue'.",
      );
    }
    return this.ratingService.findRatingsByEntity(entityId, entityType);
  }

  @Post('user')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Submit user feedback for a vendor or venue',
    description: 'Allows authenticated users to submit feedback and rating for vendors or venues',
  })
  @ApiBody({ type: UserFeedbackDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User feedback submitted successfully',
    type: UserFeedbackResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid entity ID format or validation failed',
  })
  async submitUserFeedback(
    @Body() userFeedbackDto: UserFeedbackDto,
    @Req() req: any,
  ): Promise<UserFeedbackResponseDto> {
    const userId = req.user.id;
    return this.ratingService.submitUserFeedback(userFeedbackDto, userId);
  }
}