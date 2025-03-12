export interface User {
  id: string;
  username: string;
  password: string;
  fullName: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export interface UserFormData {
  username: string;
  password: string;
  fullName: string;
  role: 'admin' | 'user';
} 