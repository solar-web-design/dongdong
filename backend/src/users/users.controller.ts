import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangeRoleDto } from './dto/change-role.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { WithdrawDto } from './dto/withdraw.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  getMe(@CurrentUser('id') userId: string) {
    return this.usersService.getMe(userId);
  }

  @Delete('me')
  withdrawMe(
    @CurrentUser('id') userId: string,
    @Body() dto: WithdrawDto,
  ) {
    return this.usersService.withdrawUser(userId, dto.password);
  }

  @Patch('me')
  updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(userId, dto);
  }

  @Get('pending')
  @Roles(Role.PRESIDENT)
  getPendingUsers() {
    return this.usersService.getPendingUsers();
  }

  @Get(':id')
  getUserById(@Param('id') id: string) {
    return this.usersService.getUserById(id);
  }

  @Get()
  getUsers(@Query() query: QueryUsersDto) {
    return this.usersService.getUsers(query);
  }

  @Patch(':id/approve')
  @Roles(Role.PRESIDENT)
  approveUser(
    @Param('id') id: string,
    @CurrentUser('id') approvedById: string,
  ) {
    return this.usersService.approveUser(id, approvedById);
  }

  @Patch(':id/reject')
  @Roles(Role.PRESIDENT)
  rejectUser(@Param('id') id: string) {
    return this.usersService.rejectUser(id);
  }

  @Patch(':id/role')
  @Roles(Role.PRESIDENT)
  changeRole(@Param('id') id: string, @Body() dto: ChangeRoleDto) {
    return this.usersService.changeRole(id, dto);
  }

  @Delete(':id')
  @Roles(Role.PRESIDENT)
  removeUser(@Param('id') id: string) {
    return this.usersService.removeUser(id);
  }
}
