import {
  CalendarClock,
  Clock3,
  CreditCard,
  LayoutDashboard,
  Map,
  TentTree,
} from "lucide-react";

export const navItems = [
  {
    href: "/dashboard",
    label: "Tổng quan",
    subtitle: "Thống kê và tình trạng hệ thống",
    icon: LayoutDashboard,
  },
  {
    href: "/dashboard/branches",
    label: "Chi nhánh",
    subtitle: "Quản lý các chi nhánh",
    icon: CalendarClock,
  },
   {
    href: "/dashboard/zones",
    label: "Khu",
    subtitle: "Quản lý khu trong chi nhánh",
    icon: Map,
  },
  {
    href: "/dashboard/courts",
    label: "Sân",
    subtitle: "Thêm, sửa, trạng thái sân",
    icon: TentTree,
  },
  {
    href: "/dashboard/booked-courts",
    label: "Sân đã đặt",
    subtitle: "Danh sách lịch đã đặt",
    icon: CalendarClock,
  },
  {
    href: "/dashboard/timeslots",
    label: "Khung giờ",
    subtitle: "Quản lý khung giờ đặt sân",
    icon: Clock3,
  },
  {
    href: "/dashboard/transactions",
    label: "Giao dịch",
    subtitle: "Thanh toán và lịch sử giao dịch",
    icon: CreditCard,
  },
];

export const navGroups = [
  {
    title: "Tổng quan",
    items: [navItems[0]],
  },
  {
    title: "Quản lý hệ thống sân",
    items: [
      navItems[1], // Branch
      navItems[2], // Zone
      navItems[3], // Court
    ],
  },
  
  {
    title: "Vận hành sân",
    items: [navItems[5]],
  },

  {
    title: "Quản trị",
    items: [ navItems[4]],
  },
];