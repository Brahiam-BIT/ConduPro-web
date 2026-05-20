import type { InstructorDashboardMetrics } from '@/utils/instructor';
import type { StudentDashboardMetrics } from '@/utils/schedule';

/** Valores seguros cuando la query del dashboard falla o aún no tiene datos. */
export const EMPTY_STUDENT_DASHBOARD: StudentDashboardMetrics = {
  nextClass: null,
  completedCount: 0,
  weekCount: 0,
  totalHours: 0,
  recentSchedules: [],
};

export const EMPTY_INSTRUCTOR_DASHBOARD: InstructorDashboardMetrics = {
  todayClasses: [],
  weekTotal: 0,
  weekHours: 0,
  monthTotal: 0,
  monthCompleted: 0,
  weekSchedules: [],
};
