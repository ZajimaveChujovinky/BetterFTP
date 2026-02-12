import { IPasswordHasher } from '../../core/interfaces/PasswordHasher.interface';
import { BcryptHasher } from './BcryptHasher';
import { PlainHasher } from './PlainHasher';

export class HasherFactory {
  static create(algo: string): IPasswordHasher {
    switch (algo) {
      case 'bcrypt': return new BcryptHasher();
      case 'plain': return new PlainHasher();
      // Easily add 'argon2' or 'sha256' here
      default: throw new Error(`Unsupported hash algorithm: ${algo}`);
    }
  }
}
