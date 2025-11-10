import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { JwtPayload } from './strategies/jwt.strategy';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Validate user credentials
   */
  private getExpiresIn(key: string, fallback = '15m'): string {
  const val = this.configService.get<string>(key);
  if (!val) throw new Error(`${key} not configured`);
  return val;
}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);

    if (!user || !user.passwordHash) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return null;
    }

    // Don't return password hash
    const { passwordHash, ...result } = user;
    return result;
  }

  /**
   * Login user and generate tokens
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login timestamp
    await this.usersService.updateLastLogin(user.id);

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      username: user.username,
    };

    const accessToken = this.jwtService.sign(payload, {
  expiresIn: this.getExpiresIn('jwt.accessTokenExpiresIn') as any,
});

const refreshToken = this.jwtService.sign(payload, {
  expiresIn: this.getExpiresIn('jwt.refreshTokenExpiresIn') as any,
});

    return {
      accessToken,
      refreshToken,
      user: await this.usersService.findOne(user.id),
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken);

      const newPayload: JwtPayload = {
        sub: payload.sub,
        email: payload.email,
        username: payload.username,
      };

      const accessToken = this.jwtService.sign(newPayload, {
        expiresIn: this.configService.get<string>('jwt.accessTokenExpiresIn') as any,
      });

      return { accessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Verify access token
   */
  async verifyToken(token: string): Promise<JwtPayload> {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  /**
   * Get current user from JWT payload
   */
  async getCurrentUser(userId: string) {
    return this.usersService.findOne(userId);
  }
}