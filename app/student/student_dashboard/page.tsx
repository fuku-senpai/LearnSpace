"use client";

import { useState } from "react";
import StudentSidebar from "./_components/student-sidebar";
import StudentClassView from "./_components/student-class-view";

const StudentDashboard = () => {
  const [selectedKey, setSelectedKey] = useState("menu");

  const handleSidebarClick = (key: string) => {
    setSelectedKey(key);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900">
      <div className="flex min-h-screen">
        <StudentSidebar
          activeKey={selectedKey}
          onNavigate={handleSidebarClick}
        />

        <div className="flex min-w-0 flex-1">
          {selectedKey === "menu" ? <StudentClassView /> : null}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
