import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*', // Autoriser toutes les origines
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Autoriser les méthodes HTTP
    allowedHeaders: 'Content-Type, Accept, Authorization', // Autoriser les en-têtes spécifiques
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  // Configuration Swagger
  const config = new DocumentBuilder()
    .setTitle('Bizina API')
    .setDescription('Documentation des endpoints Bizina')
    .setVersion('1.0')
    .addBearerAuth() // si tu veux JWT auth
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document); // http://localhost:3000/api

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
