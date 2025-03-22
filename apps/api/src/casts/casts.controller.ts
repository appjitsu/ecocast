import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateCastDTO } from './dtos/create-cast.dto';
import { GetCastsDto } from './dtos/get-casts.dto';
import { PatchCastDTO } from './dtos/patch-cast.dto';
import { CastsService } from './providers/casts.service';
import { ActiveUser } from 'src/auth/decorators/active-user.decorator';

@Controller('casts')
@ApiTags('Casts')
export class CastsController {
  constructor(private readonly castsService: CastsService) {}

  @ApiOperation({
    summary: 'Get all casts for a user',
  })
  @ApiResponse({
    status: 200,
    description: 'List of casts',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
  })
  @Get('{/:userId}/')
  public getCasts(
    @Param('userId') userId: string,
    @Query() castQuery: GetCastsDto,
  ) {
    console.log('getCasts -> userId', userId);
    console.log('getCasts -> castQuery', castQuery);
    return this.castsService.findAll(userId, castQuery);
  }

  @ApiOperation({
    summary: 'Create a new cast',
  })
  @ApiResponse({
    status: 201,
    description: 'Cast created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
  })
  @Post()
  public createCast(@Body() body: CreateCastDTO, @ActiveUser() user) {
    console.log('createCast -> body', body);
    console.log('createCast -> user', user);
    return this.castsService.create(body, user);
  }

  @ApiOperation({
    summary: 'Update an existing cast',
  })
  @ApiResponse({
    status: 200,
    description: 'Cast updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
  })
  @Patch('/:castId/')
  public updateCast(
    @Param('castId') castId: number,
    @Body() body: PatchCastDTO,
  ) {
    console.log('updateCast -> body', body);
    return this.castsService.update(castId, body);
  }
}
