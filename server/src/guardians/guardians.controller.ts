import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../auth/current-user.decorator';
import { GuardiansService } from './guardians.service';
import { InviteGuardianDto, UpdateGuardianDto } from './dto/invite-guardian.dto';

@UseGuards(JwtAuthGuard)
@Controller('guardians')
export class GuardiansController {
  constructor(private readonly guardians: GuardiansService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.guardians.list(user.id);
  }

  @Get('watching')
  watching(@CurrentUser() user: AuthUser) {
    return this.guardians.watching(user.id);
  }

  @Get('lookup')
  lookup(@Query('contact') contact = '') {
    return this.guardians.lookupContact(contact);
  }

  @Post()
  invite(@CurrentUser() user: AuthUser, @Body() dto: InviteGuardianDto) {
    return this.guardians.invite(user.id, user.name, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateGuardianDto,
  ) {
    return this.guardians.updateStatus(user.id, id, dto);
  }

  @Post(':id/accept')
  accept(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.guardians.respond(user.id, id, true);
  }

  @Post(':id/decline')
  decline(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.guardians.respond(user.id, id, false);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.guardians.remove(user.id, id);
  }
}
