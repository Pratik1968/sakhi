import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { RealtimeModule } from './realtime/realtime.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { GuardiansModule } from './guardians/guardians.module';
import { LocationModule } from './location/location.module';
import { SosModule } from './sos/sos.module';
import { IncidentsModule } from './incidents/incidents.module';
import { EvidenceModule } from './evidence/evidence.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    RealtimeModule,
    NotificationsModule,
    AuthModule,
    UsersModule,
    GuardiansModule,
    LocationModule,
    SosModule,
    IncidentsModule,
    EvidenceModule,
  ],
})
export class AppModule {}
