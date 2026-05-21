import { api } from '@/lib/axios';
import type { User } from '@/types/user.types';
import type { UserAvailabilitySlot } from '@/types/availability.types';
import type { PaginatedResponse } from '@/types/api.types';
import type { Role } from '@/constants/roles';

export interface UserListFilters {
  search?: string;
  role?: Role | 'ALL';
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface UserCreatePayload {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: Role;
  password?: string;
}

export interface UserUpdatePayload extends Partial<Omit<UserCreatePayload, 'password'>> {
  isActive?: boolean;
}

export const usersApi = {
  async list(filters: UserListFilters = {}): Promise<PaginatedResponse<User>> {
    const { data } = await api.get<PaginatedResponse<User>>('/users', { params: filters });
    return data;
  },
  async byId(id: string): Promise<User> {
    const { data } = await api.get<User>(`/users/${id}`);
    return data;
  },
  async create(payload: UserCreatePayload): Promise<User> {
    const { data } = await api.post<User>('/users', payload);
    return data;
  },
  async update(id: string, payload: UserUpdatePayload): Promise<User> {
    const { data } = await api.patch<User>(`/users/${id}`, payload);
    return data;
  },
  async toggleActive(id: string, isActive: boolean): Promise<User> {
    const { data } = await api.patch<User>(`/users/${id}`, { isActive });
    return data;
  },
  async availability(id: string): Promise<UserAvailabilitySlot[]> {
    const { data } = await api.get<UserAvailabilitySlot[]>(`/users/${id}/availability`);
    return data;
  },
  async setAvailability(id: string, slots: UserAvailabilitySlot[]): Promise<UserAvailabilitySlot[]> {
    const { data } = await api.put<UserAvailabilitySlot[]>(`/users/${id}/availability`, { slots });
    return data;
  },
};
