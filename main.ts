import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

console.log('>>>>ENVIRONMENT_VARIABLES>>>>>>', process.env);
//const whitelist = sys_config.whitelist_domains;
const whitelist = process.env.WHITELIST_DOMAIN;
const whitelistArr = whitelist.split(',');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableVersioning({
    type: VersioningType.URI,
  });

  app.enableCors({
    origin: function (origin, callback) {
      if (!origin || whitelistArr.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
  });
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.PORT);
}
bootstrap();
