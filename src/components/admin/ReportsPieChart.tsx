import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { SCHEDULE_TYPE_LABELS } from '@/constants/schedules';

interface ReportsPieChartProps {
  theoryCount: number;
  practiceCount: number;
  isLoading?: boolean;
}

const COLORS = ['#7C3AED', '#F59E0B'];

export function ReportsPieChart({ theoryCount, practiceCount, isLoading }: ReportsPieChartProps) {
  const data = [
    { name: SCHEDULE_TYPE_LABELS.THEORY, value: theoryCount },
    { name: SCHEDULE_TYPE_LABELS.PRACTICE, value: practiceCount },
  ].filter((d) => d.value > 0);

  if (isLoading) {
    return <Skeleton className="h-72 w-full rounded-xl" />;
  }

  return (
    <Card variant="elevated" padding="md">
      <h3 className="mb-4 text-heading-sm text-surface-900 dark:text-surface-50">
        Distribución por tipo
      </h3>
      {data.length === 0 ? (
        <p className="py-12 text-center text-body-sm text-surface-500">Sin datos en este período</p>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
