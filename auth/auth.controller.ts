import {
  Controller,
  Get,
  Request,
  Post,
  Put,
  UseGuards,
  Res,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { I18nLang, I18nService } from 'nestjs-i18n';
import { ResponseService } from './../responses/responses.service';

@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: PinoLogger,
    private readonly i18n: I18nService,
    private readonly responses: ResponseService,
  ) {
    logger.setContext(AuthController.name);
  }

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async login(
    @Request() req,
    @Res({ passthrough: true }) res: Response,
    @I18nLang() lang: string,
  ) {
    const userLogin = await this.authService.login(req.user);
    const message = await this.i18n.translate('auth.LOGIN_SUCCESS', {
      lang: lang,
      args: {},
    });
    return this.responses.sendSuccessResp(res, message, { user: userLogin });
  }
}
