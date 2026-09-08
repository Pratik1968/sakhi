import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../auth/current-user.decorator';
import { EvidenceService } from './evidence.service';

function kindFromMime(mime: string): string {
  if (mime.startsWith('audio/')) return 'AUDIO';
  if (mime.startsWith('video/')) return 'VIDEO';
  if (mime.startsWith('image/')) return 'IMAGE';
  return 'IMAGE';
}

@UseGuards(JwtAuthGuard)
@Controller('evidence')
export class EvidenceController {
  constructor(private readonly evidence: EvidenceService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: process.env.UPLOADS_DIR || join(process.cwd(), 'uploads'),
        filename: (_req, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${unique}${extname(file.originalname) || ''}`);
        },
      }),
      limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
    }),
  )
  async upload(
    @CurrentUser() user: AuthUser,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { sosEventId?: string; incidentId?: string; kind?: string },
    @Req() req: Request,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');
    const base = `${req.protocol}://${req.get('host')}`;
    const url = `${base}/uploads/${file.filename}`;
    return this.evidence.create({
      userId: user.id,
      kind: body.kind || kindFromMime(file.mimetype),
      url,
      sosEventId: body.sosEventId,
      incidentId: body.incidentId,
    });
  }

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.evidence.list(user.id);
  }
}
