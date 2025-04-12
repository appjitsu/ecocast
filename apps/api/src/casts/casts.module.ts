import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaginationModule } from '../common/pagination/pagination.module';
import { WebhookModule } from '../common/webhooks/webhook.module';
import { UsersModule } from '../users/users.module';
import { Cast } from './cast.entity';
import { CastsController } from './casts.controller';
import { CastsService } from './providers/casts.service';
import { CreateCastProvider } from './providers/create-cast.provider';

@Module({
  controllers: [CastsController],
  providers: [CastsService, CreateCastProvider],
  imports: [
    UsersModule,
    PaginationModule,
    TypeOrmModule.forFeature([Cast]),
    WebhookModule,
  ],
})
export class CastsModule {}
