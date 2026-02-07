"use client";

import { useSearchParams } from "next/navigation";

export function useAdmin() {
  const searchParams = useSearchParams();
  const isAdmin = searchParams.get("adminzz") === "true";
  const adminQuery = isAdmin ? "?adminzz=true" : "";

  return { isAdmin, adminQuery };
}
