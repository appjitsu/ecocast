import { IntersectionType } from '@nestjs/swagger';
import { IGetCastsBaseDto, IGetCastsDto } from '@repo/types';
import { IsDate, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/pagination/dtos/pagination-query.dto';

class GetCastsBaseDto implements IGetCastsBaseDto {
  @IsDate()
  @IsOptional()
  startDate?: Date;

  @IsDate()
  @IsOptional()
  endDate?: Date;
}

export class GetCastsDto
  extends IntersectionType(GetCastsBaseDto, PaginationQueryDto)
  implements IGetCastsDto {}
