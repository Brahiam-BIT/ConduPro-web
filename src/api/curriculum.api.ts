import { api } from '@/lib/axios';
import type {
  LicenseCategory,
  TheoryTopic,
  TheoryTopicPayload,
  UpdateLicenseCategoryPayload,
} from '@/types/curriculum.types';

export const curriculumApi = {
  async listCategories(): Promise<LicenseCategory[]> {
    const { data } = await api.get<LicenseCategory[]>('/license-categories');
    return Array.isArray(data) ? data : [];
  },

  async updateCategory(id: string, payload: UpdateLicenseCategoryPayload): Promise<LicenseCategory> {
    const { data } = await api.patch<LicenseCategory>(`/license-categories/${id}`, payload);
    return data;
  },

  async listTopics(licenseCategoryId: string): Promise<TheoryTopic[]> {
    const { data } = await api.get<TheoryTopic[]>('/theory-topics', {
      params: { licenseCategoryId },
    });
    return Array.isArray(data) ? data : [];
  },

  async createTopic(payload: TheoryTopicPayload): Promise<TheoryTopic> {
    const { data } = await api.post<TheoryTopic>('/theory-topics', payload);
    return data;
  },

  async updateTopic(id: string, payload: Partial<TheoryTopicPayload>): Promise<TheoryTopic> {
    const { data } = await api.patch<TheoryTopic>(`/theory-topics/${id}`, payload);
    return data;
  },

  async removeTopic(id: string): Promise<void> {
    await api.delete(`/theory-topics/${id}`);
  },
};
