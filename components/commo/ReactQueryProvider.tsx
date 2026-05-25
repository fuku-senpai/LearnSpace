"use client";

import { queryClient } from "@/app/lib/react-query";
import { QueryClientProvider } from "@tanstack/react-query";


export default function ReactQueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}