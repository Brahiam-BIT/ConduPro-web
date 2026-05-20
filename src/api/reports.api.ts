import { api } from '@/lib/axios';

export interface ReportSummary {
  totalSchedules: number;
  completed: number;
  cancelled: number;
  attendanceRate: number;
  theoryCount: number;
  practiceCount: number;
}

export interface InstructorReport {
  instructorId: string;
  instructorName: string;
  totalClasses: number;
  totalHours: number;
  completionRate: number;
}

export interface SchedulesByDayPoint {
  date: string;
  scheduled: number;
  completed: number;
}

export interface DashboardKpis {
  activeUsers: number;
  monthSchedules: number;
  completionRate: number;
  activeVehicles: number;
}

export const reportsApi = {
  async kpis(): Promise<DashboardKpis> {
    const { data } = await api.get<DashboardKpis>('/reports/kpis');
    return data;
  },
  async schedulesByDay(params: { startDate: string; endDate: string }): Promise<SchedulesByDayPoint[]> {
    const { data } = await api.get<SchedulesByDayPoint[]>('/reports/schedules-by-day', { params });
    return data;
  },
  async summary(params: { startDate: string; endDate: string }): Promise<ReportSummary> {
    const { data } = await api.get<ReportSummary>('/reports/summary', { params });
    return data;
  },
  async byInstructor(params: { startDate: string; endDate: string }): Promise<InstructorReport[]> {
    const { data } = await api.get<InstructorReport[]>('/reports/by-instructor', { params });
    return data;
  },
  async exportUrl(params: { startDate: string; endDate: string }): Promise<Blob> {
    const { data } = await api.get<Blob>('/reports/export', {
      params,
      responseType: 'blob',
    });
    return data;
  },
};
