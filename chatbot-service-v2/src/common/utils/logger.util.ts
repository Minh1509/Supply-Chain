export class Logger {
  private static isProduction = process.env.NODE_ENV === 'production';
  private static enableLogging = process.env.ENABLE_LOGGING !== 'false';

  static log(message: string, context?: string) {
    if (!this.isProduction || this.enableLogging) {
      console.log(context ? `[${context}] ${message}` : message);
    }
  }

  static error(message: string, trace?: string, context?: string) {
    console.error(context ? `[${context}] ${message}` : message, trace || '');
  }

  static warn(message: string, context?: string) {
    if (!this.isProduction || this.enableLogging) {
      console.warn(context ? `[${context}] ${message}` : message);
    }
  }

  static debug(message: string, context?: string) {
    if (!this.isProduction) {
      console.debug(context ? `[${context}] ${message}` : message);
    }
  }
}
