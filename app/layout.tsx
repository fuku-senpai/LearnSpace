import type { Metadata } from "next";
import { Geist_Mono, Roboto } from "next/font/google";
import "./globals.css";
import ReactQueryProvider from "@/components/commo/ReactQueryProvider";
import { ToastContainer} from 'react-toastify';
const roboto = Roboto({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Course Learning Platform",
  description: "Nền tảng quản lý video bài giảng và học tập trực tuyến",
  icons: {
    icon: "/icons/systemIcon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${roboto.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col"><ReactQueryProvider>{children}</ReactQueryProvider> <ToastContainer/></body>
    </html>
  );
}
