export interface AuthAccount {
  username: string;
  password: string;
  displayName: string;
}

export type AuthUser = Omit<AuthAccount, 'password'>;
