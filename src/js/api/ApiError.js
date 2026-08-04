/**
 * Error type for problems that come from a network request.
 *
 * The message is written for the user, while the original error is kept in
 * `cause` for the console.
 */
export class ApiError extends Error {
  /**
   * @param {string} message Message shown in the interface.
   * @param {unknown} [cause] The underlying error.
   */
  constructor(message, cause) {
    super(message);
    this.name = "ApiError";
    this.cause = cause;
  }
}
