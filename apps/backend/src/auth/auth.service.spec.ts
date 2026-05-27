import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findByEmail: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: { sign: jest.fn().mockReturnValue('mock-token') },
        },
      ],
    }).compile();

    authService = module.get(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  describe('register', () => {
    it('creates a user and returns tokens', async () => {
      const user = {
        id: 'uuid-1',
        email: 'coach@example.com',
        displayName: 'Coach Smith',
        passwordHash: 'hash',
        createdAt: new Date(),
      };
      usersService.create.mockResolvedValue(user);

      const result = await authService.register('coach@example.com', 'Coach Smith', 'password123');

      expect(result.accessToken).toBe('mock-token');
      expect(result.user.email).toBe('coach@example.com');
      expect(jwtService.sign).toHaveBeenCalledWith({ sub: 'uuid-1', email: 'coach@example.com' });
    });

    it('propagates ConflictException when email already registered', async () => {
      usersService.create.mockRejectedValue(new ConflictException('Email already registered'));

      await expect(
        authService.register('existing@example.com', 'User', 'password123'),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('returns tokens for valid credentials', async () => {
      const hash = await bcrypt.hash('password123', 1);
      const user = {
        id: 'uuid-2',
        email: 'player@example.com',
        displayName: 'Player One',
        passwordHash: hash,
        createdAt: new Date(),
      };
      usersService.findByEmail.mockResolvedValue(user);

      const result = await authService.login('player@example.com', 'password123');

      expect(result.accessToken).toBe('mock-token');
    });

    it('throws UnauthorizedException for unknown email', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(authService.login('unknown@example.com', 'pw')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException for wrong password', async () => {
      const hash = await bcrypt.hash('correct', 1);
      const user = {
        id: 'uuid-3',
        email: 'player@example.com',
        displayName: 'Player One',
        passwordHash: hash,
        createdAt: new Date(),
      };
      usersService.findByEmail.mockResolvedValue(user);

      await expect(authService.login('player@example.com', 'wrong')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
