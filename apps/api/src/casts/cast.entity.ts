import { User } from 'src/users/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { castCategory } from './enums/castCategory.enum';
import { castStatus } from './enums/castStatus.enum';
import { castVoice } from './enums/castVoice.enum';

@Entity()
export class Cast {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 512,
    nullable: false,
  })
  title: string;

  @Column({
    type: 'enum',
    enum: castCategory,
    default: castCategory.NEWS,
    nullable: false,
  })
  castCategory: castCategory;

  @Column({
    type: 'varchar',
    length: 256,
    nullable: false,
    unique: true,
  })
  slug: string;

  @Column({
    type: 'enum',
    enum: castStatus,
    default: castStatus.DRAFT,
    nullable: false,
  })
  status: castStatus;

  @Column({
    type: 'text',
    nullable: true,
  })
  content?: string;

  @Column({
    type: 'enum',
    enum: castVoice,
    default: castVoice.JOHN,
  })
  voice?: string;

  @Column({
    type: 'varchar',
    length: 1024,
    nullable: true,
  })
  voiceOverUrl?: string;

  @Column({
    type: 'varchar',
    length: 1024,
    nullable: true,
  })
  featuredImageUrl?: string;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  scheduledFor?: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  publishedOn?: Date;

  @ManyToOne(() => User, (user) => user.casts, {
    eager: true,
  })
  owner: User;
}
