import { Test, TestingModule } from '@nestjs/testing';
import { Cast } from '../casts/cast.entity';
import { CreateManyUsersDto } from './dtos/create-many-users.dto';
import { CreateUserDto } from './dtos/create-user.dto';
import { PatchUserDto } from './dtos/patch-user.dto';
import { UsersService } from './providers/users.service';
import { User } from './user.entity';
import { UsersController } from './users.controller';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;
  let getUsers: (id: number) => Promise<User>;
  let createUsers: (dto: CreateUserDto) => Promise<User>;
  let createManyUsers: (dto: CreateManyUsersDto) => Promise<User[]>;
  let patchUser: (dto: PatchUserDto) => PatchUserDto;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findOneById: jest.fn(),
            createUser: jest.fn(),
            createMany: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);

    // Bind controller methods
    getUsers = (id: number) => controller.getUsers(id);
    createUsers = (dto: CreateUserDto) => controller.createUsers(dto);
    createManyUsers = (dto: CreateManyUsersDto) =>
      controller.createManyUsers(dto);
    patchUser = (dto: PatchUserDto) => controller.patchUser(dto);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUsers', () => {
    it('should get a user by id', async () => {
      const userId = 1;
      const mockUser: User = {
        id: 1,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'hashedPassword',
        casts: [],
      };

      jest.spyOn(usersService, 'findOneById').mockResolvedValue(mockUser);

      const result = await getUsers(userId);

      expect(result).toEqual(mockUser);

      expect(usersService.findOneById).toHaveBeenCalledWith(userId);
    });
  });

  describe('createUsers', () => {
    it('should create a new user', async () => {
      const createUserDto: Required<CreateUserDto> = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      const mockUser: User = {
        id: 1,
        email: createUserDto.email,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        password: 'hashedPassword',
        casts: [] as Cast[],
      };

      const createUserSpy = jest
        .spyOn(usersService, 'createUser')
        .mockResolvedValue(mockUser);

      const result = await createUsers(createUserDto);

      expect(result).toEqual(mockUser);
      expect(createUserSpy).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('createManyUsers', () => {
    it('should create multiple users', async () => {
      const createManyUsersDto: CreateManyUsersDto = {
        users: [
          {
            email: 'test1@example.com',
            password: 'password123',
            firstName: 'Test1',
            lastName: 'User1',
          },
          {
            email: 'test2@example.com',
            password: 'password123',
            firstName: 'Test2',
            lastName: 'User2',
          },
        ],
      };

      const mockUsers: User[] = createManyUsersDto.users.map((user, index) => ({
        id: index + 1,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName!,
        password: 'hashedPassword',
        casts: [] as Cast[],
      }));

      const createManySpy = jest
        .spyOn(usersService, 'createMany')
        .mockResolvedValue(mockUsers);

      const result = await createManyUsers(createManyUsersDto);

      expect(result).toEqual(mockUsers);
      expect(createManySpy).toHaveBeenCalledWith(createManyUsersDto);
    });
  });

  describe('patchUser', () => {
    it('should patch a user', () => {
      const patchUserDto: PatchUserDto = {
        firstName: 'Updated',
        lastName: 'User',
      };

      const result = patchUser(patchUserDto);

      expect(result).toEqual(patchUserDto);
    });
  });
});
