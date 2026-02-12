import { IPasswordHasher } from '../../core/interfaces/PasswordHasher.interface';

export class PlainHasher implements IPasswordHasher {
  async verify(plain: string, hash: string): Promise<boolean> {
    return plain === hash;
  }
}
