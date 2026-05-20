import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { enrollmentsApi } from '@/api/enrollments.api';
import type { CreateEnrollmentPayload, EnrollmentProgress } from '@/types/enrollment.types';

export const enrollmentKeys = {
  all: ['enrollments'] as const,
  mine: () => [...enrollmentKeys.all, 'me'] as const,
  blockedCategories: () => [...enrollmentKeys.all, 'me', 'blocked-categories'] as const,
  admin: (studentId?: string) => [...enrollmentKeys.all, 'admin', studentId] as const,
};

export function useMyEnrollments() {
  return useQuery({
    queryKey: enrollmentKeys.mine(),
    queryFn: () => enrollmentsApi.listMine(),
    meta: { skipGlobalErrorHandler: true },
  });
}

export function useBlockedLicenseCategoryIds() {
  return useQuery({
    queryKey: enrollmentKeys.blockedCategories(),
    queryFn: () => enrollmentsApi.listBlockedLicenseCategoryIds(),
    meta: { skipGlobalErrorHandler: true },
  });
}

export function useEnrollMe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateEnrollmentPayload) => enrollmentsApi.enrollMe(payload),
    onSuccess: (enrollment) => {
      queryClient.setQueryData<EnrollmentProgress[]>(enrollmentKeys.mine(), (prev) => [
        ...(prev ?? []),
        enrollment,
      ]);
    },
  });
}

export function useCancelEnrollment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => enrollmentsApi.cancelMine(id),
    onSuccess: (_data, enrollmentId) => {
      queryClient.setQueryData<EnrollmentProgress[]>(enrollmentKeys.mine(), (prev) =>
        prev?.filter((e) => e.enrollmentId !== enrollmentId),
      );
    },
  });
}

export function useAdminStudentEnrollments(studentId: string | null) {
  return useQuery({
    queryKey: enrollmentKeys.admin(studentId ?? undefined),
    queryFn: () => enrollmentsApi.listAdmin(studentId!),
    enabled: !!studentId,
    meta: { skipGlobalErrorHandler: true },
  });
}

export function useAdminEnrollStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      studentId,
      licenseCategoryId,
    }: {
      studentId: string;
      licenseCategoryId: string;
    }) => enrollmentsApi.enrollAdmin(studentId, licenseCategoryId),
    onSuccess: (enrollment, { studentId }) => {
      queryClient.setQueryData<EnrollmentProgress[]>(
        enrollmentKeys.admin(studentId),
        (prev) => [...(prev ?? []), enrollment],
      );
    },
  });
}
