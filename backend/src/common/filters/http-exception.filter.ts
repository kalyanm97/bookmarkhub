import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    const req = ctx.getRequest();

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const response = exception instanceof HttpException ? exception.getResponse() : { message: String(exception) };

    // Log server errors with context
    if (status >= 500) {
      this.logger.error('Unhandled exception: ' + String(exception), { url: req.url, method: req.method, body: req.body });
    } else {
      this.logger.warn('Handled exception', JSON.stringify(response));
    }

    const payload = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: req.url,
  error: typeof response === 'string' ? response : (response as { message?: unknown }).message ?? response,
    };

    // Support both Express (res.status(...).json) and Fastify (reply.status(...).send)
    type ResLike = {
      status?: (code: number) => { json?: (p: unknown) => void; send?: (p: unknown) => void };
      send?: (p: unknown) => void;
      json?: (p: unknown) => void;
    };

    const r = res as unknown as ResLike;
    try {
      if (typeof r.status === 'function') {
        const candidate = r.status(status);
        if (candidate && typeof candidate.json === 'function') {
          candidate.json(payload);
        } else if (candidate && typeof candidate.send === 'function') {
          candidate.send(payload);
        } else if (typeof r.send === 'function') {
          r.send(payload);
        } else if (typeof r.json === 'function') {
          r.json(payload);
        }
      } else if (typeof r.send === 'function') {
        r.send(payload);
      } else if (typeof r.json === 'function') {
        r.json(payload);
      }
    } catch (err) {
      this.logger.error('Failed to send error response', String(err));
    }
  }
}