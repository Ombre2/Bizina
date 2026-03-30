type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

type SuccessResponse<T> = {
  error: false;
  data: T;
  message: string;
  statusCode: number;
  meta?: PaginationMeta;
};

type ErrorResponse<T> = {
  error: true;
  data: T;
  message: string;
  statusCode: number;
  code?: string;
  details?: unknown;
  timestamp?: string;
};

export class ResponseUtil {
  /**
   * Format pour une réponse de succès
   * @param data le contenu renvoyé
   * @param message message à afficher
   * @param meta informations de pagination (facultatif)
   */
  static success<T>(
    data: T = {} as T,
    message: string = 'Opération réussie',
    meta?: PaginationMeta,
    statusCode: number = 200,
  ): SuccessResponse<T> {
    return {
      error: false,
      data,
      message,
      statusCode,
      // n’inclure meta que si on a passé un objet
      ...(meta && { meta }),
    };
  }

  /**
   * Format pour une réponse d'erreur
   */
  static error<T>(
    message: string = "Une erreur s'est produite",
    data: T = {} as T,
    statusCode: number = 500,
    code?: string,
    details?: unknown,
  ): ErrorResponse<T> {
    return {
      error: true,
      data,
      message,
      statusCode,
      ...(code && { code }),
      ...(details !== undefined && { details }),
      timestamp: new Date().toISOString(),
    };
  }
}
