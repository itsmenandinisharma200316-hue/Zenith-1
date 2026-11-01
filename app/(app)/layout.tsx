"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { TabBar } from "@/components/TabBar";
import { useStore } from "@/lib/store";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { ready, userId } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (ready && !userId) router.replace("/login");
  }, [ready, userId, router]);

  if (!ready || !userId) return null;

  return (
    <>
      {children}
      <TabBar />
    </>
  );
}
