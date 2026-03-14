import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';
import { ResponseUtil } from '../utils/response.util';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Une erreur est survenue';
    let details: unknown;

    if (exception instanceof QueryFailedError) {
      const driverError = (
        exception as QueryFailedError & {
          driverError?: { errno?: number; message?: string };
        }
      ).driverError;

      const errno = driverError?.errno;
      const dbMessage = driverError?.message ?? '';

      if (errno === 1062) {
        // "Duplicate entry 'some_value' for key 'table.IDX_...'"
        const match = dbMessage.match(/Duplicate entry '([^']+)'/);
        const value = match ? match[1] : null;
        statusCode = HttpStatus.CONFLICT;
        message = value
          ? `La valeur '${value}' est déjà utilisée`
          : 'Cette information existe déjà';
      } else if (errno === 1048) {
        // "Column 'column_name' cannot be null"
        const match = dbMessage.match(
          /Column ['"` ]([^'"` ]+)['"` ] cannot be null/,
        );
        const field = match ? match[1] : null;
        statusCode = HttpStatus.BAD_REQUEST;
        message = field
          ? `Le champ '${field}' est obligatoire`
          : 'Un champ obligatoire manque';
      } else if (errno === 1406) {
        // "Data too long for column 'column_name' at row 1"
        const match = dbMessage.match(/for column ['"`]([^'"`]+)['"`]/);
        const field = match ? match[1] : null;
        statusCode = HttpStatus.BAD_REQUEST;
        message = field
          ? `Le champ '${field}' est trop long`
          : 'Une valeur est trop longue';
      } else if (errno === 1451) {
        statusCode = HttpStatus.CONFLICT;
        message =
          'Impossible de supprimer cet élément car il est encore utilisé';
      } else if (errno === 1452) {
        statusCode = HttpStatus.UNPROCESSABLE_ENTITY;
        message = "L'élément lié est introuvable";
      } else {
        this.logger.error(`Unhandled MySQL errno ${errno}: ${dbMessage}`);
      }
    } else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();

      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse) {
        const errorResponse = exceptionResponse as Record<string, unknown>;

        if (typeof errorResponse.message === 'string') {
          message = errorResponse.message;
        } else if (Array.isArray(errorResponse.message)) {
          message = 'Les informations envoyées ne sont pas valides';
          details = errorResponse.message;
        }
      }
    }

    if (statusCode === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        'Unhandled exception',
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    if (statusCode === HttpStatus.UNAUTHORIZED) {
      message = "Vous n'avez pas l'autorisation d'accéder à cette ressource";
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
