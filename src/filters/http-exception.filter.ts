import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ResponseUtil } from '../utils/response.util';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "Une erreur s'est produite";
    let details: unknown;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse) {
        const errorResponse = exceptionResponse as Record<string, unknown>;

        if (typeof errorResponse.message === 'string') {
          message = errorResponse.message;
        } else if (Array.isArray(errorResponse.message)) {
          message = 'Payload invalide';
          details = errorResponse.message;
        }
      }
    }

    if (statusCode === HttpStatus.UNAUTHORIZED) {
      message = "Vous n'avez pas l'autorisation d'acceder a cette ressource";
    }

    const errorBody = ResponseUtil.error(
      message,
      null,
      statusCode,
      undefined,
      details,
    );

    response.status(statusCode).json({
      ...errorBody,
      path: request.url,
    });
  }
}
