import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { CreateContentPolicyDto } from './dto/request/create-content-policy.dto';
import { ContentPolicyService } from './content-policy.service';
import { UpdateContentPolicyDto } from './dto/request/update-content-policy.dto';
import { ContentPolicyResponseDto } from './dto/response/content-policy.dto';
import { ApiOperation, ApiQuery, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { IPagination } from '../../common/interfaces/pagination.interface';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Content Policies')
@Controller('content-policies')
export class ContentPolicyController {
    constructor(private readonly contentPolicyService: ContentPolicyService) {}

    @Post()
    @ApiOperation({ summary: 'Create a new content policy' })
    create(@Body() createContentPolicyDto: CreateContentPolicyDto): Promise<ContentPolicyResponseDto> {
        return this.contentPolicyService.create(createContentPolicyDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all content policies with pagination and search' })
    @ApiQuery({ name: 'page', type: Number, required: false, description: 'Page number', example: 1 })
    @ApiQuery({ name: 'limit', type: Number, required: false, description: 'Limit number', example: 10 })
    @ApiQuery({ name: 'title', type: String, required: false, description: 'Search by title' })
    findAll(
        @Query('page') page: number = 1, 
        @Query('limit') limit: number = 10,
        @Query('title') title: string = ''
    ): Promise<IPagination<ContentPolicyResponseDto>> {
        return this.contentPolicyService.findAll(page, limit, title);
    }

    @Get('categories')
    @ApiOperation({ summary: 'Get all available categories' })
    getCategories(): Promise<{ categories: { key: string; value: string }[] }> {
        return this.contentPolicyService.getCategories();
    }

    @Get('category/:category')
    @ApiOperation({ summary: 'Get active policy by category' })
    getByCategory(@Param('category') category: string): Promise<ContentPolicyResponseDto> {
        return this.contentPolicyService.findByCategory(category);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get content policy by ID' })
    findOne(@Param('id') id: string): Promise<ContentPolicyResponseDto> {
        return this.contentPolicyService.findOne(id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update content policy' })
    update(@Param('id') id: string, @Body() updateContentPolicyDto: UpdateContentPolicyDto): Promise<ContentPolicyResponseDto> {
        return this.contentPolicyService.update(id, updateContentPolicyDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete content policy' })
    delete(@Param('id') id: string): Promise<{ message: string }> {
        return this.contentPolicyService.delete(id);
    }
}
