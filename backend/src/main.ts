import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  process.on('SIGINT', () => {
    console.log('Close server...');
    process.exit();
  });

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
