import '@fastify/cookie';
import 'fastify';

declare module 'fastify' {
  interface FastifyReply {
    clearCookie(name: string, options?: Record<string, unknown> | undefined): this;
  }
}