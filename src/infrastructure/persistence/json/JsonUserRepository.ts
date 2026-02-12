import { IUserRepository } from '../../../core/interfaces/UserRepository.interface';
import { UserEntity } from '../../../core/domain/User.entity';
import { ILogger } from '../../../core/interfaces/Logger.interface';
import fs from 'fs/promises';

export class JsonUserRepository implements IUserRepository {
    constructor(private jsonPath: string, private logger: ILogger) {
    }

    async findUser(username: string): Promise<UserEntity | null> {
        this.logger?.debug?.(`Searching for user in JSON`, { username, path: this.jsonPath });
        
        try {
            // Check if file exists
            try {
                await fs.access(this.jsonPath);
            } catch {
                this.logger?.warn?.(`JSON user file not found`, { path: this.jsonPath });
                return null;
            }

            const data = await fs.readFile(this.jsonPath, 'utf-8');
            let users: UserEntity[];
            
            try {
                users = JSON.parse(data);
            } catch (e) {
                this.logger?.error?.(`Failed to parse JSON user file`, undefined, { path: this.jsonPath });
                return null;
            }

            if (!Array.isArray(users)) {
                this.logger?.error?.(`JSON user file root is not an array`, undefined, { path: this.jsonPath });
                return null;
            }

            const user = users.find(u => u.username === username);
            
            if (user) {
                return {
                    username: user.username,
                    passwordHash: user.passwordHash, // In JSON we store the hash (or plain text if using PlainHasher)
                    homeDir: user.homeDir
                };
            }

            return null;

        } catch (error: any) {
            this.logger?.error?.(`Error reading JSON user file`, error.message);
            return null;
        }
    }
}
