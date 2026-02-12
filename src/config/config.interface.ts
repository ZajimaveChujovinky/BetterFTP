export type DatabaseDriver = 'json' | 'mysql' | 'postgres' | 'sqlite';
export type HashAlgorithm = 'plain' | 'bcrypt' | 'argon2' | 'sha256';
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface AppConfig {
  server: {
    port: number;
    pasvMin: number;
    pasvMax: number;
    pasvUrl?: string; // Public IP for passive mode (required for Docker/NAT)
    maxConnections?: number;
    timeout?: number; // Idle timeout in ms
  };
  ftp: {
    greeting: string[];
    enableAnonymous: boolean;
  };
  tls: {
    enabled: boolean;
    keyPath?: string;
    certPath?: string;
  };
  logging: {
    level: LogLevel;
  };
  auth: {
    driver: DatabaseDriver; // 'json' or 'mysql', 'postgres'...
    hashing: HashAlgorithm; // 'bcrypt', 'plain'...
  };
  // Mapping for SQL databases
  database?: {
    connectionString: string; // E.g. "mysql://user:pass@localhost:3306/mydb"
    table: string;            // E.g. "users" or "app_accounts"
    columns: {
      username: string;       // E.g. "login" or "email"
      password: string;       // E.g. "password_hash"
      homeDir: string;        // E.g. "ftp_root"
    };
  };
  // Path for JSON driver
  jsonPath?: string;
}
