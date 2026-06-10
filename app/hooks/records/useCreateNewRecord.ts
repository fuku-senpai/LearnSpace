import { queryClient } from "@/app/lib/react-query";
import {
  CreateRecordPayload,
  CreateRecordResponse,
  RecordService,
} from "@/app/service/record.service";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
type ErrorResponse = {
  message?: string;
  data?: Record<string, string>;
};
export const useCreateNewRecord = () => {
  return useMutation<
    CreateRecordResponse,
    AxiosError<ErrorResponse>,
    CreateRecordPayload
  >({
    mutationKey: ["createRecord"],
    mutationFn: (payload) => RecordService.createRecord(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["records", variables.snapLessonId],
      });
    },
  });
};
