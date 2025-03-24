import { CastCategory, CastStatus, CastVoice } from '@repo/types';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../users/user.entity';

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
    enum: CastCategory,
    enumName: 'cast_category_enum',
    default: CastCategory.NEWS,
    nullable: false,
    transformer: {
      to: (value: CastCategory) => value.toLowerCase(),
      from: (value: string) => value as CastCategory,
    },
  })
  castCategory: CastCategory;

  @Column({
    type: 'varchar',
    length: 256,
    nullable: false,
    unique: true,
  })
  slug: string;

  @Column({
    type: 'enum',
    enum: CastStatus,
    default: CastStatus.DRAFT,
    nullable: false,
  })
  status: CastStatus;

  @Column({
    type: 'text',
    nullable: true,
  })
  content?: string;

  @Column({
    type: 'enum',
    enum: CastVoice,
    default: CastVoice.JOHN,
  })
  voice: CastVoice;

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
