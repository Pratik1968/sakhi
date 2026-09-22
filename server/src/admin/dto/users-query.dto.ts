import { IsISO8601, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from './common.dto';

export class UsersQueryDto extends PaginationDto {
  // Free-text match against name + email + phone.
  @IsOptional()
  @IsString()
  search?: string;

  // Filters on User.createdAt (joined date).
  @IsOptional()
  @IsISO8601()
  from?: string;

  @IsOptional()
  @IsISO8601()
  to?: string;
}
