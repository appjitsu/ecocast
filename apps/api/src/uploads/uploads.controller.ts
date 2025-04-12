import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { createReadStream, existsSync } from 'fs';
import { join } from 'path';
import { AccessTokenGuard } from '../auth/guards/access-token/access-token.guard';
import { UploadsService } from './uploads.service';

@ApiTags('uploads')
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('file')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Upload a single file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const fileInfo = await this.uploadsService.saveFileInfo(file);
    return {
      fileId: fileInfo.id,
      filename: fileInfo.filename,
      url: `/uploads/${fileInfo.id}`,
    };
  }

  @Post('files')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Upload multiple files' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('files', 10)) // Max 10 files
  async uploadFiles(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    const uploadedFiles = await Promise.all(
      files.map(async (file) => {
        const fileInfo = await this.uploadsService.saveFileInfo(file);
        return {
          fileId: fileInfo.id,
          filename: fileInfo.filename,
          url: `/uploads/${fileInfo.id}`,
        };
      }),
    );

    return { files: uploadedFiles };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a file by ID' })
  async getFile(@Param('id') id: string, @Res() res: Response) {
    const fileInfo = await this.uploadsService.getFileInfoById(id);
    if (!fileInfo) {
      throw new BadRequestException('File not found');
    }

    const filePath = join(process.cwd(), 'uploads', fileInfo.storedFilename);
    if (!existsSync(filePath)) {
      throw new BadRequestException('File not found');
    }

    res.setHeader('Content-Type', fileInfo.mimeType);
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${fileInfo.filename}"`,
    );

    const fileStream = createReadStream(filePath);
    fileStream.pipe(res);
  }
}
