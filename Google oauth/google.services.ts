import { BadRequestException, Injectable, Inject } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class GoogleService {
  constructor(
    @Inject('DATABASE_CONNECTION') private db: Db,
    private authService: AuthService,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async googleLogin(req) {
    const res = {
      status: 400,
      msg: 'auth.NO_USER_FROM_GOOGLE', //"Unable to send OTP.",
      data: {},
    };

    if (!req.user) {
      return res;
    }

    //Check user exists
    let userRs;
    try {
      //TODO Check user active status
      userRs = await this.usersService.findUserByEmail(req.user.email);
      //User present in user collection
      if (userRs) {
        delete userRs.password;

        const payload = { email: userRs.email, id: userRs._id };
        const tokesRsp = await this.authService.login(payload);

        res.status = 200;
        res.msg = 'auth.SIGNED_IN_SUCCESS';
        const user = {
          ...tokesRsp,
        };
        res.data = {
          user: {
            ...user,
          },
        };
      } else {
        //create user
        const createAccDataset: CreateUserDto = {
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          email: req.user.email,
        };
        let result = null;
        try {
          result = await this.usersService.create(createAccDataset);
          const filter = {
            _id: result.insertedId,
          };
          const findRs = await this.usersService.findById(filter);

          if (result.acknowledged) {
            const payload = {
              email: findRs.email,
              id: findRs._id.toString(),
            };

            const tokesRsp = await this.authService.login(payload);
            const user = {
              ...tokesRsp,
            };
            res.data = {
              user: {
                ...user,
              },
            };
            res.status = 201;
            res.msg = 'auth.CREATE_ACCOUNT_SUCCESS';
          }
        } catch (e) {
          console.log('=======Errror here', e);
          throw new BadRequestException('Something went wrong');
        }
      }
    } catch (e) {
      console.log('Hate Error in nodejs>>>', e);
      throw new BadRequestException('Something went wrong');
    }

    return res;
  }
}
