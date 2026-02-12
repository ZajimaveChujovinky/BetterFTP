import { BetterFtpServer } from './core/BetterFtpServer';
import { HasherFactory } from './infrastructure/security/HasherFactory';
import { JsonUserRepository } from './infrastructure/persistence/json/JsonUserRepository';
import { KnexUserRepository } from './infrastructure/persistence/knex/KnexUserRepository';
import { AuthService } from './core/services/AuthService';
import { ConsoleLogger } from './infrastructure/logging/ConsoleLogger';
import { ConfigLoader } from './config/config.loader';

// Load config from .env
const config = ConfigLoader.load();

async function main() {
  const logger = new ConsoleLogger(config.logging.level);
  logger.info('Starting BetterFTP server...');
  logger.debug('Configuration loaded', config);

  const hasher = HasherFactory.create(config.auth.hashing);

  let repository;
  if (['mysql', 'postgres', 'sqlite'].includes(config.auth.driver)) {
    repository = new KnexUserRepository(config.database!, config.auth.driver as 'mysql' | 'postgres' | 'sqlite', logger);
  } else {
    // Ensure jsonPath is set
    if (!config.jsonPath) {
        logger.error('JSON Path not explicitly defined, using default.');
    }
    repository = new JsonUserRepository(config.jsonPath!, logger); 
  }

  const authService = new AuthService(repository, hasher, logger);

  const server = new BetterFtpServer(config, authService, logger);
  await server.start();
}


main();
