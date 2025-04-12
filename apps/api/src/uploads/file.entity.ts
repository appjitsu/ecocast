import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('files')
export class File {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Unique identifier for the file' })
  id: string;

  @Column()
  @ApiProperty({ description: 'Original filename' })
  filename: string;

  @Column()
  @ApiProperty({ description: 'Stored filename in the filesystem' })
  storedFilename: string;

  @Column()
  @ApiProperty({ description: 'File MIME type' })
  mimeType: string;

  @Column()
  @ApiProperty({ description: 'File size in bytes' })
  size: number;

  @Column({ nullable: true })
  @ApiProperty({ description: 'File path on the server', required: false })
  path: string;

  @CreateDateColumn()
  @ApiProperty({ description: 'Timestamp when the file was created' })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: 'Timestamp when the file was last updated' })
  updatedAt: Date;
}
