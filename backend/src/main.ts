import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import fastifyCookie from '@fastify/cookie';
import fastifyCors from '@fastify/cors';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  const registerPlugin = async (plugin: unknown, options?: unknown) => {
    const registrar = app as unknown as { register: (p: unknown, o?: unknown) => Promise<unknown> };
    return registrar.register(plugin, options);
  };

  // Cookies (JWT in httpOnly cookie)
  await registerPlugin(fastifyCookie, { secret: process.env.JWT_SECRET });

  // CORS (allow frontend and send cookies)
  await registerPlugin(fastifyCors, {
    origin: (process.env.CORS_ORIGIN ?? 'http://localhost:3000').split(',').map((s) => s.trim()),
    credentials: true,
  });


  // Global validation for DTOs (class-validator)
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Global exception filter for consistent error responses and logging
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen({ port: Number(process.env.PORT) || 3001, host: '0.0.0.0' });
}
bootstrap();