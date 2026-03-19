import { useQuery } from "@tanstack/react-query";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

export function usePlanInfo() {
  const { identity } = useInternetIdentity();
  const { actor, isFetching } = useActor();
  const isLoggedIn = !!identity && !identity.getPrincipal().isAnonymous();

  const { data, isLoading } = useQuery({
    queryKey: ["mySubscription"],
    queryFn: async () => {
      if (!actor) return null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (actor as any).getMySubscription() as Promise<{
        plan: { free: null } | { paid: null };
        paidUntil: [] | [bigint];
        lastResetMonth: bigint;
      }>;
    },
    enabled: !!actor && !isFetching && isLoggedIn,
  });

  const isPaid = (() => {
    if (!data) return false;
    if ("paid" in data.plan) {
      const until = data.paidUntil[0];
      if (!until) return false;
      const expiryMs = Number(until) / 1_000_000;
      return expiryMs > Date.now();
    }
    return false;
  })();

  const planExpiry = (() => {
    if (!data || !("paid" in data.plan)) return null;
    const until = data.paidUntil[0];
    if (!until) return null;
    return new Date(Number(until) / 1_000_000);
  })();

  return { isPaid, planExpiry, isLoading };
}
