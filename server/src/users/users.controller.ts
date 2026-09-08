import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { IsString } from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../auth/current-user.decorator';
import { UsersService } from './users.service';

class PushTokenDto {
  @IsString()
  token!: string;
}

@UseGuards(JwtAuthGuard)
@Controller('devices')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Post('token')
  setToken(@CurrentUser() user: AuthUser, @Body() dto: PushTokenDto) {
    return this.users.setPushToken(user.id, dto.token);
  }
}
