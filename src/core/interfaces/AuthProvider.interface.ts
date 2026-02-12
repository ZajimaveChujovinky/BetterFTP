import { FtpUser } from '../domain/User.entity';

export interface IAuthProvider {
  validateUser(username: string, password: string): Promise<FtpUser | null>;
}
