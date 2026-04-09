export interface FtpUser {
  username: string;
  homeDir: string;
  /** Per-user override: max bytes per single uploaded file (undefined = use global config) */
  maxFileSize?: number;
  /** Per-user override: max total bytes in the user's home directory (undefined = use global config) */
  maxTotalSize?: number;
}

export interface UserEntity {
  username: string;
  passwordHash: string;
  homeDir: string;
  /** Per-user override: max bytes per single uploaded file */
  maxFileSize?: number;
  /** Per-user override: max total bytes in the user's home directory */
  maxTotalSize?: number;
}
