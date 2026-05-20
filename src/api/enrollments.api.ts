import { api } from '@/lib/axios';
import type { CreateEnrollmentPayload, EnrollmentProgress } from '@/types/enrollment.types';

export const enrollmentsApi = {
  async listMine(): Promise<EnrollmentProgress[]> {
    const { data } = await api.get<EnrollmentProgress[]>('/student-enrollments/me');
    return Array.isArray(data) ? data : [];
  },

  async listBlockedLicenseCategoryIds(): Promise<string[]> {
    const { data } = await api.get<string[]>(
      '/student-enrollments/me/blocked-license-categories',
    );
    return Array.isArray(data) ? data : [];
  },

  async enrollMe(payload: CreateEnrollmentPayload): Promise<EnrollmentProgress> {
    const { data } = await api.post<EnrollmentProgress>('/student-enrollments/me', payload);
    return data;
  },

  async getMine(id: string): Promise<EnrollmentProgress> {
    const { data } = await api.get<EnrollmentProgress>(`/student-enrollments/me/${id}`);
    return data;
  },

  async cancelMine(id: string): Promise<void> {
    await api.delete(`/student-enrollments/${id}`);
  },

  async listAdmin(studentId?: string): Promise<EnrollmentProgress[]> {
    const { data } = await api.get<EnrollmentProgress[]>('/student-enrollments', {
      params: studentId ? { studentId } : undefined,
    });
    return Array.isArray(data) ? data : [];
  },

  async enrollAdmin(studentId: string, licenseCategoryId: string): Promise<EnrollmentProgress> {
    const { data } = await api.post<EnrollmentProgress>('/student-enrollments', {
      studentId,
      licenseCategoryId,
    });
    return data;
  },
};
