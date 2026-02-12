import { ILogger } from '../../core/interfaces/Logger.interface';
import { LogLevel } from '../../config/config.interface';

/**
 * Adapter that allows using our ILogger where a Bunyan logger is expected.
 * ftp-srv uses methods: trace, debug, info, warn, error, fatal.
 * Bunyan often calls log.info({ object }, "message") or log.info("message").
 */
export class BunyanLogAdapter {
  constructor(private logger: ILogger) {}

  trace(arg1: any, arg2?: any): void {
      this.forward('debug', arg1, arg2);
  }

  debug(arg1: any, arg2?: any): void {
    this.forward('debug', arg1, arg2);
  }

  info(arg1: any, arg2?: any): void {
    this.forward('info', arg1, arg2);
  }

  warn(arg1: any, arg2?: any): void {
    this.forward('warn', arg1, arg2);
  }

  error(arg1: any, arg2?: any): void {
    this.forward('error', arg1, arg2);
  }

  fatal(arg1: any, arg2?: any): void {
    this.forward('error', arg1, arg2);
  }

  child(options?: any): BunyanLogAdapter {
    // Bunyan often creates child loggers for context (e.g., for each connection).
    // We can either return 'this' and ignore context, 
    // or (if we wanted to be very precise) create a new adapter with context.
    // For simplicity and cleaner output, we return 'this' for now.
    return this;
  }

  private forward(level: LogLevel, arg1: any, arg2: any) {
    let message = '';
    let context: string | object = {};

    if (typeof arg1 === 'string') {
      message = arg1;
      if (arg2) context = arg2;
    } else if (typeof arg1 === 'object') {
      context = arg1;
      if (typeof arg2 === 'string') {
        message = arg2;
      }
    }

    // Call our logger
    // TypeScript check for method existence (debug is optional in interface)
    if (level === 'error') {
        this.logger.error(message, "", context);
    } else if(this.logger[level]) {
        this.logger[level](message, context);
    }
  }
}
