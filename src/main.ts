import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express';
import helmet from 'helmet';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());

  const logger = new Logger('bootstrap');
  const configService = app.get(ConfigService);
  const environment = configService.get('NODE_ENV');
  const port = configService.get('PORT') || 3019;
  const cors = configService.get('CORS') === 'true';

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.setGlobalPrefix('api/v1');
  app.use(json({ limit: '5mb' }));
  app.use(urlencoded({ extended: true, limit: '5mb' }));

  if (environment === 'develop') {
    const config = new DocumentBuilder()
      .setTitle('API')
      .setDescription('Endpoints Home - API - Gateway')
      .addBearerAuth()
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/v1/docs', app, document, {
      swaggerOptions: {
        filter: true,
        persistAuthorization: true,
      },
    });
  }

  await app.listen(port, () => {
    logger.verbose(`CORS Enabled: ${cors}`);
    logger.verbose(`Server on port: ${port}`);
  });
}
bootstrap();
