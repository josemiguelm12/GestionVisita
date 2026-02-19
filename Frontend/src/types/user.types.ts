export interface Role {
  id: number;
  name: string;
  description?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  roles: Role[];
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  roleIds: number[];
}

export interface UpdateUserRequest {
  name: string;
  email: string;
  password?: string;
  roleIds: number[];
  isActive: boolean;
}

export interface UserApiResponse {
  data: User[];
}
