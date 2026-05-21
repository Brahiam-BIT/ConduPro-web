export interface TheoryTopicMaterial {
  id: string;
  theoryTopicId: string;
  theoryTopicTitle: string;
  licenseCategoryId: string;
  licenseCategoryCode: string;
  instructorId: string;
  instructorName: string;
  title: string;
  description: string | null;
  originalFileName: string;
  mimeType: string;
  fileSizeBytes: number;
  createdAt: string;
}

export interface UploadTheoryMaterialPayload {
  theoryTopicId: string;
  file: File;
  title?: string;
  description?: string;
}
