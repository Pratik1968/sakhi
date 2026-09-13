import { IsArray, IsOptional, IsString, MaxLength } from 'class-validator';

// A prior turn as the client stores it (ChatMsg): from 'me' | 'bot'.
export type ChatTurn = { from?: string; text?: string };

export class AskDto {
  @IsString()
  @MaxLength(2000)
  message!: string;

  // Recent conversation so the assistant has context. Loosely typed and
  // sanitised in the service (kept short, roles/text coerced).
  @IsOptional()
  @IsArray()
  history?: ChatTurn[];
}
