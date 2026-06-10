import { LessonResourceService } from "@/app/service/lessonResource.service";
import { useQuery } from "@tanstack/react-query";

export const useGetLessonResourcesQuery = (snapLessonId?: string) => {
  return useQuery({
    queryKey: ["lessonResources", snapLessonId],
    queryFn: () => LessonResourceService.getLessonResources(snapLessonId as string),
    enabled: Boolean(snapLessonId),
  });
};
