import './env';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    // The better auth library will re-add the default body parsers for non-auth routes.
    bodyParser: false,
  });
  app.enableCors();
  app.enableShutdownHooks();
  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();
