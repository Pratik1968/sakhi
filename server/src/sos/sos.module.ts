import { Module } from '@nestjs/common';
import { GuardiansModule } from '../guardians/guardians.module';
import { SosService } from './sos.service';
import { SosController } from './sos.controller';

@Module({
  imports: [GuardiansModule],
  controllers: [SosController],
  providers: [SosService],
})
export class SosModule {}
