export const AUTH_API = {
  LOGIN: "/auth/login",
  CUSTOMER_REGISTER: "/auth/register"
};
export const CLASS_API = {
  CREATE_CLASS: "/class",
  GET_CLASSES: "/classes",
  GET_CLASS_DETAIL: (classId: string) => `/classes/${classId}`,
  UPDATE_CLASS: (classId: string) => `/classes/${classId}`,
  DELETE_CLASS: (classId: string) => `/classes/${classId}`,
  GET_MY_CLASSES: "/my-classes",
  ENROLL_CLASSROOM: "/enrolling-classroom",
};
export const MATERIALS_API = {
 CREATE_MATERIAL: (classroomId: string) => `/${classroomId}/materials`,  
  GET_MATERIALS: (classroomId: string) => `/${classroomId}/materials`,
  GET_MATERIAL_DETAIL: (materialId: string) => `/materials/${materialId}`,
  UPDATE_MATERIAL: (materialId: string) => `/materials/${materialId}`,
  DELETE_MATERIAL: (materialId: string) => `/materials/${materialId}`,
};  
export const Lesson_API = {
  CREATE_LESSON: "/lesson",
  GET_LESSONS: (materialId: string) => `/${materialId}/lessons`,
  GET_LESSON_DETAIL: (lessonId: string) => `/lessons/${lessonId}`,
  UPDATE_LESSON: (lessonId: string) => `/lessons/${lessonId}`,
  DELETE_LESSON: (lessonId: string) => `/lessons/${lessonId}`,
};

export const LessonResource_API = {
  CREATE: "/lessonResource",
  GET_BY_LESSON: (lessonId: string) => `/${lessonId}/lessonResources`,
};

export const Record_API = {
  CREATE: "/lessonVideo",
  GET_BY_LESSON: (lessonId: string) => `/${lessonId}/lessonVideos`,
};

export const SCHEDULE_API = {
  CREATE: (classroomId: string) => `/${classroomId}/schedules`,
};