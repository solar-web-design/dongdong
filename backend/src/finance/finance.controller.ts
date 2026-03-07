import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import * as express from 'express';
import { Role } from '@prisma/client';
import { FinanceService } from './finance.service';
import { CreateFeeScheduleDto } from './dto/create-fee-schedule.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreateAccountBookDto } from './dto/create-account-book.dto';
import { QueryAccountBookDto } from './dto/query-account-book.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class FinanceController {
  constructor(private financeService: FinanceService) {}

  // ---- Fee Schedules ----

  @Get('fees/schedules')
  getFeeSchedules(@Req() req: express.Request) {
    return this.financeService.getFeeSchedules(req.tenantId);
  }

  @Post('fees/schedules')
  @Roles(Role.TREASURER, Role.PRESIDENT)
  createFeeSchedule(@Body() dto: CreateFeeScheduleDto, @Req() req: express.Request) {
    return this.financeService.createFeeSchedule(dto, req.tenantId);
  }

  @Get('fees/schedules/:id/payments')
  getPaymentsBySchedule(@Param('id') id: string) {
    return this.financeService.getPaymentsBySchedule(id);
  }

  // ---- Payments ----

  @Post('fees/payments/:scheduleId')
  createPayment(
    @Param('scheduleId') scheduleId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreatePaymentDto,
  ) {
    return this.financeService.createPayment(scheduleId, userId, dto);
  }

  @Patch('fees/payments/:id/confirm')
  @Roles(Role.TREASURER)
  confirmPayment(@Param('id') id: string) {
    return this.financeService.confirmPayment(id);
  }

  // ---- Account Book ----

  @Get('finance/books')
  getAccountBooks(@Query() query: QueryAccountBookDto, @Req() req: express.Request) {
    return this.financeService.getAccountBooks(query, req.tenantId);
  }

  @Post('finance/books')
  @Roles(Role.TREASURER)
  createAccountBook(@Body() dto: CreateAccountBookDto, @Req() req: express.Request) {
    return this.financeService.createAccountBook(dto, req.tenantId);
  }
}
