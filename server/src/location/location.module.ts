import { Module } from '@nestjs/common';
import { GuardiansModule } from '../guardians/guardians.module';
import { LocationService } from './location.service';
import { LocationController } from './location.controller';

@Module({
  imports: [GuardiansModule],
  controllers: [LocationController],
  providers: [LocationService],
})
export class LocationModule {}
