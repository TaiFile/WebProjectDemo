import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersRepository } from '@features/users/repositories/users.repository';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const expiresIn = config.get<string>('JWT_EXPIRES_IN') || '24h';
        return {
          secret: config.get<string>('JWT_SECRET'),
          signOptions: {
            expiresIn: expiresIn as any,
          },
        };
      },
    }),
  ],
  providers: [AuthService, JwtStrategy, UsersRepository],
  controllers: [AuthController],
})
export class AuthModule {}
