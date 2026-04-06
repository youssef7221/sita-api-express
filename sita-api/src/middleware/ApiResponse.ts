export interface MetaData {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export class ApiResponse<T> {
  public data?: T;
  public meta?: MetaData;

  constructor(data?: T, meta?: MetaData) {
    this.data = data;
    this.meta = meta;
  }

  static success<T>(data?: T, meta?: MetaData) {
    return new ApiResponse(data, meta);
  }

  static error(message: string) {
    return { success: false, message };
  }
}