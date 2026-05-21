import { useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ListEmptyState } from '@/components/shared/ListEmptyState';
import { useStudentTheoryMaterials } from '@/hooks/useTheoryMaterials';
import { theoryMaterialsApi } from '@/api/theoryMaterials.api';
import { useToast } from '@/providers/ToastProvider';
import { extractApiErrorMessage } from '@/lib/axios';
import { formatBytes } from '@/utils/formatBytes';
import { formatDate } from '@/utils/formatDate';
import { ROUTES } from '@/constants/routes';
import type { TheoryTopicMaterial } from '@/types/theoryMaterials.types';

interface TopicGroup {
  theoryTopicId: string;
  theoryTopicTitle: string;
  materials: TheoryTopicMaterial[];
}

interface LicenseGroup {
  licenseCategoryCode: string;
  topics: TopicGroup[];
}

export default function StudentStudyMaterials() {
  const toast = useToast();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const { data: materials = [], isLoading } = useStudentTheoryMaterials();

  const grouped = useMemo((): LicenseGroup[] => {
    const byLicense = new Map<string, Map<string, TopicGroup>>();

    for (const m of materials) {
      let topics = byLicense.get(m.licenseCategoryCode);
      if (!topics) {
        topics = new Map();
        byLicense.set(m.licenseCategoryCode, topics);
      }
      let topic = topics.get(m.theoryTopicId);
      if (!topic) {
        topic = {
          theoryTopicId: m.theoryTopicId,
          theoryTopicTitle: m.theoryTopicTitle,
          materials: [],
        };
        topics.set(m.theoryTopicId, topic);
      }
      topic.materials.push(m);
    }

    return [...byLicense.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([licenseCategoryCode, topicsMap]) => ({
        licenseCategoryCode,
        topics: [...topicsMap.values()].sort((a, b) =>
          a.theoryTopicTitle.localeCompare(b.theoryTopicTitle),
        ),
      }));
  }, [materials]);

  const handleDownload = async (material: TheoryTopicMaterial) => {
    setDownloadingId(material.id);
    try {
      await theoryMaterialsApi.download(material.id, material.originalFileName);
    } catch (error) {
      toast.error('Descarga fallida', extractApiErrorMessage(error));
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {isLoading ? (
        <p className="text-body-sm text-surface-500">Cargando materiales…</p>
      ) : grouped.length === 0 ? (
        <ListEmptyState
          title="Aún no hay materiales"
          description="Cuando tu instructor suba diapositivas o guías de clase teórica, aparecerán aquí si estás matriculado en esa licencia."
          action={
            <Link to={ROUTES.STUDENT.LICENSES}>
              <Button variant="secondary">Ver mis licencias</Button>
            </Link>
          }
        />
      ) : (
        grouped.map((license) => (
          <section key={license.licenseCategoryCode} className="flex flex-col gap-4">
            <h2 className="text-heading-sm font-semibold text-surface-900 dark:text-surface-50">
              Licencia {license.licenseCategoryCode}
            </h2>
            {license.topics.map((topic) => (
              <Card key={topic.theoryTopicId} className="flex flex-col gap-3 p-4 sm:p-5">
                <h3 className="font-medium text-surface-800 dark:text-surface-100">
                  {topic.theoryTopicTitle}
                </h3>
                <ul className="flex flex-col gap-2">
                  {topic.materials.map((m) => (
                    <li
                      key={m.id}
                      className="flex flex-col gap-2 rounded-lg border border-surface-200 bg-surface-50/80 p-3 dark:border-surface-800 dark:bg-surface-900/50 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-surface-900 dark:text-surface-50">{m.title}</p>
                        <p className="text-body-xs text-surface-500">
                          {m.instructorName} · {formatBytes(m.fileSizeBytes)} ·{' '}
                          {formatDate(m.createdAt)}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        iconLeft={<Download className="h-4 w-4" />}
                        isLoading={downloadingId === m.id}
                        onClick={() => void handleDownload(m)}
                      >
                        Descargar
                      </Button>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </section>
        ))
      )}
    </div>
  );
}
