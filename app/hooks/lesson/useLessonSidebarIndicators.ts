import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { LessonResourceService } from "@/app/service/lessonResource.service";

export type LessonContentIndicators = {
  hasMaterials: boolean;
  hasPreviewVideo: boolean;
  hasReplayVideo: boolean;
};

export function useLessonSidebarIndicators(lessonIds: string[]) {
  const stableKey = useMemo(
    () => Array.from(new Set(lessonIds.filter(Boolean))).sort().join(","),
    [lessonIds],
  );

  const stableIds = useMemo(
    () => (stableKey ? stableKey.split(",") : []),
    [stableKey],
  );

  const resourceQueries = useQueries({
    queries: stableIds.map((id) => ({
      queryKey: ["lessonResources", id],
      queryFn: () => LessonResourceService.getLessonResources(id),
      enabled: Boolean(id),
      staleTime: 30_000,
    })),
  });

  return useMemo(() => {
    const map: Record<string, LessonContentIndicators> = {};

    stableIds.forEach((id, index) => {
      const resources = resourceQueries[index]?.data ?? [];

      map[id] = {
        hasMaterials: resources.length > 0,
        hasPreviewVideo: false,
        hasReplayVideo: false,
      };
    });

    return map;
  }, [stableIds, resourceQueries]);
}

export function getSnapLessonIndicators(
  lessonVideos: { videoType?: string }[] = [],
  lessonResources: unknown[] = [],
): LessonContentIndicators {
  const hasTypedVideo = lessonVideos.some((video) => video.videoType);

  return {
    hasMaterials: lessonResources.length > 0,
    hasPreviewVideo: lessonVideos.some(
      (video) => video.videoType === "PREVIEW",
    ),
    hasReplayVideo:
      lessonVideos.some((video) => video.videoType === "AFTER_LESSON") ||
      (lessonVideos.length > 0 && !hasTypedVideo),
  };
}

export function mergeLessonIndicators(
  snap: LessonContentIndicators,
  remote?: LessonContentIndicators,
): LessonContentIndicators {
  if (!remote) return snap;

  return {
    hasMaterials: snap.hasMaterials || remote.hasMaterials,
    hasPreviewVideo: snap.hasPreviewVideo || remote.hasPreviewVideo,
    hasReplayVideo: snap.hasReplayVideo || remote.hasReplayVideo,
  };
}
