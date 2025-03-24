export enum CastCategory {
  NEWS = 'news',
  TECH = 'tech',
  BUSINESS = 'business',
  ENTERTAINMENT = 'entertainment',
  SPORTS = 'sports',
  SCIENCE = 'science',
  HEALTH = 'health',
  POLITICS = 'politics',
  LIFESTYLE = 'lifestyle',
  EDUCATION = 'education',
}

export enum CastStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  SCHEDULED = 'scheduled',
  PREVIEW = 'preview',
}

export enum CastVoice {
  JOHN = 'john',
  JANE = 'jane',
}

export interface Cast {
  id: string;
  title: string;
  slug: string;
  castCategory: CastCategory;
  status: CastStatus;
  content?: string;
  voice?: string;
  voiceOverUrl?: string;
  featuredImageUrl?: string;
  scheduledFor?: string;
  createdAt: string;
  updatedAt: string;
}

export const CAST_CATEGORIES = Object.values(CastCategory);
export const CAST_STATUSES = Object.values(CastStatus);
export const CAST_VOICES = Object.values(CastVoice);
