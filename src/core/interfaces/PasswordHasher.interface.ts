export interface IPasswordHasher {
  verify(plainText: string, hash: string): Promise<boolean>;
}
