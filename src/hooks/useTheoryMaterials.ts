import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { theoryMaterialsApi } from '@/api/theoryMaterials.api';
import type {
  TheoryTopicMaterial,
  UploadTheoryMaterialPayload,
} from '@/types/theoryMaterials.types';

export const theoryMaterialKeys = {
  all: ['theory-materials'] as const,
  instructor: (theoryTopicId?: string) =>
    [...theoryMaterialKeys.all, 'instructor', theoryTopicId ?? 'all'] as const,
  student: () => [...theoryMaterialKeys.all, 'me'] as const,
};

export function useInstructorTheoryMaterials(theoryTopicId?: string) {
  return useQuery({
    queryKey: theoryMaterialKeys.instructor(theoryTopicId),
    queryFn: () => theoryMaterialsApi.listForInstructor(theoryTopicId),
    meta: { skipGlobalErrorHandler: true },
  });
}

export function useStudentTheoryMaterials() {
  return useQuery({
    queryKey: theoryMaterialKeys.student(),
    queryFn: () => theoryMaterialsApi.listForStudent(),
    meta: { skipGlobalErrorHandler: true },
  });
}

function prependMaterial(
  queryClient: ReturnType<typeof useQueryClient>,
  cacheTopicId: string | undefined,
  created: TheoryTopicMaterial,
) {
  queryClient.setQueryData<TheoryTopicMaterial[]>(
    theoryMaterialKeys.instructor(cacheTopicId),
    (prev) => {
      const rest = (prev ?? []).filter((m) => m.id !== created.id);
      return [created, ...rest];
    },
  );
}

export function useUploadTheoryMaterial(filterTopicId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UploadTheoryMaterialPayload) => theoryMaterialsApi.upload(payload),
    onSuccess: (created) => {
      prependMaterial(queryClient, filterTopicId, created);
      if (filterTopicId !== undefined) {
        prependMaterial(queryClient, undefined, created);
      }
      if (
        created.theoryTopicId !== filterTopicId &&
        created.theoryTopicId !== undefined
      ) {
        prependMaterial(queryClient, created.theoryTopicId, created);
      }
      queryClient.invalidateQueries({ queryKey: theoryMaterialKeys.student() });
    },
  });
}

export function useDeleteTheoryMaterial(filterTopicId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => theoryMaterialsApi.remove(id),
    onSuccess: (_data, id) => {
      const removeFrom = (cacheTopicId?: string) => {
        queryClient.setQueryData<TheoryTopicMaterial[]>(
          theoryMaterialKeys.instructor(cacheTopicId),
          (prev) => prev?.filter((m) => m.id !== id),
        );
      };
      removeFrom(filterTopicId);
      if (filterTopicId !== undefined) {
        removeFrom(undefined);
      }
      queryClient.invalidateQueries({ queryKey: theoryMaterialKeys.student() });
    },
  });
}
