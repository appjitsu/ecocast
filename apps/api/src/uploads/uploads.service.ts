import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventsService } from '../events/events.service';
import { File } from './file.entity';

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);

  constructor(
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
    private readonly eventsService: EventsService,
  ) {}

  /**
   * Save file information to the database
   */
  async saveFileInfo(file: Express.Multer.File): Promise<File> {
    const fileInfo = new File();
    fileInfo.filename = file.originalname;
    fileInfo.storedFilename = file.filename;
    fileInfo.mimeType = file.mimetype;
    fileInfo.size = file.size;
    fileInfo.path = file.path;

    const savedFile = await this.fileRepository.save(fileInfo);

    // Notify connected clients about the new file
    this.eventsService.broadcastEvent('file:created', {
      id: savedFile.id,
      filename: savedFile.filename,
      mimeType: savedFile.mimeType,
    });

    return savedFile;
  }

  /**
   * Get file information by ID
   */
  async getFileInfoById(id: string): Promise<File | null> {
    return this.fileRepository.findOne({ where: { id } });
  }

  /**
   * Delete file by ID
   */
  async deleteFile(id: string): Promise<boolean> {
    const result = await this.fileRepository.delete(id);

    if (result.affected && result.affected > 0) {
      // Notify connected clients about the deleted file
      this.eventsService.broadcastEvent('file:deleted', { id });
      return true;
    }

    return false;
  }

  /**
   * Get all files
   */
  async getAllFiles(): Promise<File[]> {
    return this.fileRepository.find();
  }
}
