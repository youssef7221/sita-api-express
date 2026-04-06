export class ApiResponse<T> {
  public status: string;
  public message: string;
  public data?: T;
  public timestamp: string;

  constructor(status: string, message: string, data?: T) {
    this.status = status;
    this.message = message;
    this.data = data;
    this.timestamp = new Date().toISOString();
  }

  static success<T>(message: string, data?: T) {
    return new ApiResponse("success", message, data);
  }

  static error(message: string) {
    return new ApiResponse("error", message);
  }
}