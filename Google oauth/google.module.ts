import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtStrategy } from 'src/auth/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';

import { GoogleController } from './google.controller';
import { ResponseService } from 'src/responses/responses.service';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from './google.strategy';
import { GoogleService } from './google.service';
import { UsersModule } from 'src/users/users.module';
import { AuthService } from 'src/auth/auth.service';

@Module({
  controllers: [GoogleController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_TOKEN_EXPIRY },
    }),
  ],
  providers: [
    ResponseService,
    GoogleStrategy,
    GoogleService,
    JwtStrategy,
    AuthService,
  ],
  exports: [],
})
export class GoogleModule {}
