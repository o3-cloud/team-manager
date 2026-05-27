import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { UserEntity } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';

export interface AuthTokens {
  accessToken: string;
  user: { id: string; email: string; displayName: string };
}

@Injectable()
export class AuthService {
  // Pre-format dummy hash for timing-safe login — cost-10, never matches any real password
  private static readonly DUMMY_HASH =
    '$2b$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ01234';

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(email: string, displayName: string, password: string): Promise<AuthTokens> {
    const user = await this.usersService.create(email, displayName, password);
    return this.issueTokens(user);
  }

  async login(email: string, password: string): Promise<AuthTokens> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      await bcrypt.compare(password, AuthService.DUMMY_HASH);
      throw new UnauthorizedException('Invalid credentials');
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    return this.issueTokens(user);
  }

  private issueTokens(user: UserEntity): AuthTokens {
    const payload = { sub: user.id, email: user.email };
    return {
      accessToken: this.jwtService.sign(payload),
      user: { id: user.id, email: user.email, displayName: user.displayName },
    };
  }
}
