export interface FtpUser {
  username: string;
  homeDir: string;
}

export interface UserEntity {
  username: string;
  passwordHash: string;
  homeDir: string;
}
