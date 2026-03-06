import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { PrismaService } from '../prisma/prisma.service';

describe('FinanceService', () => {
  let service: FinanceService;

  const mockPrisma = {
    feeSchedule: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    feePayment: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      upsert: jest.fn(),
      update: jest.fn(),
    },
    accountBook: {
      findMany: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FinanceService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<FinanceService>(FinanceService);
    jest.clearAllMocks();
  });

  describe('getFeeSchedules', () => {
    it('should return fee schedules', async () => {
      const schedules = [{ id: 'fs-1', type: 'MONTHLY', amount: 10000 }];
      mockPrisma.feeSchedule.findMany.mockResolvedValue(schedules);

      const result = await service.getFeeSchedules();

      expect(result.data).toHaveLength(1);
    });
  });

  describe('createFeeSchedule', () => {
    it('should create a fee schedule', async () => {
      const dto = { type: 'MONTHLY', amount: 10000, dueDate: '2025-04-01' };
      mockPrisma.feeSchedule.create.mockResolvedValue({
        id: 'fs-1',
        ...dto,
        dueDate: new Date(dto.dueDate),
      });

      const result = await service.createFeeSchedule(dto as any);

      expect(mockPrisma.feeSchedule.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ dueDate: expect.any(Date) }),
      });
    });
  });

  describe('getPaymentsBySchedule', () => {
    it('should return payments for a schedule', async () => {
      mockPrisma.feeSchedule.findUnique.mockResolvedValue({ id: 'fs-1' });
      mockPrisma.feePayment.findMany.mockResolvedValue([
        { id: 'fp-1', amount: 10000, status: 'PENDING' },
      ]);

      const result = await service.getPaymentsBySchedule('fs-1');

      expect(result.data).toHaveLength(1);
    });

    it('should throw NotFoundException if schedule not found', async () => {
      mockPrisma.feeSchedule.findUnique.mockResolvedValue(null);

      await expect(
        service.getPaymentsBySchedule('non-existent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('createPayment', () => {
    it('should create or update a payment', async () => {
      mockPrisma.feeSchedule.findUnique.mockResolvedValue({ id: 'fs-1' });
      mockPrisma.feePayment.upsert.mockResolvedValue({
        id: 'fp-1',
        amount: 10000,
        status: 'PENDING',
      });

      const result = await service.createPayment('fs-1', 'user-1', {
        amount: 10000,
      } as any);

      expect(result.amount).toBe(10000);
    });

    it('should throw NotFoundException if schedule not found', async () => {
      mockPrisma.feeSchedule.findUnique.mockResolvedValue(null);

      await expect(
        service.createPayment('non-existent', 'user-1', { amount: 10000 } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('confirmPayment', () => {
    it('should confirm a payment', async () => {
      mockPrisma.feePayment.findUnique.mockResolvedValue({
        id: 'fp-1',
        status: 'PENDING',
      });
      mockPrisma.feePayment.update.mockResolvedValue({
        id: 'fp-1',
        status: 'PAID',
        paidAt: new Date(),
      });

      const result = await service.confirmPayment('fp-1');

      expect(result.status).toBe('PAID');
    });

    it('should throw NotFoundException if payment not found', async () => {
      mockPrisma.feePayment.findUnique.mockResolvedValue(null);

      await expect(service.confirmPayment('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getAccountBooks', () => {
    it('should return account books with summary', async () => {
      mockPrisma.accountBook.findMany.mockResolvedValue([
        { id: 'ab-1', type: 'INCOME', amount: 100000 },
      ]);
      mockPrisma.accountBook.count.mockResolvedValue(1);
      mockPrisma.accountBook.aggregate
        .mockResolvedValueOnce({ _sum: { amount: 100000 } })
        .mockResolvedValueOnce({ _sum: { amount: 30000 } });

      const result = await service.getAccountBooks({ page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.summary).toEqual({
        totalIncome: 100000,
        totalExpense: 30000,
        balance: 70000,
      });
    });

    it('should handle null aggregates', async () => {
      mockPrisma.accountBook.findMany.mockResolvedValue([]);
      mockPrisma.accountBook.count.mockResolvedValue(0);
      mockPrisma.accountBook.aggregate
        .mockResolvedValueOnce({ _sum: { amount: null } })
        .mockResolvedValueOnce({ _sum: { amount: null } });

      const result = await service.getAccountBooks({});

      expect(result.summary).toEqual({
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
      });
    });

    it('should filter by type and date range', async () => {
      mockPrisma.accountBook.findMany.mockResolvedValue([]);
      mockPrisma.accountBook.count.mockResolvedValue(0);
      mockPrisma.accountBook.aggregate
        .mockResolvedValueOnce({ _sum: { amount: null } })
        .mockResolvedValueOnce({ _sum: { amount: null } });

      await service.getAccountBooks({
        type: 'INCOME' as any,
        startDate: '2025-01-01',
        endDate: '2025-12-31',
      });

      expect(mockPrisma.accountBook.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            type: 'INCOME',
            date: { gte: expect.any(Date), lte: expect.any(Date) },
          }),
        }),
      );
    });
  });

  describe('createAccountBook', () => {
    it('should create an account book entry', async () => {
      const dto = {
        type: 'INCOME',
        amount: 50000,
        description: '회비 수입',
        date: '2025-03-01',
      };
      mockPrisma.accountBook.create.mockResolvedValue({
        id: 'ab-1',
        ...dto,
        date: new Date(dto.date),
      });

      const result = await service.createAccountBook(dto as any);

      expect(mockPrisma.accountBook.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ date: expect.any(Date) }),
      });
    });
  });
});
