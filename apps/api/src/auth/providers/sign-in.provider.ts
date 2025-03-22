import {
  forwardRef,
  Inject,
  Injectable,
  RequestTimeoutException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/providers/users.service';
import { SignInDto } from '../dtos/signin.dto';
import { GenerateTokensProvider } from './generate-tokens.provider';
import { HashingProvider } from './hashing.provider';

@Injectable()
export class SignInProvider {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private readonly hashingProvider: HashingProvider,
    private readonly generateTokensProvider: GenerateTokensProvider,
  ) {}
  public async signIn(body: SignInDto) {
    const user = await this.usersService.findOneByEmail(body.email);

    if (!user?.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // compare the password
    let isMatch: boolean = false;

    try {
      isMatch = await this.hashingProvider.comparePassword(
        body.password,
        user.password,
      );
    } catch (error) {
      throw new RequestTimeoutException(error, {
        description: 'Could not compare the password',
      });
    }

    if (!isMatch) {
      throw new RequestTimeoutException('Incorrect password');
    }

    // generate tokens
    return await this.generateTokensProvider.generateTokens(user);
  }
}
