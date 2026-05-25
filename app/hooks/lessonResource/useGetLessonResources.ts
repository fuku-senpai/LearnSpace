import { LessonResourceService } from "@/app/service/lessonResource.service";
import { useQuery } from "@tanstack/react-query";

export const useGetLessonResourcesQuery = (lessonId: string) => {
  return useQuery({
    queryKey: ["lessonResources", lessonId],
    queryFn: () => LessonResourceService.getLessonResources(lessonId),
    enabled: !!lessonId,
  });
}