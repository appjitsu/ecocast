import { CastCategory, CastStatus, CastVoice } from '@repo/types';
import { slugify } from '@repo/utils';
import { DataSource } from 'typeorm';
import { Cast } from '../../casts/cast.entity';
import { User } from '../../users/user.entity';

function generateRandomDate(start: Date, end: Date) {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  );
}

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateRandomCast(user: User) {
  const categories = Object.values(CastCategory);
  const voices = Object.values(CastVoice);
  const statuses = Object.values(CastStatus);

  const category = getRandomElement(categories);
  const voice = getRandomElement(voices);
  const status = getRandomElement(statuses);
  const date = generateRandomDate(
    new Date('2024-01-01'),
    new Date('2024-03-20'),
  );

  const title = `${category} Update - ${date.toLocaleDateString()}`;

  return {
    title,
    castCategory: category,
    slug: slugify(title),
    status,
    content: `Sample content for ${category.toLowerCase()} update...`,
    voice,
    voiceOverUrl: `https://example.com/audio/${slugify(title)}.mp3`,
    featuredImageUrl: `https://example.com/images/${slugify(title)}.jpg`,
    publishedOn: date,
    owner: user,
  };
}

export async function seedCasts(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User);
  const castRepository = dataSource.getRepository(Cast);

  // Get all users
  const users = await userRepository.find();
  if (users.length === 0) {
    console.log('No users found to associate casts with');
    return;
  }

  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // Delete all existing casts
    await castRepository.delete({});
    console.log('Deleted all existing casts');

    // Create multiple random casts for each user
    for (const user of users) {
      // Generate 3-7 random casts per user
      const numCasts = Math.floor(Math.random() * 5) + 3;
      console.log(`Generating ${numCasts} casts for user ${user.email}`);

      for (let i = 0; i < numCasts; i++) {
        const castData = generateRandomCast(user);
        const cast = castRepository.create(castData);
        await castRepository.save(cast);
      }
    }

    await queryRunner.commitTransaction();
    console.log('Successfully seeded casts');
  } catch (err) {
    console.error('Error seeding casts:', err);
    await queryRunner.rollbackTransaction();
    throw err;
  } finally {
    await queryRunner.release();
  }
}
