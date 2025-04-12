import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('webhooks')
export class WebhookEntity {
  @PrimaryColumn()
  id: string;

  @Column({ type: 'varchar', length: 255 })
  url: string;

  @Column({ type: 'varchar', length: 64 })
  secret: string;

  @Column({ type: 'simple-array' })
  events: string[];

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'int', default: 0, name: 'delivery_attempts' })
  deliveryAttempts: number;

  @Column({
    type: 'timestamp',
    nullable: true,
    name: 'last_successful_delivery',
  })
  lastSuccessfulDelivery: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'last_failed_delivery' })
  lastFailedDelivery: Date;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    name: 'last_error_message',
  })
  lastErrorMessage: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
