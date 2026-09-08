import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../auth/current-user.decorator';
import { SosService } from './sos.service';
import { StartSosDto } from './dto/sos.dto';

@UseGuards(JwtAuthGuard)
@Controller('sos')
export class SosController {
  constructor(private readonly sos: SosService) {}

  @Post()
  start(@CurrentUser() user: AuthUser, @Body() dto: StartSosDto) {
    return this.sos.start(user.id, user.name, dto);
  }

  @Get()
  mine(@CurrentUser() user: AuthUser) {
    return this.sos.mine(user.id);
  }

  @Get('feed')
  feed(@CurrentUser() user: AuthUser) {
    return this.sos.feed(user.id);
  }

  @Post(':id/resolve')
  resolve(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.sos.resolve(user.id, id, 'RESOLVED');
  }

  @Post(':id/cancel')
  cancel(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.sos.resolve(user.id, id, 'CANCELLED');
  }
}
