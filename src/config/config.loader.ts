import dotenv from 'dotenv';
import { AppConfig, DatabaseDriver, HashAlgorithm, LogLevel } from './config.interface';
dotenv.config();

export class ConfigLoader {
  static load(): AppConfig {
    return {
      server: {
        port: Number(process.env.PORT) || 2121,
        pasvMin: Number(process.env.PASV_MIN) || 7000,
        pasvMax: Number(process.env.PASV_MAX) || 7010,
        pasvUrl: process.env.PASV_URL, // If not set, ftp-srv uses smart detection
        maxConnections: Number(process.env.MAX_CONNECTIONS) || 100,
        timeout: Number(process.env.IDLE_TIMEOUT) || 30000,
      },
      ftp: {
        greeting: process.env.GREETING ? [process.env.GREETING] : ["Welcome to BetterFTP Server"],
        enableAnonymous: process.env.ENABLE_ANONYMOUS === 'true',
      },
      tls: {
        enabled: process.env.TLS_ENABLED === 'true',
        keyPath: process.env.TLS_KEY_PATH,
        certPath: process.env.TLS_CERT_PATH,
      },
      logging: {
        level: (process.env.LOG_LEVEL as LogLevel) || 'info',
      },
      auth: {
        driver: (process.env.AUTH_DRIVER as DatabaseDriver) || 'json',
        hashing: (process.env.AUTH_HASHING as HashAlgorithm) || 'bcrypt',
      },
      database: {
        connectionString: process.env.DB_CONNECTION || './dev.db',
        table: process.env.DB_TABLE || 'users',
        columns: {
          username: process.env.DB_COL_USER || 'username',
          password: process.env.DB_COL_PASS || 'password',
          homeDir: process.env.DB_COL_HOME || 'homeDir',
        },
      },
      jsonPath: process.env.JSON_PATH || './users.json',
    };
  }
}
