import bcrypt from 'bcrypt';
import { IPasswordHasher } from '../../core/interfaces/PasswordHasher.interface';

export class BcryptHasher implements IPasswordHasher {
  async verify(plain: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(plain, hash);
  }
}
