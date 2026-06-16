export type AuthUser = {
  id: number;
  email: string;
  name: string;
  companyId: number;
};

export type LoginResponse = {
  accessToken: string;
  user: AuthUser;
};
