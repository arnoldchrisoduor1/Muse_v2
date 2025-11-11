import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { PoemsService } from './poems.service';
import { CreatePoemDto } from './dto/create-poem.dto';
import { UpdatePoemDto } from './dto/update-poem.dto';
import { SearchPoemsDto } from './dto/search-poems.dto';
import { PoemResponseDto } from './dto/poem-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { GetAIFeedbackDto } from './dto/get-ai-feedback.dto';

@ApiTags('poems')
@Controller('poems')
export class PoemsController {
  constructor(private readonly poemsService: PoemsService) {}

  @Post()
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new poem' })
  @ApiResponse({
    status: 201,
    description: 'Poem created successfully',
    type: PoemResponseDto,
  })
  async create(
    @CurrentUser() user: any,
    @Body() createPoemDto: CreatePoemDto,
  ) {
    return this.poemsService.create(user.id, createPoemDto);
  }

  @Post('feedback')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get AI feedback for a poem' })
  @ApiResponse({
    status: 200,
    description: 'AI feedback generated successfully',
  })
  @ApiResponse({ status: 403, description: 'You can only get feedback on your own poems' })
  async getAIFeedbackDraft(
    @Body() getAIFeedbackDto: GetAIFeedbackDto,
  ) {
    return this.poemsService.getStatelessAIFeedback(
      getAIFeedbackDto.title,
      getAIFeedbackDto.content,
    );
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all published poems with filters' })
  @ApiResponse({
    status: 200,
    description: 'Poems retrieved successfully',
  })
  async findAll(@Query() searchDto: SearchPoemsDto) {
    return this.poemsService.findAll(searchDto);
  }

  @Public()
  @Get('search')
  @ApiOperation({ summary: 'Search poems' })
  @ApiResponse({
    status: 200,
    description: 'Search results',
  })
  async search(@Query() searchDto: SearchPoemsDto) {
    return this.poemsService.findAll(searchDto);
  }

  @Public()
  @Get('user/:userId')
  @ApiOperation({ summary: 'Get poems by user' })
  @ApiResponse({
    status: 200,
    description: 'User poems retrieved',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findByUser(
    @Param('userId') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.poemsService.findByUser(userId, page, limit);
  }

  @Get('my-drafts')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user drafts' })
  @ApiResponse({
    status: 200,
    description: 'Drafts retrieved successfully',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findUserDrafts(
    @CurrentUser() user: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.poemsService.findUserDrafts(user.id, page, limit);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get poem by ID' })
  @ApiResponse({
    status: 200,
    description: 'Poem found',
    type: PoemResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Poem not found' })
  async findOne(@Param('id') id: string) {
    return this.poemsService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update poem' })
  @ApiResponse({
    status: 200,
    description: 'Poem updated successfully',
    type: PoemResponseDto,
  })
  @ApiResponse({ status: 403, description: 'You can only update your own poems' })
  async update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() updatePoemDto: UpdatePoemDto,
  ) {
    return this.poemsService.update(id, user.id, updatePoemDto);
  }

  @Post(':id/publish')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Publish a draft poem' })
  @ApiResponse({
    status: 200,
    description: 'Poem published successfully',
    type: PoemResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Poem is already published' })
  async publish(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.poemsService.publish(id, user.id);
  }

  @Post(':id/unpublish')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unpublish a poem (set back to draft)' })
  @ApiResponse({
    status: 200,
    description: 'Poem unpublished successfully',
    type: PoemResponseDto,
  })
  async unpublish(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.poemsService.unpublish(id, user.id);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete poem' })
  @ApiResponse({
    status: 200,
    description: 'Poem deleted successfully',
  })
  @ApiResponse({ status: 403, description: 'You can only delete your own poems' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.poemsService.remove(id, user.id);
  }
}