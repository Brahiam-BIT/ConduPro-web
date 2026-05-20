import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { curriculumApi } from '@/api/curriculum.api';
import type {
  TheoryTopicPayload,
  UpdateLicenseCategoryPayload,
} from '@/types/curriculum.types';

export const curriculumKeys = {
  all: ['curriculum'] as const,
  categories: () => [...curriculumKeys.all, 'categories'] as const,
  topics: (categoryId: string) => [...curriculumKeys.all, 'topics', categoryId] as const,
};

export function useLicenseCategories() {
  return useQuery({
    queryKey: curriculumKeys.categories(),
    queryFn: () => curriculumApi.listCategories(),
    meta: { skipGlobalErrorHandler: true },
  });
}

export function useTheoryTopics(licenseCategoryId: string | null) {
  return useQuery({
    queryKey: curriculumKeys.topics(licenseCategoryId ?? ''),
    queryFn: () => curriculumApi.listTopics(licenseCategoryId!),
    enabled: !!licenseCategoryId,
    meta: { skipGlobalErrorHandler: true },
  });
}

export function useUpdateLicenseCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateLicenseCategoryPayload }) =>
      curriculumApi.updateCategory(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: curriculumKeys.all });
    },
  });
}

export function useCreateTheoryTopic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TheoryTopicPayload) => curriculumApi.createTopic(payload),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: curriculumKeys.topics(variables.licenseCategoryId) });
      void queryClient.invalidateQueries({ queryKey: curriculumKeys.categories() });
    },
  });
}

export function useUpdateTheoryTopic(categoryId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<TheoryTopicPayload> }) =>
      curriculumApi.updateTopic(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: curriculumKeys.topics(categoryId) });
      void queryClient.invalidateQueries({ queryKey: curriculumKeys.categories() });
    },
  });
}

export function useDeleteTheoryTopic(categoryId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => curriculumApi.removeTopic(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: curriculumKeys.topics(categoryId) });
      void queryClient.invalidateQueries({ queryKey: curriculumKeys.categories() });
    },
  });
}

export function useToggleTheoryTopicActive(categoryId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      curriculumApi.updateTopic(id, { isActive }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: curriculumKeys.topics(categoryId) });
      void queryClient.invalidateQueries({ queryKey: curriculumKeys.categories() });
    },
  });
}
