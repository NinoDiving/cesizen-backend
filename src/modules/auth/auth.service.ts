import { Injectable, UnauthorizedException } from '@nestjs/common';
import { supabase } from 'config/supabase';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private userService: UsersService) {}

  async authenticate(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const user = await this.userService.getUserByEmail(email);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      userId: data.user?.id,
      firstName: user.first_name,
      lastName: user.last_name,
      accessToken: data.session?.access_token,
      refreshToken: data.session?.refresh_token,
    };
  }

  async register(createUserDto: CreateUserDto) {
    const { data, error } = await supabase.auth.signUp({
      email: createUserDto.email,
      password: createUserDto.password,
      options: {
        data: {
          first_name: createUserDto.first_name,
          last_name: createUserDto.last_name,
        },
      },
    });

    if (error) {
      throw new UnauthorizedException('Registration failed', error.message);
    }
    return {
      userId: data.user?.id,
      firstName: createUserDto.first_name,
      lastName: createUserDto.last_name,
      accessToken: data.session?.access_token,
      refreshToken: data.session?.refresh_token,
    };
  }
}
