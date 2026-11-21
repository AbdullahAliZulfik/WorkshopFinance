import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Terjadi kesalahan pada server';
    let errors: string[] | undefined;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else if (res && typeof res === 'object') {
        const raw = (res as { message?: string | string[] }).message;
        if (Array.isArray(raw)) {
          message = 'Validasi gagal';
          errors = raw;
        } else if (raw) {
          message = raw;
        }
      }
    } else {
      this.logger.error(exception instanceof Error ? exception.stack : String(exception));
    }

    response.status(statusCode).json({
      success: false,
      statusCode,
      message,
      ...(errors ? { errors } : {}),
    });
  }
}
