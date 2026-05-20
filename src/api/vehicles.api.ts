import { api } from '@/lib/axios';
import type { Vehicle, VehiclePayload } from '@/types/vehicle.types';
import type { PaginatedResponse } from '@/types/api.types';

export const vehiclesApi = {
  async list(params: { page?: number; limit?: number } = {}): Promise<PaginatedResponse<Vehicle>> {
    const { data } = await api.get<PaginatedResponse<Vehicle>>('/vehicles', { params });
    return data;
  },
  async byId(id: string): Promise<Vehicle> {
    const { data } = await api.get<Vehicle>(`/vehicles/${id}`);
    return data;
  },
  async create(payload: VehiclePayload): Promise<Vehicle> {
    const { data } = await api.post<Vehicle>('/vehicles', payload);
    return data;
  },
  async update(id: string, payload: Partial<VehiclePayload>): Promise<Vehicle> {
    const { data } = await api.patch<Vehicle>(`/vehicles/${id}`, payload);
    return data;
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/vehicles/${id}`);
  },
};
