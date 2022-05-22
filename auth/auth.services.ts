import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { PinoLogger } from 'nestjs-pino';
import { Db, MongoError, ObjectId } from 'mongodb';
var moment = require('moment');
const Handlebars = require('handlebars');
const bcrypt = require('bcrypt');

@Injectable()
export class AuthService {
  constructor(
    @Inject('DATABASE_CONNECTION') private db: Db,
    private usersService: UsersService,
    private jwtService: JwtService,
    private readonly logger: PinoLogger,
  ) {
    logger.setContext(AuthService.name);
  }

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findUserByEmail(username);
    if (user) {
      const resp = await bcrypt.compare(pass, user.password);
      if (resp) {
        return { email: username, id: user._id, password: user.password };
      } else {
        return 'Incorrect password. Try again.';
      }
    }
    return null;
  }

  async login(user: any) {
    //user.id is a objectId
    const payload = { email: user.email, id: user.id, password: user.password };
    const refreshToken = await this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_TOKEN_SECRET,
      expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRY,
    });
    const refreshTokenExpiry =
      Number(new Date()) + Number(process.env.JWT_REFRESH_TOKEN_EXPIRY) * 1000;

    await this.usersService.updateUserToken(user.id, {
      $set: {
        refreshToken: refreshToken,
        refreshTokenExpiry: refreshTokenExpiry,
      },
    });

    const accessToken = await this.jwtService.sign(payload);

    const userRs = await this.usersService.findUserByEmail(user.email);
    userRs.bikes = [];
    userRs.bikes = await this.usersService.getAssignedBikes(
      userRs._id.toString(),
    );

    delete userRs.password;
    return {
      ...userRs,
      accessToken,
      refreshToken,
    };
  }
}
