export class BadRequestError extends Error {
  constructor(message: string) {
    super(message);
  }
}
export class UserNotAuthenticated extends Error {
  constructor(message: string) {
    super(message);
  }
}
export class UserForbiddenError extends Error {
  constructor(message: string) {
    super(message);
  }
}
export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
  }
}
