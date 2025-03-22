import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export class GetCastsParamDTO {
  @IsOptional() // Mark this property as optional
  @IsInt() // This field must be an integer
  @Type(() => Number) // Transform the value to a number
  userId?: number; // Optional parameter for cast ID
}
