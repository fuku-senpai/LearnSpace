import { RecordService } from "@/app/service/record.service";
import { useQuery } from "@tanstack/react-query";

export const useGetRecordsByLessonQuery = (snapLessonId?: string) =>
  useQuery({
    queryKey: ["records", snapLessonId],
    queryFn: () => RecordService.getRecordsByLesson(snapLessonId as string),
    enabled: Boolean(snapLessonId),
  });
