import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { createMultiStreamArray } from './logger/logger';
const multistream = require('pino-multi-stream').multistream;
import * as path from 'path';
import {
  I18nModule,
  I18nJsonParser,
} from 'nestjs-i18n';

const ENV = process.env.NODE_ENV;
@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'static'),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: !ENV ? '.env' : `.env.${ENV}`,
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      parser: I18nJsonParser,
      parserOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ['lang', 'locale', 'l'] },
        new HeaderResolver(['x-custom-lang']),
        AcceptLanguageResolver,
        new CookieResolver(['lang', 'locale', 'l']),
      ],
    }),
    ScheduleModule.forRoot(),
    LoggerModule.forRootAsync({
      useFactory: async () => {
        return {
          pinoHttp: {
            level: process.env.LOG_LEVEL,
            prettyPrint: process.env.NODE_ENV !== 'production',
            useLevelLabels: true,
            stream: multistream(createMultiStreamArray()),
          },
        };
      },
    }),
    UsersModule,
    ArchieveModule,
    TasksModule,
    AuthModule,
    ResponseModule,
    BikesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule { }
