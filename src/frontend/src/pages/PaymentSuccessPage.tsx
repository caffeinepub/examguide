import { Button } from "@/components/ui/button";
import { Link, useSearch } from "@tanstack/react-router";
import { CheckCircle2, LayoutDashboard, Receipt, Users } from "lucide-react";
import { motion } from "motion/react";

export default function PaymentSuccessPage() {
  // Read query params for fee breakdown
  const search = useSearch({ strict: false }) as Record<
    string,
    string | undefined
  >;
  const amountParam = search?.amount;
  const tutorName = search?.tutorName
    ? decodeURIComponent(search.tutorName)
    : undefined;
  const sessionType = search?.sessionType
    ? decodeURIComponent(search.sessionType)
    : undefined;
  const amountCents = amountParam ? Number(amountParam) : 0;
  const hasBreakdown = amountParam != null && amountCents > 0;

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-16"
      data-ocid="payment.success.page"
    >
      {/* Ambient background */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 30%, oklch(0.62 0.12 163 / 0.12), transparent 70%)",
        }}
      />

      <motion.div
        className="relative z-10 max-w-md w-full text-center"
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Icon */}
        <motion.div
          className="flex items-center justify-center mx-auto mb-6"
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            delay: 0.15,
            duration: 0.45,
            type: "spring",
            stiffness: 200,
          }}
        >
          <div className="w-24 h-24 rounded-full bg-teal/15 border-2 border-teal/40 flex items-center justify-center shadow-lg shadow-teal/10">
            <CheckCircle2 className="w-12 h-12 text-teal" strokeWidth={1.5} />
          </div>
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Payment Successful!
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed mb-6">
            Your session has been booked. The tutor will confirm your
            appointment shortly. Check your dashboard for updates.
          </p>
        </motion.div>

        {/* Fee Breakdown Card */}
        {hasBreakdown && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="mb-6 text-left"
            data-ocid="payment.success.fee_breakdown.card"
          >
            <div className="p-4 rounded-xl bg-card border border-border/60 text-sm">
              <p className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-primary" />
                Transaction Summary
              </p>
              <div className="space-y-2 text-xs">
                {sessionType && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Session</span>
                    <span className="font-medium">{sessionType}</span>
                  </div>
                )}
                {tutorName && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tutor</span>
                    <span className="font-medium">{tutorName}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-border/40 pt-2 mt-1">
                  <span className="text-muted-foreground">Total paid</span>
                  <span className="font-medium">
                    ${(amountCents / 100).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-amber-600 dark:text-amber-400">
                  <span>ExamGuide fee (35%)</span>
                  <span>${((amountCents * 0.35) / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-green-600 dark:text-green-400 border-t border-border/40 pt-2">
                  <span>Tutor payout</span>
                  <span className="font-semibold">
                    ${((amountCents * 0.65) / 100).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Platform fee note */}
            <p className="text-xs text-muted-foreground/60 mt-2 text-center">
              ExamGuide retains 35% as a platform fee. The tutor receives the
              remaining 65%.
            </p>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          className="flex flex-col sm:flex-row gap-3 justify-center"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: hasBreakdown ? 0.55 : 0.45, duration: 0.4 }}
        >
          <Button
            asChild
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
            data-ocid="payment.success.tutors_link"
          >
            <Link to="/tutors">
              <Users className="w-4 h-4" />
              Back to Tutors
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-border/60 gap-2"
            data-ocid="payment.success.dashboard_link"
          >
            <Link to="/profile">
              <LayoutDashboard className="w-4 h-4" />
              Go to Dashboard
            </Link>
          </Button>
        </motion.div>

        {/* Decorative confirmation note */}
        <motion.p
          className="mt-8 text-xs text-muted-foreground/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65 }}
        >
          A confirmation has been processed via Stripe. No further action
          needed.
        </motion.p>
      </motion.div>
    </div>
  );
}
