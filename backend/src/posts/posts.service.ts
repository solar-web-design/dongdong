import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { QueryPostsDto } from './dto/query-posts.dto';

@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  private requireTenant(tenantId?: string): string {
    if (!tenantId) throw new ForbiddenException('테넌트 컨텍스트가 필요합니다');
    return tenantId;
  }

  async create(authorId: string, dto: CreatePostDto, tenantId?: string) {
    const tid = this.requireTenant(tenantId);
    const post = await this.prisma.post.create({
      data: { ...dto, authorId, tenantId: tid },
      include: { author: { select: { id: true, name: true, profileImage: true } } },
    });

    // 같은 테넌트의 활성 회원들에게 알림 생성
    const members = await this.prisma.user.findMany({
      where: { status: 'ACTIVE', id: { not: authorId }, tenantId: tid },
      select: { id: true },
    });

    const notificationPromises = members.map((m) =>
      this.notifications.create(
        m.id,
        'POST',
        '새 게시글',
        `${post.author.name}님이 "${post.title}" 글을 올렸습니다`,
        `/posts/${post.id}`,
        tid,
      ),
    );
    Promise.all(notificationPromises).catch(() => {});

    return post;
  }

  async findAll(query: QueryPostsDto, tenantId?: string) {
    if (!tenantId) return { data: [], total: 0, page: 1, totalPages: 0 };
    const { page = 1, limit = 20, category, search } = query;
    const where: Prisma.PostWhereInput = {
      tenantId,
      ...(category && { category }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        include: {
          author: { select: { id: true, name: true, profileImage: true } },
          _count: { select: { comments: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      }),
      this.prisma.post.count({ where }),
    ]);

    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string, tenantId?: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, profileImage: true } },
        comments: {
          where: { parentId: null },
          include: {
            author: { select: { id: true, name: true, profileImage: true } },
            replies: {
              include: {
                author: { select: { id: true, name: true, profileImage: true } },
              },
              orderBy: { createdAt: 'asc' },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        _count: { select: { likes: true } },
      },
    });
    if (!post) throw new NotFoundException('게시글을 찾을 수 없습니다');
    if (tenantId && post.tenantId !== tenantId) {
      throw new ForbiddenException('접근 권한이 없습니다');
    }

    // Increment view count
    await this.prisma.post.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return post;
  }

  async update(id: string, userId: string, userRole: Role, dto: UpdatePostDto, tenantId?: string) {
    const post = await this.findPostOrThrow(id, tenantId);
    if (
      post.authorId !== userId &&
      !([Role.PRESIDENT, Role.VICE_PRESIDENT] as Role[]).includes(userRole)
    ) {
      throw new ForbiddenException('수정 권한이 없습니다');
    }
    return this.prisma.post.update({
      where: { id },
      data: dto,
      include: { author: { select: { id: true, name: true, profileImage: true } } },
    });
  }

  async remove(id: string, userId: string, userRole: Role, tenantId?: string) {
    const post = await this.findPostOrThrow(id, tenantId);
    if (
      post.authorId !== userId &&
      !([Role.PRESIDENT, Role.VICE_PRESIDENT] as Role[]).includes(userRole)
    ) {
      throw new ForbiddenException('삭제 권한이 없습니다');
    }
    await this.prisma.post.delete({ where: { id } });
    return { message: '게시글이 삭제되었습니다' };
  }

  async toggleLike(postId: string, userId: string, tenantId?: string) {
    await this.findPostOrThrow(postId, tenantId);
    const existing = await this.prisma.postLike.findUnique({
      where: { postId_userId: { postId, userId } },
    });

    if (existing) {
      await this.prisma.$transaction([
        this.prisma.postLike.delete({ where: { id: existing.id } }),
        this.prisma.post.update({
          where: { id: postId },
          data: { likeCount: { decrement: 1 } },
        }),
      ]);
      const post = await this.prisma.post.findUnique({ where: { id: postId } });
      return { liked: false, likeCount: post!.likeCount };
    }

    await this.prisma.$transaction([
      this.prisma.postLike.create({ data: { postId, userId } }),
      this.prisma.post.update({
        where: { id: postId },
        data: { likeCount: { increment: 1 } },
      }),
    ]);
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    return { liked: true, likeCount: post!.likeCount };
  }

  async pinPost(id: string, tenantId?: string) {
    const post = await this.findPostOrThrow(id, tenantId);
    return this.prisma.post.update({
      where: { id },
      data: { isPinned: !post.isPinned },
      include: { author: { select: { id: true, name: true, profileImage: true } } },
    });
  }

  private async findPostOrThrow(id: string, tenantId?: string) {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('게시글을 찾을 수 없습니다');
    if (tenantId && post.tenantId !== tenantId) {
      throw new ForbiddenException('접근 권한이 없습니다');
    }
    return post;
  }
}
