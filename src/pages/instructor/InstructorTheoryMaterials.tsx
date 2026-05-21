import { useMemo, useRef, useState } from 'react';
import { Download, FileUp, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ListEmptyState } from '@/components/shared/ListEmptyState';
import { useAllTheoryTopics } from '@/hooks/useAllTheoryTopics';
import {
  useDeleteTheoryMaterial,
  useInstructorTheoryMaterials,
  useUploadTheoryMaterial,
} from '@/hooks/useTheoryMaterials';
import { theoryMaterialsApi } from '@/api/theoryMaterials.api';
import { useToast } from '@/providers/ToastProvider';
import { extractApiErrorMessage } from '@/lib/axios';
import { formatBytes } from '@/utils/formatBytes';
import { formatDate } from '@/utils/formatDate';
import type { TheoryTopicMaterial } from '@/types/theoryMaterials.types';

const ACCEPT =
  '.pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,image/jpeg,image/png,image/webp';

export default function InstructorTheoryMaterials() {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [filterTopicId, setFilterTopicId] = useState('');
  const [uploadTopicId, setUploadTopicId] = useState('');
  const [title, setTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const { data: topicOptions = [], isLoading: topicsLoading } = useAllTheoryTopics();
  const filterId = filterTopicId || undefined;
  const { data: materials = [], isLoading: materialsLoading } = useInstructorTheoryMaterials(filterId);
  const uploadMutation = useUploadTheoryMaterial(filterId);
  const deleteMutation = useDeleteTheoryMaterial(filterId);

  const topicSelectOptions = useMemo(
    () => [
      { value: '', label: 'Todos los temas' },
      ...topicOptions.map((t) => ({ value: t.id, label: t.label })),
    ],
    [topicOptions],
  );

  const uploadTopicOptions = useMemo(
    () => [
      { value: '', label: 'Selecciona un tema…', disabled: true },
      ...topicOptions.map((t) => ({ value: t.id, label: t.label })),
    ],
    [topicOptions],
  );

  const handleUpload = async () => {
    if (!uploadTopicId) {
      toast.error('Tema requerido', 'Elige el tema teórico al que corresponde el material.');
      return;
    }
    if (!selectedFile) {
      toast.error('Archivo requerido', 'Selecciona un PDF, Word, PowerPoint o imagen (máx. 20 MB).');
      return;
    }
    try {
      await uploadMutation.mutateAsync({
        theoryTopicId: uploadTopicId,
        file: selectedFile,
        title: title.trim() || undefined,
      });
      toast.success('Material subido', 'Los estudiantes matriculados en esa licencia podrán descargarlo.');
      setTitle('');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      toast.error('No se pudo subir', extractApiErrorMessage(error));
    }
  };

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

  const handleDelete = async (material: TheoryTopicMaterial) => {
    if (!window.confirm(`¿Eliminar «${material.title}»? Los estudiantes ya no podrán descargarlo.`)) {
      return;
    }
    try {
      await deleteMutation.mutateAsync(material.id);
      toast.success('Material eliminado');
    } catch (error) {
      toast.error('Error', extractApiErrorMessage(error));
    }
  };

  const isLoading = topicsLoading || materialsLoading;

  return (
    <div className="flex flex-col gap-8">
      <Card className="flex flex-col gap-4 p-5 sm:p-6">
        <h2 className="text-heading-sm font-semibold text-surface-900 dark:text-surface-50">
          Subir material de clase teórica
        </h2>
        <p className="text-body-sm text-surface-600 dark:text-surface-400">
          Diapositivas, guías o PDF de apoyo. Solo lo verán estudiantes matriculados en la licencia del
          tema.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Tema teórico"
            options={uploadTopicOptions}
            value={uploadTopicId}
            onChange={(e) => setUploadTopicId(e.target.value)}
            disabled={topicsLoading}
          />
          <Input
            label="Título (opcional)"
            placeholder="Ej. Clase 3 — señales verticales"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-1.5 block text-body-sm font-medium text-surface-700 dark:text-surface-300">
              Archivo
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPT}
              className="block w-full text-body-sm text-surface-700 file:mr-3 file:rounded-lg file:border-0 file:bg-primary-50 file:px-3 file:py-2 file:text-body-sm file:font-medium file:text-primary-700 dark:text-surface-300 dark:file:bg-primary-950 dark:file:text-primary-300"
              onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
            />
            {selectedFile ? (
              <p className="mt-1 text-body-xs text-surface-500">
                {selectedFile.name} · {formatBytes(selectedFile.size)}
              </p>
            ) : null}
          </div>
          <Button
            iconLeft={<FileUp className="h-4 w-4" />}
            onClick={() => void handleUpload()}
            isLoading={uploadMutation.isPending}
            disabled={topicsLoading}
          >
            Subir
          </Button>
        </div>
      </Card>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="text-heading-sm font-semibold text-surface-900 dark:text-surface-50">
            Materiales publicados
          </h2>
          <Select
            label="Filtrar por tema"
            options={topicSelectOptions}
            value={filterTopicId}
            onChange={(e) => setFilterTopicId(e.target.value)}
            containerClassName="w-full sm:max-w-md"
          />
        </div>

        {isLoading ? (
          <p className="text-body-sm text-surface-500">Cargando…</p>
        ) : materials.length === 0 ? (
          <ListEmptyState
            title="Sin materiales"
            description="Sube el primer documento para que tus estudiantes lo descarguen después de la clase."
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {materials.map((m) => (
              <li key={m.id}>
                <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-surface-900 dark:text-surface-50">{m.title}</p>
                    <p className="text-body-sm text-surface-600 dark:text-surface-400">
                      {m.licenseCategoryCode} — {m.theoryTopicTitle}
                    </p>
                    <p className="text-body-xs text-surface-500">
                      {m.originalFileName} · {formatBytes(m.fileSizeBytes)} ·{' '}
                      {formatDate(m.createdAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      iconLeft={<Download className="h-4 w-4" />}
                      isLoading={downloadingId === m.id}
                      onClick={() => void handleDownload(m)}
                    >
                      Descargar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      iconLeft={<Trash2 className="h-4 w-4" />}
                      className="text-error-600 hover:text-error-700 dark:text-error-400"
                      isLoading={deleteMutation.isPending}
                      onClick={() => void handleDelete(m)}
                    >
                      Eliminar
                    </Button>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
