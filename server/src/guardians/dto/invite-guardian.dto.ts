import { IsIn, IsOptional, IsString } from 'class-validator';

export class InviteGuardianDto {
  @IsString()
  name!: string;

  // email or phone of the person being invited
  @IsString()
  contact!: string;

  @IsOptional()
  @IsIn(['ACTIVE', 'SOS_ONLY'])
  watchMode?: 'ACTIVE' | 'SOS_ONLY';
}

export class UpdateGuardianDto {
  @IsIn(['PENDING', 'ACTIVE', 'SOS_ONLY', 'DECLINED'])
  status!: 'PENDING' | 'ACTIVE' | 'SOS_ONLY' | 'DECLINED';
}
