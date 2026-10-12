import './env';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    // The better auth library will re-add the default body parsers for non-auth routes.
    bodyParser: false,
  });
  app.enableCors({ origin: ['http://localhost:3000', 'http://localhost:4000'], credentials: true });
  app.enableShutdownHooks();
  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
