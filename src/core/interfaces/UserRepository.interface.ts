import { UserEntity } from '../domain/User.entity';

export interface IUserRepository {
  findUser(username: string): Promise<UserEntity | null>;
}
