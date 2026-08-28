
export enum HttpStatus {
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500,
}

export class AppError extends Error {
  constructor(
    public status: HttpStatus,
    message: string,
  ) {
    super(message);
  }
}
