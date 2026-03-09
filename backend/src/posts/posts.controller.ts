import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import * as express from 'express';
import { Role } from '@prisma/client';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { QueryPostsDto } from './dto/query-posts.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ChatGateway } from '../chat/chat.gateway';

@Controller('posts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PostsController {
  constructor(
    private postsService: PostsService,
    private chatGateway: ChatGateway,
  ) {}

  @Get()
  findAll(@Query() query: QueryPostsDto, @Req() req: express.Request) {
    return this.postsService.findAll(query, req.tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: express.Request) {
    return this.postsService.findOne(id, req.tenantId);
  }

  @Post()
  async create(@CurrentUser('id') userId: string, @Body() dto: CreatePostDto, @Req() req: express.Request) {
    const post = await this.postsService.create(userId, dto, req.tenantId);
    this.chatGateway.broadcastPostCreated(post.id);
    return post;
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: Role,
    @Body() dto: UpdatePostDto,
    @Req() req: express.Request,
  ) {
    return this.postsService.update(id, userId, role, dto, req.tenantId);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: Role,
    @Req() req: express.Request,
  ) {
    const result = await this.postsService.remove(id, userId, role, req.tenantId);
    this.chatGateway.broadcastPostDeleted(id);
    return result;
  }

  @Post(':id/like')
  toggleLike(@Param('id') id: string, @CurrentUser('id') userId: string, @Req() req: express.Request) {
    return this.postsService.toggleLike(id, userId, req.tenantId);
  }

  @Patch(':id/pin')
  @Roles(Role.PRESIDENT, Role.VICE_PRESIDENT)
  pinPost(@Param('id') id: string, @Req() req: express.Request) {
    return this.postsService.pinPost(id, req.tenantId);
  }
}
