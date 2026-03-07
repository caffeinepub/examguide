import { useCallerProfile } from "./useQueries";

export type UserRole = "student" | "tutor" | null;

export function useUserRole(): { role: UserRole; isLoading: boolean } {
  const { data: profile, isLoading } = useCallerProfile();

  if (isLoading) return { role: null, isLoading: true };
  if (!profile) return { role: null, isLoading: false };

  const tag = profile.expertiseTags?.[0];
  if (tag === "tutor") return { role: "tutor", isLoading: false };
  return { role: "student", isLoading: false };
}
