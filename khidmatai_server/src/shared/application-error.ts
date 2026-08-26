export class ApplicationError extends Error {
  constructor(
    public readonly httpStatusCode: number,
    public readonly publicErrorCode: string,
    public readonly publicMessage: string,
    public readonly validationDetails?: unknown,
  ) {
    super(publicMessage);
  }
}
