import { Card } from '@/components/ui/Card';

interface QueryErrorBannerProps {
  message?: string;
}

export function QueryErrorBanner({
  message = 'No pudimos cargar estos datos. Intenta recargar la página.',
}: QueryErrorBannerProps) {
  return (
    <Card variant="elevated">
      <p className="text-body-sm text-error-600 dark:text-error-500">{message}</p>
    </Card>
  );
}
