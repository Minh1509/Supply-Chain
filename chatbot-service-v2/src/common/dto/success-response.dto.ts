export class SuccessResponseDto<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  timestamp: Date;

  constructor(data?: T, message?: string) {
    this.success = true;
    this.data = data;
    this.message = message;
    this.timestamp = new Date();
  }
}

export class ErrorResponseDto {
  success: boolean;
  error: string;
  message: string;
  timestamp: Date;

  constructor(error: string, message?: string) {
    this.success = false;
    this.error = error;
    this.message = message || error;
    this.timestamp = new Date();
  }
}
