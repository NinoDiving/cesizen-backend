import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { 
  InvalidCredentialsException, 
  RegistrationFailedException,
  UserSuspendedException
} from './exceptions/auth.exceptions';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async authenticate(email: string, password: string) {
    const user = await this.userService.getUserByEmail(email).catch(() => null);

    if (!user) {
      throw new InvalidCredentialsException();
    }

    if (user.isSuspend) {
      throw new UserSuspendedException();
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new InvalidCredentialsException();
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    
    return {
      userId: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      accessToken: await this.jwtService.signAsync(payload),
    };
  }

  async register(createUserDto: CreateUserDto) {
    try {
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      const user = await this.userService.create({
        ...createUserDto,
        password: hashedPassword,
      });

      const payload = { sub: user.id, email: user.email, role: user.role };

      return {
        userId: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        accessToken: await this.jwtService.signAsync(payload),
      };
    } catch (error) {
      throw new RegistrationFailedException(error.message);
    }
  }
}
