import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  Compass,
  CreditCard,
  Info,
  Loader2,
  LogIn,
  Plus,
  Save,
  Shield,
  Trash2,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddExamCategory,
  useCallerRole,
  useExamCategories,
  useGuidancePosts,
  useIsStripeConfigured,
  useSetStripeConfiguration,
  useStudyNotes,
  useTutorProfiles,
} from "../hooks/useQueries";

// ── Login Prompt ─────────────────────────────────────────────
function LoginPrompt({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
      <div className="w-20 h-20 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center mb-6">
        <Shield className="w-10 h-10 text-primary" />
      </div>
      <h2 className="font-display text-2xl font-bold text-foreground mb-2">
        Sign in to access Admin Dashboard
      </h2>
      <p className="text-muted-foreground text-sm max-w-sm mb-8">
        You need to be signed in to view and manage admin controls.
      </p>
      <Button
        size="lg"
        onClick={onLogin}
        className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
        data-ocid="admin.login.primary_button"
      >
        <LogIn className="w-4 h-4" />
        Sign In
      </Button>
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────
interface StatCardProps {
  title: string;
  value: number | undefined;
  isLoading: boolean;
  icon: React.ElementType;
  color: string;
  bg: string;
}

function StatCard({
  title,
  value,
  isLoading,
  icon: Icon,
  color,
  bg,
}: StatCardProps) {
  return (
    <div className="p-5 rounded-2xl bg-card border border-border/60 flex items-start gap-4">
      <div
        className={cn(
          "w-11 h-11 rounded-xl border flex items-center justify-center shrink-0",
          bg,
        )}
      >
        <Icon className={cn("w-5 h-5", color)} />
      </div>
      <div className="min-w-0">
        {isLoading ? (
          <Skeleton className="h-8 w-16 mb-1" />
        ) : (
          <p className="font-display text-3xl font-bold text-foreground leading-none mb-1">
            {value ?? 0}
          </p>
        )}
        <p className="text-sm text-muted-foreground font-medium">{title}</p>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────
export default function AdminPage() {
  const { identity, login } = useInternetIdentity();
  const isLoggedIn = !!identity && !identity.getPrincipal().isAnonymous();

  const { data: role, isLoading: roleLoading } = useCallerRole();
  const isAdmin = role === "admin";

  const { data: notes, isLoading: notesLoading } = useStudyNotes();
  const { data: posts, isLoading: postsLoading } = useGuidancePosts();
  const { data: tutors, isLoading: tutorsLoading } = useTutorProfiles();
  const { data: categories, isLoading: categoriesLoading } =
    useExamCategories();
  const { data: stripeConfigured } = useIsStripeConfigured();

  const addCategory = useAddExamCategory();
  const setStripeConfig = useSetStripeConfiguration();

  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [deleteCatId, setDeleteCatId] = useState<number | null>(null);
  const [stripeKey, setStripeKey] = useState("");
  const [stripeCountries, setStripeCountries] = useState("US,CA,GB,AU");

  if (!isLoggedIn) {
    return <LoginPrompt onLogin={login} />;
  }

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      toast.error("Category name is required");
      return;
    }
    try {
      await addCategory.mutateAsync({
        name: newCatName.trim(),
        description: newCatDesc.trim(),
      });
      toast.success("Category added!");
      setNewCatName("");
      setNewCatDesc("");
    } catch {
      toast.error("Failed to add category — admin access required");
    }
  };

  const handleSaveStripe = async () => {
    if (!stripeKey.trim()) {
      toast.error("Please enter a Stripe Secret Key");
      return;
    }
    const countries = stripeCountries
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
    try {
      await setStripeConfig.mutateAsync({
        secretKey: stripeKey,
        allowedCountries: countries,
      });
      toast.success("Stripe configured successfully!");
      setStripeKey("");
    } catch {
      toast.error("Failed to save Stripe configuration");
    }
  };

  return (
    <div className="min-h-screen py-10">
      <div className="container mx-auto px-4">
        <motion.div
          className="max-w-4xl mx-auto space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* ── Page Header ───────────────────────────────────── */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground text-sm mt-0.5">
                Platform management and configuration
              </p>
            </div>
          </div>

          {/* ── Admin Access Status ────────────────────────────── */}
          <section data-ocid="admin.access.section">
            {roleLoading ? (
              <div
                className="p-5 rounded-2xl bg-card border border-border/60"
                data-ocid="admin.access.loading_state"
              >
                <Skeleton className="h-12 w-full" />
              </div>
            ) : isAdmin ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-4 p-5 rounded-2xl bg-teal/8 border border-teal/30"
                data-ocid="admin.access.success_state"
              >
                <CheckCircle2 className="w-6 h-6 text-teal shrink-0" />
                <div>
                  <p className="font-semibold text-teal text-sm">
                    You have admin access
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    All platform management controls are active and functional.
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="ml-auto border-teal/40 bg-teal/10 text-teal text-xs shrink-0"
                >
                  <Shield className="w-3 h-3 mr-1" />
                  Admin
                </Badge>
              </motion.div>
            ) : (
              <div
                className="flex items-start gap-4 p-5 rounded-2xl bg-chart-4/8 border border-chart-4/30"
                data-ocid="admin.access.error_state"
              >
                <Info className="w-5 h-5 text-chart-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-chart-4 text-sm mb-1">
                    Admin access required for some actions
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    To get admin access, open the app using the admin link
                    provided by Caffeine. If you are the app owner, check your{" "}
                    <a
                      href="https://caffeine.ai"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
                    >
                      Caffeine dashboard
                    </a>{" "}
                    for the admin access URL.
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Current role:{" "}
                    <span className="font-mono bg-surface-2 px-1.5 py-0.5 rounded text-foreground/70">
                      {role ?? "guest"}
                    </span>
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* ── Platform Stats ─────────────────────────────────── */}
          <section data-ocid="admin.stats.section">
            <h2 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Platform Overview
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Study Notes"
                value={notes?.length}
                isLoading={notesLoading}
                icon={BookOpen}
                color="text-teal"
                bg="bg-teal/10 border-teal/20"
              />
              <StatCard
                title="Guidance Posts"
                value={posts?.length}
                isLoading={postsLoading}
                icon={Compass}
                color="text-chart-4"
                bg="bg-chart-4/10 border-chart-4/20"
              />
              <StatCard
                title="Tutors & Mentors"
                value={tutors?.length}
                isLoading={tutorsLoading}
                icon={Users}
                color="text-primary"
                bg="bg-primary/10 border-primary/20"
              />
              <StatCard
                title="Exam Categories"
                value={categories?.length}
                isLoading={categoriesLoading}
                icon={BookOpen}
                color="text-chart-5"
                bg="bg-chart-5/10 border-chart-5/20"
              />
            </div>
          </section>

          {/* ── Exam Categories Management ──────────────────────── */}
          <section data-ocid="admin.categories.section">
            <h2 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Exam Categories
            </h2>

            <div className="rounded-2xl bg-card border border-border/60 overflow-hidden">
              {/* Add Category Form */}
              <div className="p-5 border-b border-border/60 bg-surface-1/50">
                <h3 className="font-semibold text-foreground text-sm mb-3 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-primary" />
                  Add New Category
                </h3>
                <form
                  onSubmit={handleAddCategory}
                  className="flex flex-col sm:flex-row gap-3"
                >
                  <div className="flex-1">
                    <Input
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      placeholder="Category name (e.g. SAT, IELTS, JEE)"
                      className="bg-surface-2 border-border/60 text-sm"
                      data-ocid="admin.categories.input"
                    />
                  </div>
                  <div className="flex-[1.5]">
                    <Input
                      value={newCatDesc}
                      onChange={(e) => setNewCatDesc(e.target.value)}
                      placeholder="Short description"
                      className="bg-surface-2 border-border/60 text-sm"
                      data-ocid="admin.categories.description.input"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={addCategory.isPending || !newCatName.trim()}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 shrink-0"
                    data-ocid="admin.categories.submit_button"
                  >
                    {addCategory.isPending ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}
                    Add
                  </Button>
                </form>
              </div>

              {/* Category List */}
              {categoriesLoading ? (
                <div
                  className="p-5 space-y-3"
                  data-ocid="admin.categories.loading_state"
                >
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : !categories || categories.length === 0 ? (
                <div
                  className="text-center py-12 text-muted-foreground text-sm"
                  data-ocid="admin.categories.empty_state"
                >
                  <BookOpen className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
                  No exam categories yet. Add the first one above.
                </div>
              ) : (
                <Table data-ocid="admin.categories.table">
                  <TableHeader>
                    <TableRow className="border-border/60 hover:bg-transparent">
                      <TableHead className="text-muted-foreground font-medium text-xs uppercase tracking-wide pl-5">
                        Name
                      </TableHead>
                      <TableHead className="text-muted-foreground font-medium text-xs uppercase tracking-wide">
                        Description
                      </TableHead>
                      <TableHead className="text-muted-foreground font-medium text-xs uppercase tracking-wide w-16 text-right pr-5">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((cat, i) => (
                      <TableRow
                        key={cat.id}
                        className="border-border/50 hover:bg-surface-2/50 transition-colors"
                        data-ocid={`admin.categories.item.${i + 1}`}
                      >
                        <TableCell className="pl-5">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary/70 shrink-0" />
                            <span className="font-medium text-foreground text-sm">
                              {cat.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {cat.description || (
                            <span className="italic opacity-50">
                              No description
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right pr-5">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            onClick={() => setDeleteCatId(cat.id)}
                            data-ocid={`admin.categories.delete_button.${i + 1}`}
                            aria-label={`Delete ${cat.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </section>

          {/* ── Stripe Configuration ────────────────────────────── */}
          <section data-ocid="admin.stripe.section">
            <h2 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Stripe Configuration
            </h2>

            <div className="p-6 rounded-2xl bg-card border border-border/60">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-foreground">
                    Payment Gateway
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Enable paid tutor sessions on ExamGuide
                  </p>
                </div>
              </div>

              <Separator className="my-5 bg-border/50" />

              {stripeConfigured ? (
                <div
                  className="flex items-center gap-3 p-4 rounded-xl bg-teal/8 border border-teal/25"
                  data-ocid="admin.stripe.success_state"
                >
                  <CheckCircle2 className="w-5 h-5 text-teal shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-teal">
                      Stripe is configured and active
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Students can now pay tutors directly through ExamGuide.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div
                    className="p-4 rounded-xl bg-chart-4/8 border border-chart-4/25 text-sm text-chart-4 font-medium"
                    data-ocid="admin.stripe.error_state"
                  >
                    Stripe is not yet configured. Add your keys below to enable
                    payments.
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-foreground mb-1.5 block">
                      Stripe Secret Key
                    </Label>
                    <Input
                      type="password"
                      value={stripeKey}
                      onChange={(e) => setStripeKey(e.target.value)}
                      placeholder="sk_live_..."
                      className="bg-surface-2 border-border/60 font-mono text-sm"
                      data-ocid="admin.stripe.input"
                      autoComplete="off"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Find this in your Stripe Dashboard → Developers → API
                      keys.
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-foreground mb-1.5 block">
                      Allowed Countries (comma-separated)
                    </Label>
                    <Input
                      value={stripeCountries}
                      onChange={(e) => setStripeCountries(e.target.value)}
                      placeholder="US,CA,GB,AU"
                      className="bg-surface-2 border-border/60"
                      data-ocid="admin.stripe.countries.input"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      ISO 3166-1 alpha-2 country codes, e.g. US, CA, GB, IN.
                    </p>
                  </div>

                  <Button
                    onClick={handleSaveStripe}
                    disabled={setStripeConfig.isPending}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                    data-ocid="admin.stripe.save.button"
                  >
                    {setStripeConfig.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save Stripe Configuration
                  </Button>
                </div>
              )}

              <Separator className="my-5 bg-border/50" />

              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="font-medium text-foreground/80">
                  How it works:{" "}
                </span>
                Tutors on ExamGuide earn money when students book paid sessions.
                Each tutor sets their hourly rate on their profile. Configure
                your Stripe keys above to enable the payment flow for all
                tutors.
              </p>
            </div>
          </section>

          {/* ── Admin Tools Info ────────────────────────────────── */}
          {!isAdmin && (
            <div className="p-5 rounded-2xl bg-surface-1 border border-border/50">
              <p className="text-sm text-muted-foreground leading-relaxed text-center">
                <Shield className="w-4 h-4 inline mr-1.5 text-muted-foreground/60" />
                Actions like adding/removing categories and configuring Stripe
                require admin role. The backend enforces this — get admin access
                via your Caffeine dashboard admin URL.
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Delete Category Confirmation */}
      <AlertDialog
        open={deleteCatId !== null}
        onOpenChange={(o) => !o && setDeleteCatId(null)}
      >
        <AlertDialogContent
          className="bg-card border-border/60"
          data-ocid="admin.delete_category.dialog"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              Delete Category?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This will permanently remove the exam category. Notes and posts in
              this category may be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="border-border/60"
              data-ocid="admin.delete_category.cancel_button"
              onClick={() => setDeleteCatId(null)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-ocid="admin.delete_category.confirm_button"
              onClick={() => {
                // Backend doesn't expose deleteExamCategory in d.ts, so we show a toast
                toast.info(
                  "Category deletion is not available in this version",
                );
                setDeleteCatId(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
