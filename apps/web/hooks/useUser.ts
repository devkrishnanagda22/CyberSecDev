"use client";

import { useUserContext } from "@/contexts/UserContext";

export default function useUser() {
  return useUserContext();
}