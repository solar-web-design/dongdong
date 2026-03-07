import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import { ResolveReportDto } from './dto/resolve-report.dto';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async create(reporterId: string, dto: CreateReportDto) {
    // Check duplicate report
    const existing = await this.prisma.report.findFirst({
      where: {
        reporterId,
        ...(dto.postId && { postId: dto.postId }),
        ...(dto.commentId && { commentId: dto.commentId }),
        status: 'PENDING',
      },
    });
    if (existing) {
      throw new ConflictException('이미 신고한 콘텐츠입니다');
    }

    // Verify target exists
    if (dto.type === 'POST' && dto.postId) {
      const post = await this.prisma.post.findUnique({ where: { id: dto.postId } });
      if (!post) throw new NotFoundException('게시글을 찾을 수 없습니다');
      if (post.authorId === reporterId) throw new ForbiddenException('자신의 게시글은 신고할 수 없습니다');
    }
    if (dto.type === 'COMMENT' && dto.commentId) {
      const comment = await this.prisma.comment.findUnique({ where: { id: dto.commentId } });
      if (!comment) throw new NotFoundException('댓글을 찾을 수 없습니다');
      if (comment.authorId === reporterId) throw new ForbiddenException('자신의 댓글은 신고할 수 없습니다');
    }

    return this.prisma.report.create({
      data: {
        type: dto.type,
        reason: dto.reason,
        description: dto.description,
        reporterId,
        postId: dto.postId,
        commentId: dto.commentId,
      },
    });
  }

  async findAll(status?: string) {
    const where = status ? { status: status as any } : {};
    const reports = await this.prisma.report.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    // Enrich with reporter/target info
    const enriched = await Promise.all(
      reports.map(async (report) => {
        const reporter = await this.prisma.user.findUnique({
          where: { id: report.reporterId },
          select: { id: true, name: true, profileImage: true },
        });

        let target = null;
        if (report.postId) {
          target = await this.prisma.post.findUnique({
            where: { id: report.postId },
            select: { id: true, title: true, content: true, authorId: true, author: { select: { name: true } } },
          });
        } else if (report.commentId) {
          target = await this.prisma.comment.findUnique({
            where: { id: report.commentId },
            select: { id: true, content: true, authorId: true, author: { select: { name: true } } },
          });
        }

        return { ...report, reporter, target };
      }),
    );

    return { data: enriched };
  }

  async resolve(id: string, resolvedById: string, dto: ResolveReportDto) {
    const report = await this.prisma.report.findUnique({ where: { id } });
    if (!report) throw new NotFoundException('신고를 찾을 수 없습니다');
    if (report.status !== 'PENDING') throw new ForbiddenException('이미 처리된 신고입니다');

    const updated = await this.prisma.report.update({
      where: { id },
      data: {
        status: dto.action as any,
        resolvedAt: new Date(),
        resolvedBy: resolvedById,
      },
    });

    // If resolved (not dismissed) and it's a post, delete the post
    if (dto.action === 'RESOLVED') {
      if (report.postId) {
        await this.prisma.post.delete({ where: { id: report.postId } }).catch(() => {});
      }
      if (report.commentId) {
        await this.prisma.comment.delete({ where: { id: report.commentId } }).catch(() => {});
      }
    }

    return updated;
  }

  async getStats() {
    const [pending, resolved, dismissed] = await Promise.all([
      this.prisma.report.count({ where: { status: 'PENDING' } }),
      this.prisma.report.count({ where: { status: 'RESOLVED' } }),
      this.prisma.report.count({ where: { status: 'DISMISSED' } }),
    ]);
    return { pending, resolved, dismissed, total: pending + resolved + dismissed };
  }
}
