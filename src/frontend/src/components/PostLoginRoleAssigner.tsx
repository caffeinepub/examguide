import { useEffect, useRef } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCallerProfile, useSaveUserProfile } from "../hooks/useQueries";

/**
 * Invisible component that auto-creates a user profile with the role they
 * selected before logging in (stored in localStorage as "examguide_pending_role").
 * Only runs once per login, and only when no profile exists yet.
 */
export default function PostLoginRoleAssigner() {
  const { identity, isLoginSuccess } = useInternetIdentity();
  const { data: callerProfile, isLoading: profileLoading } = useCallerProfile();
  const saveProfile = useSaveUserProfile();
  const hasRun = useRef(false);

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  useEffect(() => {
    // Only proceed when:
    // 1. User just completed login (isLoginSuccess)
    // 2. Identity is available and not anonymous
    // 3. Profile query has settled (not loading)
    // 4. Profile is null (no existing profile)
    // 5. We haven't already run this effect
    if (!isLoginSuccess) return;
    if (!isAuthenticated) return;
    if (profileLoading) return;
    if (callerProfile !== null && callerProfile !== undefined) return;
    if (hasRun.current) return;

    const pendingRole = localStorage.getItem("examguide_pending_role");
    if (!pendingRole) return;

    hasRun.current = true;

    const expertiseTags = pendingRole === "tutor" ? ["tutor"] : ["student"];

    saveProfile
      .mutateAsync({ displayName: "", bio: "", expertiseTags })
      .then(() => {
        localStorage.removeItem("examguide_pending_role");
      })
      .catch(() => {
        // Silent fail — user can set role manually in Profile
        hasRun.current = false;
      });
  }, [
    isLoginSuccess,
    isAuthenticated,
    profileLoading,
    callerProfile,
    saveProfile,
  ]);

  // Reset hasRun when user logs out (identity becomes anonymous/null)
  useEffect(() => {
    if (!isAuthenticated) {
      hasRun.current = false;
    }
  }, [isAuthenticated]);

  return null;
}
