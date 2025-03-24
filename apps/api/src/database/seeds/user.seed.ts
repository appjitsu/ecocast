import { DataSource } from 'typeorm';
import { BcryptProvider } from '../../auth/providers/bcrypt.provider';
import { Cast } from '../../casts/cast.entity';
import { CreateUserDto } from '../../users/dtos/create-user.dto';
import { CreateUserProvider } from '../../users/providers/create-user.provider';
import { User } from '../../users/user.entity';

export async function seedUsers(dataSource: DataSource) {
  // First, delete all casts (which reference users)
  await dataSource.getRepository(Cast).delete({});
  console.log('Cleared all existing casts');

  // Then delete all users
  await dataSource.getRepository(User).delete({});
  console.log('Cleared all existing users');

  const createUserProvider = new CreateUserProvider(
    dataSource.getRepository(User),
    new BcryptProvider(),
  );

  const sampleUsers: CreateUserDto[] = [
    {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'Password123@',
    },
    {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      password: 'Password123@',
    },
    {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      password: 'Admin123@',
    },
  ];

  for (const userData of sampleUsers) {
    // Create new user with hashed password
    await createUserProvider.createUser(userData);
    console.log(`Created user: ${userData.email}`);
  }

  console.log('Successfully seeded users');
}
