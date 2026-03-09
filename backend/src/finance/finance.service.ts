import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFeeScheduleDto } from './dto/create-fee-schedule.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreateAccountBookDto } from './dto/create-account-book.dto';
import { QueryAccountBookDto } from './dto/query-account-book.dto';

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  private requireTenant(tenantId?: string): string {
    if (!tenantId) throw new ForbiddenException('테넌트 컨텍스트가 필요합니다');
    return tenantId;
  }

  // ---- Fee Schedules ----

  async getFeeSchedules(tenantId?: string, userId?: string) {
    if (!tenantId) return { data: [] };
    const where: Prisma.FeeScheduleWhereInput = { tenantId };
    const data = await this.prisma.feeSchedule.findMany({
      where,
      orderBy: { dueDate: 'desc' },
      include: {
        payments: userId ? { where: { userId } } : { include: { user: { select: { id: true, name: true } } } },
      },
    });
    return { data };
  }

  async createFeeSchedule(dto: CreateFeeScheduleDto, tenantId?: string) {
    const tid = this.requireTenant(tenantId);
    return this.prisma.feeSchedule.create({
      data: {
        ...dto,
        dueDate: new Date(dto.dueDate),
        tenantId: tid,
      },
    });
  }

  async getPaymentsBySchedule(scheduleId: string, tenantId?: string) {
    const schedule = await this.prisma.feeSchedule.findUnique({
      where: { id: scheduleId },
    });
    if (!schedule) throw new NotFoundException('회비 일정을 찾을 수 없습니다');
    if (tenantId && schedule.tenantId !== tenantId) {
      throw new ForbiddenException('접근 권한이 없습니다');
    }

    return {
      data: await this.prisma.feePayment.findMany({
        where: { scheduleId },
        include: {
          user: { select: { id: true, name: true, profileImage: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    };
  }

  // ---- Payments ----

  async createPayment(
    scheduleId: string,
    userId: string,
    dto: CreatePaymentDto,
    tenantId?: string,
  ) {
    const schedule = await this.prisma.feeSchedule.findUnique({
      where: { id: scheduleId },
    });
    if (!schedule) throw new NotFoundException('회비 일정을 찾을 수 없습니다');
    if (tenantId && schedule.tenantId !== tenantId) {
      throw new ForbiddenException('접근 권한이 없습니다');
    }

    return this.prisma.feePayment.upsert({
      where: { scheduleId_userId: { scheduleId, userId } },
      update: {
        amount: dto.amount,
        receiptImage: dto.receiptImage,
        status: 'PENDING',
      },
      create: {
        scheduleId,
        userId,
        amount: dto.amount,
        receiptImage: dto.receiptImage,
      },
    });
  }

  async confirmPayment(paymentId: string, tenantId?: string) {
    const payment = await this.prisma.feePayment.findUnique({
      where: { id: paymentId },
      include: { schedule: true },
    });
    if (!payment) throw new NotFoundException('납부 기록을 찾을 수 없습니다');
    if (tenantId && payment.schedule.tenantId !== tenantId) {
      throw new ForbiddenException('접근 권한이 없습니다');
    }

    return this.prisma.feePayment.update({
      where: { id: paymentId },
      data: { status: 'PAID', paidAt: new Date() },
    });
  }

  // ---- Account Book ----

  async getAccountBooks(query: QueryAccountBookDto, tenantId?: string) {
    if (!tenantId) return { data: [], summary: { totalIncome: 0, totalExpense: 0, balance: 0 } };
    const { page = 1, limit = 20, type, startDate, endDate } = query;
    const where: Prisma.AccountBookWhereInput = {
      tenantId,
      ...(type && { type }),
      ...(startDate &&
        endDate && {
          date: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        }),
    };

    const [data, total, incomeAgg, expenseAgg] = await Promise.all([
      this.prisma.accountBook.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { date: 'desc' },
      }),
      this.prisma.accountBook.count({ where }),
      this.prisma.accountBook.aggregate({
        where: { ...where, type: 'INCOME' },
        _sum: { amount: true },
      }),
      this.prisma.accountBook.aggregate({
        where: { ...where, type: 'EXPENSE' },
        _sum: { amount: true },
      }),
    ]);

    const totalIncome = incomeAgg._sum.amount || 0;
    const totalExpense = expenseAgg._sum.amount || 0;

    return {
      data,
      summary: {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
      },
    };
  }

  async createAccountBook(dto: CreateAccountBookDto, tenantId?: string) {
    const tid = this.requireTenant(tenantId);
    return this.prisma.accountBook.create({
      data: {
        ...dto,
        date: new Date(dto.date),
        tenantId: tid,
      },
    });
  }
}
