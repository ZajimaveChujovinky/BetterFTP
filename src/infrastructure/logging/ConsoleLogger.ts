import { ILogger } from '../../core/interfaces/Logger.interface';
import chalk from 'chalk';
import { LogLevel } from '../../config/config.interface';

export class ConsoleLogger implements ILogger {
  private levels: Record<LogLevel, number> = {
    'debug': 0,
    'info': 1,
    'warn': 2,
    'error': 3
  };
  
  constructor(private minLevel: LogLevel = 'info') {}

  private shouldLog(level: LogLevel): boolean {
    return this.levels[level] >= this.levels[this.minLevel];
  }

  info(message: string, context?: any): void {
    if (!this.shouldLog('info')) return;
    const timestamp = new Date().toISOString();
    console.log(`${chalk.gray(timestamp)} ${chalk.blue('[INFO]')} ${message}`, context || '');
  }

  warn(message: string, context?: any): void {
    if (!this.shouldLog('warn')) return;
    const timestamp = new Date().toISOString();
    console.warn(`${chalk.gray(timestamp)} ${chalk.yellow('[WARN]')} ${message}`, context || '');
  }

  error(message: string, trace?: string, context?: any): void {
    if (!this.shouldLog('error')) return;
    const timestamp = new Date().toISOString();
    console.error(`${chalk.gray(timestamp)} ${chalk.red('[ERROR]')} ${message}`, trace ? chalk.red(trace) : '', context || '');
  }

  debug(message: string, context?: any): void {
    if (!this.shouldLog('debug')) return;
    const timestamp = new Date().toISOString();
    console.debug(`${chalk.gray(timestamp)} ${chalk.magenta('[DEBUG]')} ${chalk.gray(message)}`, context || '');
  }
}

