export interface LoginPayload {
  username: string;
  password: string;
}

export interface IntrospectPayload {
  token: string;
}

export interface RegisterPayload {
  username: string;
  mail: string;
  phoneNumber?: string;
  password: string;
}