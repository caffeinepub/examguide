import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { BookOpen, GraduationCap, Users } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

type RoleValue = "student" | "tutor";

interface RoleSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface RoleCardProps {
  roleValue: RoleValue;
  selected: boolean;
  onSelect: (role: RoleValue) => void;
  icon: React.ElementType;
  title: string;
  description: string;
  accentClass: string;
  borderClass: string;
  bgClass: string;
  dataOcid: string;
}

function RoleCard({
  roleValue,
  selected,
  onSelect,
  icon: Icon,
  title,
  description,
  accentClass,
  borderClass,
  bgClass,
  dataOcid,
}: RoleCardProps) {
  return (
    <motion.button
      type="button"
      onClick={() => onSelect(roleValue)}
      data-ocid={dataOcid}
      aria-pressed={selected}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative w-full rounded-2xl p-6 text-left cursor-pointer transition-all duration-200",
        "border-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        selected
          ? cn("border-opacity-100 shadow-lg", borderClass, bgClass)
          : "border-border/40 bg-card hover:border-border/70 hover:bg-surface-2",
      )}
    >
      {selected && (
        <motion.div
          layoutId="role-selected-glow"
          className={cn("absolute inset-0 rounded-2xl opacity-10", accentClass)}
          initial={false}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}

      <div className="relative flex flex-col items-center gap-4 text-center">
        <div
          className={cn(
            "w-16 h-16 rounded-2xl border-2 flex items-center justify-center transition-all duration-200",
            selected
              ? cn("border-opacity-60", borderClass, bgClass)
              : "border-border/30 bg-surface-2",
          )}
        >
          <Icon
            className={cn(
              "w-8 h-8 transition-colors duration-200",
              selected ? accentClass : "text-muted-foreground",
            )}
          />
        </div>

        <div>
          <p
            className={cn(
              "font-display font-bold text-lg mb-1 transition-colors duration-200",
              selected ? "text-foreground" : "text-foreground/80",
            )}
          >
            {title}
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>

        {selected && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={cn(
              "absolute top-0 right-0 w-6 h-6 rounded-full flex items-center justify-center border-2 border-background",
              accentClass.replace("text-", "bg-"),
            )}
            aria-hidden="true"
          >
            <svg
              className="w-3 h-3 text-background"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </motion.div>
        )}
      </div>
    </motion.button>
  );
}

export default function RoleSelectionModal({
  open,
  onOpenChange,
}: RoleSelectionModalProps) {
  const { login, isLoggingIn, isInitializing } = useInternetIdentity();
  const [selectedRole, setSelectedRole] = useState<RoleValue | null>(null);

  const handleContinue = () => {
    if (!selectedRole) return;
    localStorage.setItem("examguide_pending_role", selectedRole);
    login();
    onOpenChange(false);
  };

  const handleCancel = () => {
    setSelectedRole(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-lg bg-card border-border/60 shadow-card p-0 overflow-hidden"
        data-ocid="role_modal.dialog"
      >
        {/* Ambient gradient header */}
        <div
          className="h-1 w-full"
          style={{
            background:
              "linear-gradient(90deg, oklch(0.78 0.155 67), oklch(0.55 0.12 195))",
          }}
          aria-hidden="true"
        />

        <div className="px-6 pt-6 pb-7">
          <DialogHeader className="mb-6 text-center">
            <div
              className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center mx-auto mb-4"
              aria-hidden="true"
            >
              <GraduationCap className="w-6 h-6 text-primary" />
            </div>
            <DialogTitle className="font-display text-2xl font-bold text-foreground">
              How are you joining?
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm mt-1.5">
              Choose your role so we can personalize your ExamGuide experience.
              You can change this later in your profile.
            </DialogDescription>
          </DialogHeader>

          {/* Role Cards */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <RoleCard
              roleValue="student"
              selected={selectedRole === "student"}
              onSelect={setSelectedRole}
              icon={BookOpen}
              title="I'm a Student"
              description="Access notes, find tutors, and get guidance for your exams."
              accentClass="text-teal"
              borderClass="border-teal/50"
              bgClass="bg-teal/8"
              dataOcid="role_modal.student.card"
            />
            <RoleCard
              roleValue="tutor"
              selected={selectedRole === "tutor"}
              onSelect={setSelectedRole}
              icon={Users}
              title="I'm a Tutor"
              description="Share your knowledge, create a profile, and guide students."
              accentClass="text-amber"
              borderClass="border-amber/50"
              bgClass="bg-amber/8"
              dataOcid="role_modal.tutor.card"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2.5">
            <Button
              onClick={handleContinue}
              disabled={!selectedRole || isLoggingIn || isInitializing}
              data-ocid="role_modal.continue.button"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 font-semibold transition-all duration-200"
            >
              {isLoggingIn ? "Signing in…" : "Continue with Internet Identity"}
            </Button>
            <Button
              variant="ghost"
              onClick={handleCancel}
              data-ocid="role_modal.cancel.button"
              className="w-full text-muted-foreground hover:text-foreground h-9 text-sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
