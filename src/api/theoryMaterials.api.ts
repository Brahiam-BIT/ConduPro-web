import { api } from '@/lib/axios';
import type {
  TheoryTopicMaterial,
  UploadTheoryMaterialPayload,
} from '@/types/theoryMaterials.types';

export const theoryMaterialsApi = {
  async listForInstructor(theoryTopicId?: string): Promise<TheoryTopicMaterial[]> {
    const { data } = await api.get<TheoryTopicMaterial[]>('/theory-materials/instructor', {
      params: theoryTopicId ? { theoryTopicId } : undefined,
    });
    return Array.isArray(data) ? data : [];
  },

  async listForStudent(): Promise<TheoryTopicMaterial[]> {
    const { data } = await api.get<TheoryTopicMaterial[]>('/theory-materials/me');
    return Array.isArray(data) ? data : [];
  },

  async upload(payload: UploadTheoryMaterialPayload): Promise<TheoryTopicMaterial> {
    const form = new FormData();
    form.append('file', payload.file);
    form.append('theoryTopicId', payload.theoryTopicId);
    if (payload.title?.trim()) form.append('title', payload.title.trim());
    if (payload.description?.trim()) form.append('description', payload.description.trim());

    const { data } = await api.post<TheoryTopicMaterial>('/theory-materials', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/theory-materials/${id}`);
  },

  async download(id: string, fallbackFileName: string): Promise<void> {
    const response = await api.get<Blob>(`/theory-materials/${id}/file`, {
      responseType: 'blob',
    });
    const blob = response.data;
    const disposition = response.headers['content-disposition'] as string | undefined;
    const fileName = parseContentDispositionFilename(disposition) ?? fallbackFileName;

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
  },
};

function parseContentDispositionFilename(header?: string): string | null {
  if (!header) return null;
  const utf8 = /filename\*=UTF-8''([^;]+)/i.exec(header);
  if (utf8?.[1]) {
    try {
      return decodeURIComponent(utf8[1].trim());
    } catch {
      return utf8[1].trim();
    }
  }
  const plain = /filename="([^"]+)"/i.exec(header);
  return plain?.[1]?.trim() ?? null;
}
