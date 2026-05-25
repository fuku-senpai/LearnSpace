import { RecordService } from "@/app/service/record.service";
import { useQuery } from "@tanstack/react-query";

export const useGetRecordsByLessonQuery = (lessonId?: string) =>
  useQuery({
    queryKey: ["records", lessonId],
    queryFn: () => RecordService.getRecordsByLesson(lessonId as string),
    enabled: Boolean(lessonId),
  });
