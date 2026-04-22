import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: true,
  });

  const port = process.env.PORT || 3010;

  await app.listen(Number(port), '0.0.0.0');
}

bootstrap().catch((err) => {
  console.error('Error starting server:', err);
});
