import { FtpSrv, FileSystem } from 'ftp-srv';
import { IAuthProvider } from './interfaces/AuthProvider.interface';
import { ILogger } from './interfaces/Logger.interface';
import { AppConfig } from '../config/config.interface';
import { BunyanLogAdapter } from '../infrastructure/logging/BunyanLogAdapter';
import fs from 'fs';

export class BetterFtpServer {
  private server: FtpSrv;
  private authProvider: IAuthProvider;
  private logger: ILogger;

  constructor(config: AppConfig, authProvider: IAuthProvider, logger: ILogger) {
    this.authProvider = authProvider;
    this.logger = logger;

    // Create adapter for ftp-srv
    const bunyanLogger = new BunyanLogAdapter(logger);

    // Prepare TLS (if enabled)
    let tlsOptions = undefined;
    if (config.tls.enabled && config.tls.keyPath && config.tls.certPath) {
      try {
        tlsOptions = {
          key: fs.readFileSync(config.tls.keyPath),
          cert: fs.readFileSync(config.tls.certPath),
        };
        this.logger.info('TLS/FTPS enabled and certificates loaded.');
      } catch (e: any) {
        this.logger.error('Error loading TLS certificates, server will run insecurely.', e.message);
      }
    }

    this.server = new FtpSrv({
      url: `ftp://0.0.0.0:${config.server.port}`,
      pasv_url: config.server.pasvUrl || '0.0.0.0', 
      pasv_min: config.server.pasvMin, 
      pasv_max: config.server.pasvMax,
      greeting: config.ftp.greeting,
      anonymous: config.ftp.enableAnonymous,
      tls: tlsOptions as any,
      timeout: config.server.timeout,
      log: bunyanLogger as any // Pass our adapter instead of the default (as any needed due to type mismatches)
    });

    this.setupEvents();
  }

  private setupEvents() {
    this.server.on('login', async ({ connection, username, password }, resolve, reject) => {
      this.logger.info(`Login attempt`, { username });

      const user = await this.authProvider.validateUser(username, password);

      if (user) {
        this.logger.info(`User logged in`, { username, root: user.homeDir });
        
        resolve({ root: user.homeDir }); 
      } else {
        this.logger.warn(`Invalid login`, { username });
        reject(new Error('Invalid username or password.'));
      }
    });

    this.server.on('client-error', ({ context, error }) => {
      this.logger.error(`Client error`, error.message);
    });
  }

  public async start() {
    await this.server.listen();
    this.logger.info(`BetterFTP is running!`);
  }
}
