"use client";

import { useState } from "react";
import { useGetMyClassesQuery } from "@/app/hooks/classes/useGetMyClasses";
import { type MyClass } from "@/app/service/classroom.service";
import StudentSidebar from "./_components/student-sidebar";
import StudentClassView from "./_components/student-class-view";
import MentorReviewView from "./_components/mentor-review-view";

const navigationItems = ["Lớp học", "Nhận xét từ giảng viên"];

const dayLabels: Record<string, string> = {
  MONDAY: "Thứ 2",
  TUESDAY: "Thứ 3",
  WEDNESDAY: "Thứ 4",
  THURSDAY: "Thứ 5",
  FRIDAY: "Thứ 6",
  SATURDAY: "Thứ 7",
  SUNDAY: "Chủ nhật",
};

const studyModeLabels: Record<string, string> = {
  ONLINE: "Online",
  OFFLINE: "Offline",
  HYBRID: "Hybrid",
};

const formatDate = (value?: string) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

const formatTimeWithAmPm = (value?: string) => {
  if (!value) return "-";

  const [hoursStr = "00", minutes = "00"] = value.split(":");
  let hours = parseInt(hoursStr, 10);
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return `${hours}:${minutes} ${ampm}`;
};

const StudentDashboard = () => {
  const [activeMenu, setActiveMenu] = useState(navigationItems[0]);
  const [activeCourse, setActiveCourse] = useState<MyClass | null>(null);
  const { data: myClasses = [], isLoading } = useGetMyClassesQuery();

  const currentCourse = activeCourse ?? myClasses[0] ?? null;
  const currentSchedules = currentCourse?.schedules || [];

  return (
    <div className="min-h-screen bg-[#f4f6fb] text-slate-900">
      <div className="flex min-h-screen">
        <StudentSidebar
          items={navigationItems}
          activeItem={activeMenu}
          onChange={setActiveMenu}
        />

        <main className="flex-1 overflow-hidden">
          <div className="flex w-full flex-col gap-6 px-4 py-6 lg:px-8">
            <div className="w-full">
              {currentCourse ? (
               <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
    
    {/* Left */}
    <div className="min-w-0">
      <p className="text-sm font-medium text-slate-500">
        Lớp học
      </p>

      <h1 className="mt-1 truncate text-2xl font-semibold text-slate-900 md:text-3xl">
        {currentCourse.name}
      </h1>
    </div>

    {/* Right */}
    <div className="flex items-center gap-2 flex-wrap">
      <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
        <p className="text-xs text-slate-500">
          Trạng thái
        </p>
        <p className="text-sm font-medium text-slate-900">
          {currentCourse.status}
        </p>
      </div>

 
    </div>
  </div>
</div>
              ) : null}

              {activeMenu === "Lớp học" && (
                <StudentClassView
                  courses={myClasses}
                  isLoading={isLoading}
                  onCourseChange={setActiveCourse}
                />
              )}
              {activeMenu === "Nhận xét từ giảng viên" && <MentorReviewView />}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
