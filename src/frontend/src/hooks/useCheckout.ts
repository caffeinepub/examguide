import { useMutation } from "@tanstack/react-query";
import { useActor } from "./useActor";

export interface CheckoutSession {
  id: string;
  url: string;
}

export interface CheckoutItem {
  name: string;
  description: string;
  amount: number;
  quantity: number;
}

export interface CreateCheckoutInput {
  items: CheckoutItem[];
  successUrlSuffix?: string;
}

export function useCreateCheckoutSession() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      items,
      successUrlSuffix,
    }: CreateCheckoutInput): Promise<CheckoutSession> => {
      if (!actor) throw new Error("Actor not available");
      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      const successUrl = `${baseUrl}/payment-success${successUrlSuffix || ""}`;
      const cancelUrl = `${baseUrl}/payment-failure`;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (actor as any).createCheckoutSession(
        items,
        successUrl,
        cancelUrl,
      );
      const session = JSON.parse(result) as CheckoutSession;
      if (!session?.url) throw new Error("Stripe session missing url");
      return session;
    },
  });
}
