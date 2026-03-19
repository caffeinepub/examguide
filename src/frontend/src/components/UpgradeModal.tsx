import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2, Loader2, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TIERS = [
  {
    name: "Basic",
    price: "$3",
    period: "/month",
    features: [
      "Access to notes & guidance",
      "7 note downloads/month",
      "3 contact requests/month",
    ],
    highlight: false,
  },
  {
    name: "Standard",
    price: "$5",
    period: "/month",
    features: [
      "All Basic features",
      "Unlimited tutor requests",
      "Unlimited note downloads",
      "Priority search results",
    ],
    highlight: true,
  },
  {
    name: "Pro",
    price: "$10",
    period: "/month",
    features: [
      "Everything in Standard",
      "Priority support",
      "Early feature access",
      "Exclusive study materials",
    ],
    highlight: false,
  },
];

export default function UpgradeModal({
  open,
  onOpenChange,
}: UpgradeModalProps) {
  const { actor } = useActor();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!actor) {
      toast.error("Please sign in to subscribe");
      return;
    }
    setIsLoading(true);
    try {
      const successUrl = `${window.location.origin}/payment-success?plan=premium`;
      const cancelUrl = `${window.location.origin}/notes`;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const url = (await (actor as any).createPaidPlanCheckout(
        successUrl,
        cancelUrl,
      )) as string;
      if (url?.startsWith("http")) {
        window.location.href = url;
      } else {
        toast.info("Payment setup pending — check back soon");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (
        msg.toLowerCase().includes("stripe") ||
        msg.toLowerCase().includes("config")
      ) {
        toast.info("Payment setup pending — check back soon");
      } else {
        toast.error("Failed to start checkout. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl bg-card border-border/60 p-0 overflow-hidden"
        data-ocid="upgrade_modal.dialog"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-amber/20 via-primary/10 to-transparent px-6 pt-6 pb-4 border-b border-border/50">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            data-ocid="upgrade_modal.close_button"
          >
            <X className="w-4 h-4" />
          </button>
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-amber/20 border border-amber/40 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-amber" />
              </div>
              <DialogTitle className="font-display text-2xl font-bold">
                Go Premium
              </DialogTitle>
            </div>
            <p className="text-muted-foreground text-sm">
              Unlock unlimited access to notes, tutors, and more.
            </p>
          </DialogHeader>
        </div>

        {/* Pricing tiers */}
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`relative rounded-2xl p-4 border transition-all ${
                  tier.highlight
                    ? "border-primary/60 bg-primary/5 shadow-md shadow-primary/10"
                    : "border-border/60 bg-surface-2"
                }`}
              >
                {tier.highlight && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-2.5">
                    Recommended
                  </Badge>
                )}
                <div className="mb-3">
                  <p className="text-sm font-semibold text-muted-foreground mb-1">
                    {tier.name}
                  </p>
                  <div className="flex items-baseline gap-0.5">
                    <span className="font-display text-3xl font-bold text-foreground">
                      {tier.price}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {tier.period}
                    </span>
                  </div>
                </div>
                <ul className="space-y-1.5">
                  {tier.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-xs text-muted-foreground"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <Button
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-11 font-semibold"
            onClick={handleSubscribe}
            disabled={isLoading}
            data-ocid="upgrade_modal.subscribe_button"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {isLoading ? "Redirecting..." : "Subscribe for $5/month"}
          </Button>
          <p className="text-center text-xs text-muted-foreground mt-3">
            Secure payment via Stripe. Cancel anytime.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
