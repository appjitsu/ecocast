import { registerAs } from '@nestjs/config';

export default registerAs('profileConfig', () => ({
  apiKey: process.env.API_KEY,
}));
