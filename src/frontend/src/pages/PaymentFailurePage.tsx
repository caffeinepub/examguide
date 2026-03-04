import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { RefreshCw, XCircle } from "lucide-react";
import { motion } from "motion/react";

export default function PaymentFailurePage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-16"
      data-ocid="payment.failure.page"
    >
      {/* Ambient background */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 30%, oklch(0.55 0.18 25 / 0.09), transparent 70%)",
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
          initial={{ scale: 0, rotate: 20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            delay: 0.15,
            duration: 0.45,
            type: "spring",
            stiffness: 200,
          }}
        >
          <div className="w-24 h-24 rounded-full bg-destructive/10 border-2 border-destructive/30 flex items-center justify-center shadow-lg shadow-destructive/10">
            <XCircle className="w-12 h-12 text-destructive" strokeWidth={1.5} />
          </div>
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Payment Cancelled
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed mb-8">
            Your payment was not completed. No charges were made. You can try
            booking a session again whenever you're ready.
          </p>
        </motion.div>

        {/* Action */}
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.4 }}
        >
          <Button
            asChild
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
            data-ocid="payment.failure.retry_link"
          >
            <Link to="/tutors">
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Link>
          </Button>
        </motion.div>

        {/* Fine print */}
        <motion.p
          className="mt-8 text-xs text-muted-foreground/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65 }}
        >
          If you believe this was an error, please contact your tutor directly.
        </motion.p>
      </motion.div>
    </div>
  );
}
