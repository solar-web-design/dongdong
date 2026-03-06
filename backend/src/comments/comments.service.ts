import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async getComments(postId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('게시글을 찾을 수 없습니다');

    return {
      data: await this.prisma.comment.findMany({
        where: { postId, parentId: null },
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
      }),
    };
  }

  async create(postId: string, authorId: string, dto: CreateCommentDto) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('게시글을 찾을 수 없습니다');

    if (dto.parentId) {
      const parent = await this.prisma.comment.findUnique({
        where: { id: dto.parentId },
      });
      if (!parent || parent.postId !== postId) {
        throw new NotFoundException('상위 댓글을 찾을 수 없습니다');
      }
    }

    return this.prisma.comment.create({
      data: { content: dto.content, postId, authorId, parentId: dto.parentId },
      include: {
        author: { select: { id: true, name: true, profileImage: true } },
      },
    });
  }

  async update(
    id: string,
    userId: string,
    userRole: Role,
    dto: UpdateCommentDto,
  ) {
    const comment = await this.findCommentOrThrow(id);
    if (
      comment.authorId !== userId &&
      !([Role.PRESIDENT, Role.VICE_PRESIDENT] as Role[]).includes(userRole)
    ) {
      throw new ForbiddenException('수정 권한이 없습니다');
    }
    return this.prisma.comment.update({
      where: { id },
      data: { content: dto.content },
      include: {
        author: { select: { id: true, name: true, profileImage: true } },
      },
    });
  }

  async remove(id: string, userId: string, userRole: Role) {
    const comment = await this.findCommentOrThrow(id);
    if (
      comment.authorId !== userId &&
      !([Role.PRESIDENT, Role.VICE_PRESIDENT] as Role[]).includes(userRole)
    ) {
      throw new ForbiddenException('삭제 권한이 없습니다');
    }
    await this.prisma.comment.delete({ where: { id } });
    return { message: '댓글이 삭제되었습니다' };
  }

  private async findCommentOrThrow(id: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id } });
    if (!comment) throw new NotFoundException('댓글을 찾을 수 없습니다');
    return comment;
  }
}
