import { CastCategory, CastStatus, CastVoice } from '../cast';

export interface ICastForm {
  title: string;
  castCategory: CastCategory;
  slug: string;
  status: CastStatus;
  content?: string;
  voice?: CastVoice;
  voiceOverUrl?: string;
  featuredImageUrl?: string;
  scheduledFor?: string;
}

export interface ICreateCastDTO extends Omit<ICastForm, 'scheduledFor'> {
  scheduledFor?: Date;
  publishedOn?: Date;
}

export type IPatchCastDTO = Partial<ICreateCastDTO>;

export interface IGetCastsBaseDto {
  startDate?: Date;
  endDate?: Date;
}

export interface IPaginationQueryDto {
  page?: number;
  limit?: number;
}

export interface IGetCastsDto extends IGetCastsBaseDto, IPaginationQueryDto {}

export interface IGetCastsParamDTO {
  userId?: number;
}

// Re-export with aliases for backward compatibility
export type CreateCastForm = ICastForm;
export type CreateCastDTO = ICreateCastDTO;
export type PatchCastDTO = IPatchCastDTO;
export type GetCastsBaseDto = IGetCastsBaseDto;
export type PaginationQueryDto = IPaginationQueryDto;
export type GetCastsDto = IGetCastsDto;
export type GetCastsParamDTO = IGetCastsParamDTO;
