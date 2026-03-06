import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
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
  getFeeSchedules() {
    return this.financeService.getFeeSchedules();
  }

  @Post('fees/schedules')
  @Roles(Role.TREASURER, Role.PRESIDENT)
  createFeeSchedule(@Body() dto: CreateFeeScheduleDto) {
    return this.financeService.createFeeSchedule(dto);
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
  getAccountBooks(@Query() query: QueryAccountBookDto) {
    return this.financeService.getAccountBooks(query);
  }

  @Post('finance/books')
  @Roles(Role.TREASURER)
  createAccountBook(@Body() dto: CreateAccountBookDto) {
    return this.financeService.createAccountBook(dto);
  }
}
