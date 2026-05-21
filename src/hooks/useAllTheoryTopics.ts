import { useQuery } from '@tanstack/react-query';
import { curriculumApi } from '@/api/curriculum.api';
import { curriculumKeys } from '@/hooks/useCurriculum';
export interface TheoryTopicOption {
  id: string;
  title: string;
  licenseCategoryId: string;
  licenseCode: string;
  label: string;
}

export function useAllTheoryTopics() {
  return useQuery({
    queryKey: [...curriculumKeys.all, 'all-topics'],
    queryFn: async (): Promise<TheoryTopicOption[]> => {
      const categories = (await curriculumApi.listCategories()).filter((c) => c.isActive);
      const groups = await Promise.all(
        categories.map(async (cat) => {
          const topics = await curriculumApi.listTopics(cat.id);
          return topics
            .filter((t) => t.isActive)
            .map(
              (t): TheoryTopicOption => ({
                id: t.id,
                title: t.title,
                licenseCategoryId: cat.id,
                licenseCode: cat.code,
                label: `${cat.code} — ${t.title}`,
              }),
            );
        }),
      );
      return groups.flat().sort((a, b) => a.label.localeCompare(b.label));
    },
    meta: { skipGlobalErrorHandler: true },
  });
}
