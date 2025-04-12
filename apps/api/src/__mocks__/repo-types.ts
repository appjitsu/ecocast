export enum AuthType {
  Bearer = 'Bearer',
  None = 'None',
}

export enum CastCategory {
  NEWS = 'NEWS',
  ENTERTAINMENT = 'ENTERTAINMENT',
  SPORTS = 'SPORTS',
  TECHNOLOGY = 'TECHNOLOGY',
  SCIENCE = 'SCIENCE',
  HEALTH = 'HEALTH',
  BUSINESS = 'BUSINESS',
  POLITICS = 'POLITICS',
  OTHER = 'OTHER',
}

export enum CastStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  SCHEDULED = 'SCHEDULED',
}

export enum CastVoice {
  JOHN = 'JOHN',
  MARY = 'MARY',
  DAVID = 'DAVID',
  SARAH = 'SARAH',
}

export interface ActiveUser {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
}

export const REQUEST_USER_KEY = 'user';

export interface RequestWithUser {
  headers: {
    authorization?: string;
    [key: string]: string | undefined;
  };
  [REQUEST_USER_KEY]?: ActiveUser;
  [key: string]: unknown;
}

export interface GoogleUser {
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
  accessToken: string;
}

export interface Paginated<T> {
  data: T[];
  meta: {
    itemCount: number;
    totalItems: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

export interface IGetCastsParamDTO {
  page?: number;
  limit?: number;
  search?: string;
  status?: CastStatus;
}

export interface IPatchCastDTO {
  title?: string;
  castCategory?: CastCategory;
  content?: string;
  voice?: CastVoice;
  status?: CastStatus;
  scheduledFor?: Date;
}

export interface IGetCastsBaseDto {
  page?: number;
  limit?: number;
  search?: string;
}

export interface IGetCastsDto extends IGetCastsBaseDto {
  status?: CastStatus;
}

export interface Cast {
  id: number;
  title: string;
  castCategory: CastCategory;
  slug: string;
  status: CastStatus;
  content?: string;
  voice: CastVoice;
  voiceOverUrl?: string;
  featuredImageUrl?: string;
  scheduledFor?: Date;
  publishedOn?: Date;
  owner: {
    id: number;
    email: string;
  };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface WebEnv {
  NEXT_PUBLIC_API_URL: string;
}
