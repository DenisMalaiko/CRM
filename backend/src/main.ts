import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableShutdownHooks();

  app.useStaticAssets(join(process.cwd(), 'public'));

  const closeApp = async (signal: string) => {
    console.log(`Received ${signal}. Closing...`);

    try {
      await app.close();
    } catch (err) {
      console.error('Error during shutdown', err);
    } finally {
      process.exit(0);
    }
  };

  process.on('SIGINT', closeApp);
  process.on('SIGTERM', closeApp);

  const settings = new DocumentBuilder()
    .setTitle('CRM API')
    .setDescription('CRM API description')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, settings);

  SwaggerModule.setup('docs', app, document);

  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.use(cookieParser());

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
