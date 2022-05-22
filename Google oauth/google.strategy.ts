import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

import { Injectable } from '@nestjs/common';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID:
        '145972135836-tdm7ku7tupina118juorssog65gmubju.apps.googleusercontent.com',
      clientSecret: 'hoN11ExEW_20ABUOFlV2QjY4',
      callbackURL: 'http://localhost:4000/v1/google/redirect',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, } = profile;

    console.log(
      '>>>>>>>>>>>>>>>>>>>>>>>Profile<<<<<<<<<<<<<<<<<<<<<<<<<<<',
      profile,
    );
    const user = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      accessToken,
    };
    done(null, user);
  }
}
