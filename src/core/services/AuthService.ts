import { IUserRepository } from '../interfaces/UserRepository.interface';
import { IPasswordHasher } from '../interfaces/PasswordHasher.interface';
import { FtpUser } from '../domain/User.entity';
import { IAuthProvider } from '../interfaces/AuthProvider.interface';
import { ILogger } from '../interfaces/Logger.interface';

export class AuthService implements IAuthProvider {
  constructor(
    private repo: IUserRepository,
    private hasher: IPasswordHasher,
    private logger: ILogger
  ) {}

  async validateUser(username: string, passwordInput: string): Promise<FtpUser | null> {
    this.logger?.debug?.(`Validating user`, { username });
    // 1. Find user (from anywhere - JSON, SQL...)
    const user = await this.repo.findUser(username);
    
    if (!user) {
        this.logger?.debug?.(`User not found in repository`, { username });
        return null;
    }

    const isValid = await this.hasher.verify(passwordInput, user.passwordHash);

    if (isValid) {
      this.logger?.debug?.(`Password valid`, { username });
      return { username: user.username, homeDir: user.homeDir }; // Returning root directory
    }
    
    this.logger?.debug?.(`Password invalid`, { username });
    return null;
  }
}
