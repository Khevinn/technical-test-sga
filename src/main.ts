import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const loggerService = app.get(Logger);

  const config = new DocumentBuilder()
    .setTitle('Technical Test API example')
    .setDescription('The Technical Test API description')
    .setVersion('1.0.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.PORT, () =>
    loggerService.log(
      `Application is running on http://localhost:${process.env.PORT}`,
      bootstrap.name,
    ),
  );
}
bootstrap();
