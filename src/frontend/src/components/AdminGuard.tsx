import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { LogIn, ShieldX } from "lucide-react";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { UserRole } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCallerRole } from "../hooks/useQueries";

interface AdminGuardProps {
  children: ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const { identity, login } = useInternetIdentity();
  const isLoggedIn = !!identity && !identity.getPrincipal().isAnonymous();

  const { data: role, isLoading: roleLoading } = useCallerRole();

  // Not logged in — show sign-in prompt
  if (!isLoggedIn) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-24 text-center"
        data-ocid="admin.guard.sign_in.panel"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-sm w-full"
        >
          <div className="w-20 h-20 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center mb-6 mx-auto shadow-lg shadow-primary/10">
            <ShieldX className="w-10 h-10 text-primary" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">
            Sign In Required
          </h2>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-8 leading-relaxed">
            You need to be signed in to access the Admin Dashboard.
          </p>
          <Button
            size="lg"
            onClick={login}
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 w-full sm:w-auto"
            data-ocid="admin.guard.login.primary_button"
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </Button>
        </motion.div>
      </div>
    );
  }

  // Loading role state
  if (roleLoading) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-24"
        data-ocid="admin.guard.loading_state"
      >
        <div className="max-w-sm w-full space-y-4">
          <Skeleton className="h-20 w-20 rounded-2xl mx-auto" />
          <Skeleton className="h-7 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
          <Skeleton className="h-4 w-52 mx-auto" />
        </div>
      </div>
    );
  }

  // Logged in but not admin
  if (role !== UserRole.admin) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-24 text-center"
        data-ocid="admin.guard.denied.panel"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-sm w-full"
        >
          {/* Icon */}
          <div className="w-20 h-20 rounded-2xl bg-destructive/15 border border-destructive/30 flex items-center justify-center mb-6 mx-auto shadow-lg shadow-destructive/10">
            <ShieldX className="w-10 h-10 text-destructive" />
          </div>

          {/* Heading */}
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">
            Access Denied
          </h2>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-2 leading-relaxed">
            You don't have admin access.
          </p>
          <p className="text-muted-foreground/70 text-xs max-w-xs mx-auto mb-8 leading-relaxed">
            This section is restricted to platform administrators only. If you
            believe this is an error, please contact the platform owner.
          </p>

          {/* Decorative denied badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 border border-destructive/25 text-destructive text-xs font-semibold mb-8">
            <ShieldX className="w-3.5 h-3.5" />
            Administrator Only
          </div>

          {/* Back to Home */}
          <div>
            <Button
              asChild
              variant="outline"
              className="border-border/60 hover:border-destructive/40 hover:text-destructive transition-colors gap-2"
              data-ocid="admin.guard.denied.link"
            >
              <Link to="/">← Back to Home</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Admin — render children
  return <>{children}</>;
}
