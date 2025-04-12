import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthenticationGuard } from '../../auth/guards/authentication/authentication.guard';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { UpdateWebhookDto } from './dto/update-webhook.dto';
import { WebhookService } from './webhook.service';

@Controller('webhooks')
@ApiTags('Webhooks')
@ApiBearerAuth()
@UseGuards(AuthenticationGuard)
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Get()
  @ApiOperation({ summary: 'List all webhooks' })
  @ApiResponse({
    status: 200,
    description: 'List of webhooks',
  })
  async listWebhooks() {
    const webhooks = await this.webhookService.listWebhooks();
    return { webhooks };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get webhook by ID' })
  @ApiParam({ name: 'id', description: 'Webhook ID' })
  @ApiResponse({
    status: 200,
    description: 'Webhook details',
  })
  @ApiResponse({
    status: 404,
    description: 'Webhook not found',
  })
  async getWebhook(@Param('id') id: string) {
    const webhook = await this.webhookService.getWebhookById(id);
    return { webhook };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new webhook' })
  @ApiResponse({
    status: 201,
    description: 'Webhook created successfully',
  })
  async createWebhook(@Body() createWebhookDto: CreateWebhookDto) {
    const webhook = await this.webhookService.createWebhook(
      createWebhookDto.url,
      createWebhookDto.events,
      createWebhookDto.description,
    );
    return { webhook };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a webhook' })
  @ApiParam({ name: 'id', description: 'Webhook ID' })
  @ApiResponse({
    status: 200,
    description: 'Webhook updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Webhook not found',
  })
  async updateWebhook(
    @Param('id') id: string,
    @Body() updateWebhookDto: UpdateWebhookDto,
  ) {
    const webhook = await this.webhookService.updateWebhook(
      id,
      updateWebhookDto,
    );
    return { webhook };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a webhook' })
  @ApiParam({ name: 'id', description: 'Webhook ID' })
  @ApiResponse({
    status: 200,
    description: 'Webhook deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Webhook not found',
  })
  async deleteWebhook(@Param('id') id: string) {
    const success = await this.webhookService.deleteWebhook(id);
    return { success };
  }

  @Post(':id/regenerate-secret')
  @ApiOperation({ summary: 'Regenerate webhook secret' })
  @ApiParam({ name: 'id', description: 'Webhook ID' })
  @ApiResponse({
    status: 200,
    description: 'Secret regenerated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Webhook not found',
  })
  async regenerateSecret(@Param('id') id: string) {
    const secret = await this.webhookService.regenerateSecret(id);
    return { secret };
  }
}
