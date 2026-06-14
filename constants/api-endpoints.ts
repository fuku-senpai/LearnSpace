export const AUTH_API = {
  LOGIN: "/auth/login",
  CUSTOMER_REGISTER: "/auth/register",
  REFRESH_TOKEN: "/auth/refresh-token",
  LOGOUT: "/auth/logout",
  GET_ACCOUNTS: "/auth/accounts",
  ACCOUNT_BLOCK: (accountId: string) => `/auth/account/${accountId}/block`,
};

export const STUDENT_API = {
  PROFILE: "/student",
};
export const CLASS_API = {
  CREATE_CLASS: "/class",
  GET_CLASSES: "/classes",
  GET_CLASS_DETAIL: (classId: string) => `/classes/${classId}`,
  UPDATE_CLASS: (classId: string) => `/class/${classId}`,
  DELETE_CLASS: (classId: string) => `/class/${classId}`,
  GET_MY_CLASSES: "/my-classes",
  ENROLL_CLASSROOM: "/enrolling-classroom",
  ASSIGN_TEACHER: (classId: string) => `/class/${classId}/assign-teacher`,
  REMOVE_TEACHER: (classId: string) => `/class/${classId}/remove-teacher`,
  SNAP_MATERIALS: (classId: string) => `/class/${classId}/snap-materials`,
  GET_STUDENTS: (classroomId: string) => `/class/${classroomId}/students`,
};

export const MATERIALS_API = {
 CREATE_MATERIAL: (classroomId: string) => `/${classroomId}/materials`,  
  GET_MATERIALS: (classroomId: string) => `/${classroomId}/materials`,
  GET_MATERIAL_DETAIL: (materialId: string) => `/materials/${materialId}`,
  UPDATE_MATERIAL: (materialId: string) => `/materials/${materialId}`,
  DELETE_MATERIAL: (materialId: string) => `/materials/${materialId}`,
  GET_ALL_MATERIALS: "/materials",
  CREATE_NEW_MATERIAL: "/materials",
};  
export const Lesson_API = {
  CREATE_LESSON: "/lesson",
  GET_LESSONS: (materialId: string) => `/${materialId}/lessons`,
  GET_LESSON_DETAIL: (lessonId: string) => `/lessons/${lessonId}`,
  UPDATE_LESSON: (lessonId: string) => `/lesson/${lessonId}`,
  DELETE_LESSON: (lessonId: string) => `/lesson/${lessonId}`,
};

export const LessonResource_API = {
  CREATE: "/lessonResource",
  GET_BY_LESSON: (snapLessonId: string) => `/${snapLessonId}/lessonResources`,
};

export const Record_API = {
  CREATE: "/lessonVideo",
};

export const SCHEDULE_API = {
  CREATE: (classroomId: string) => `/${classroomId}/schedules`,
  UPDATE: (classroomId: string, scheduleId: string) =>
    `/${classroomId}/schedules/${scheduleId}`,
  DELETE: (classroomId: string, scheduleId: string) =>
    `/${classroomId}/schedules/${scheduleId}`,
};

export const CLASSROOM_MATERIAL_API = {
  UPDATE: (classroomMaterialId: string) =>
    `/classroomMaterial/${classroomMaterialId}`,
  DELETE: (classroomMaterialId: string) =>
    `/classroomMaterial/${classroomMaterialId}`,
};

export const SNAP_CLASSROOM_MATERIAL_API = {
  GET_BY_CLASSROOM: (classroomId: string) => `/${classroomId}/materials`,
  DELETE: (snapClassroomMaterialId: string) =>
    `/${snapClassroomMaterialId}/materials`,
  UPDATE_ORDER: (snapClassroomMaterialId: string) =>
    `/${snapClassroomMaterialId}/order`,
};

export const TEACHER_API = {
  GET_ALL: "/teachers",
  PROFILE: "/teacher",
  GET_CLASSROOMS: (teacherId: string) => `/teacher/${teacherId}/classrooms`,
  GET_MY_CLASSROOMS: "/teacher/classrooms",
  GET_SCHEDULE: (teacherId: string) => `/teachers/${teacherId}/schedule`,
};
export const VIDEO_API = {
  UPLOAD: "/videos/upload",
  PRESIGN: "/videos/presign",
  PLAY: (snapLessonId: string) => `/videos/play/${snapLessonId}`,
};