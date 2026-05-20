import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import type { SchedulesByDayPoint } from '@/api/reports.api';

interface SchedulesLineChartProps {
  data: SchedulesByDayPoint[];
  isLoading?: boolean;
}

export function SchedulesLineChart({ data, isLoading }: SchedulesLineChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    label: format(parseISO(d.date), 'd MMM', { locale: es }),
  }));

  if (isLoading) {
    return <Skeleton className="h-72 w-full rounded-xl" />;
  }

  return (
    <Card variant="elevated" padding="md">
      <h3 className="mb-4 text-heading-sm text-surface-900 dark:text-surface-50">
        Clases agendadas vs completadas
      </h3>
      {chartData.length === 0 ? (
        <p className="py-12 text-center text-body-sm text-surface-500">Sin datos en este período</p>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-surface-200 dark:stroke-surface-800" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11 }}
              className="text-surface-500"
              tickLine={false}
            />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} tickLine={false} width={32} />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: '1px solid var(--tooltip-border, #e7e5e4)',
                fontSize: 13,
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="scheduled"
              name="Agendadas"
              stroke="#7C3AED"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="completed"
              name="Completadas"
              stroke="#10B981"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
