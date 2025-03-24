import { PartialType } from '@nestjs/swagger';
import { IPatchCastDTO } from '@repo/types';
import { CreateCastDTO } from './create-cast.dto';

export class PatchCastDTO
  extends PartialType(CreateCastDTO)
  implements IPatchCastDTO {}
