import { IsIn, IsOptional } from 'class-validator';

// Filters for the emergency-contacts (guardian) aggregates.
export class ContactsQueryDto {
  @IsOptional()
  @IsIn(['PENDING', 'ACTIVE', 'SOS_ONLY', 'DECLINED'])
  status?: string;

  @IsOptional()
  @IsIn(['ACTIVE', 'SOS_ONLY'])
  watchMode?: string;
}
