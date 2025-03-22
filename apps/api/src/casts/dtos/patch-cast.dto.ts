import { PartialType } from '@nestjs/swagger';
import { CreateCastDTO } from './create-cast.dto';

export class PatchCastDTO extends PartialType(CreateCastDTO) {}
