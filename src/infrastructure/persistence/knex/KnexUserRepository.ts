import knex, { Knex } from 'knex';
import { IUserRepository } from '../../../core/interfaces/UserRepository.interface';
import { UserEntity } from '../../../core/domain/User.entity';
import { AppConfig } from '../../../config/config.interface';
import { ILogger } from '../../../core/interfaces/Logger.interface';
import { debug } from 'util';

export class KnexUserRepository implements IUserRepository {
  private db: Knex;
  private config: AppConfig['database'];
  private logger: ILogger;

  constructor(dbConfig: AppConfig['database'], driver: 'mysql' | 'postgres' | 'sqlite', logger: ILogger) {
    this.config = dbConfig!;
    this.logger = logger;

    this.db = knex({
      client: this.mapDriverToKnex(driver),
      connection: dbConfig?.connectionString,
      useNullAsDefault: true, 
    });
  }

  private mapDriverToKnex(driver: string): string {
    const map: Record<string, string> = {
      'mysql': 'mysql2',
      'postgres': 'pg',
      'sqlite': 'sqlite3'
    };
    return map[driver] || driver;
  }

  async findUser(username: string): Promise<UserEntity | null> {
    const { table, columns } = this.config!;

    try {
      this.logger?.debug?.(`Searching for user in DB`, { username, table });
      const result = await this.db(table)
        .select({
          pass: columns.password,
          home: columns.homeDir
        })
        .where(columns.username, username)
        .first();

      // console.log('Database query result:', result);
      if (result) {
        this.logger?.debug?.(`User found in DB`, { username });
        return {
          username: username,
          passwordHash: result.pass,
          homeDir: result.home
        };
      }
      this.logger?.debug?.(`User not found in DB`, { username });
      return null;
    } catch (error) {
      if (error instanceof Error) {
        this.logger?.error(`Database error`, error.stack);
      } else {
        this.logger?.error(`Database error`, String(error));
      }
      return null;
    }
  }
}
