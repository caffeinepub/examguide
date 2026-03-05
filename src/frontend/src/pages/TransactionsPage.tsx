import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  ArrowDownRight,
  ArrowUpRight,
  DollarSign,
  LogIn,
  Receipt,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import { formatTimestamp } from "../data/sampleData";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  PLATFORM_FEE_PERCENT,
  type TransactionRecord,
  useCallerRole,
  useGetAllTransactions,
  useGetMyTransactions,
} from "../hooks/useQueries";

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

// ── Login Prompt ─────────────────────────────────────────────────────────────

function LoginPrompt({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
      <div className="w-20 h-20 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center mb-6">
        <Receipt className="w-10 h-10 text-primary" />
      </div>
      <h2 className="font-display text-2xl font-bold text-foreground mb-2">
        Sign in to view transactions
      </h2>
      <p className="text-muted-foreground text-sm max-w-sm mb-8">
        Track your payment history, platform fees, and tutor payouts — all in
        one place.
      </p>
      <Button
        size="lg"
        onClick={onLogin}
        className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
        data-ocid="transactions.login.primary_button"
      >
        <LogIn className="w-4 h-4" />
        Sign In
      </Button>
    </div>
  );
}

// ── Loading Skeleton ──────────────────────────────────────────────────────────

function TransactionsSkeleton() {
  return (
    <div className="space-y-3" data-ocid="transactions.loading_state">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="p-5 rounded-xl bg-card border border-border/60 flex items-center gap-4"
        >
          <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
          <div className="text-right space-y-2">
            <Skeleton className="h-5 w-20 ml-auto" />
            <Skeleton className="h-3 w-16 ml-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Summary Stats ─────────────────────────────────────────────────────────────

function TransactionSummary({
  transactions,
}: { transactions: TransactionRecord[] }) {
  const totalPaid = transactions.reduce((sum, t) => sum + t.totalAmount, 0);
  const totalFees = transactions.reduce(
    (sum, t) => sum + t.platformFeeAmount,
    0,
  );
  const tutorPayouts = totalPaid - totalFees;

  const stats = [
    {
      label: "Total Paid",
      value: formatCents(totalPaid),
      icon: DollarSign,
      color: "text-primary",
      bg: "bg-primary/10 border-primary/20",
    },
    {
      label: "Platform Fees (35%)",
      value: formatCents(totalFees),
      icon: ArrowUpRight,
      color: "text-chart-4",
      bg: "bg-chart-4/10 border-chart-4/20",
    },
    {
      label: "Tutor Payouts (65%)",
      value: formatCents(tutorPayouts),
      icon: ArrowDownRight,
      color: "text-teal",
      bg: "bg-teal/10 border-teal/20",
    },
    {
      label: "Transactions",
      value: String(transactions.length),
      icon: TrendingUp,
      color: "text-accent",
      bg: "bg-accent/10 border-accent/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {stats.map(({ label, value, icon: Icon, color, bg }) => (
        <div
          key={label}
          className="p-4 rounded-xl bg-card border border-border/60"
        >
          <div
            className={cn(
              "w-9 h-9 rounded-lg border flex items-center justify-center mb-3",
              bg,
            )}
          >
            <Icon className={cn("w-4 h-4", color)} />
          </div>
          <p className={cn("font-display text-xl font-bold mb-0.5", color)}>
            {value}
          </p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      ))}
    </div>
  );
}

// ── Single Transaction Row ────────────────────────────────────────────────────

function TransactionRow({
  tx,
  index,
}: {
  tx: TransactionRecord;
  index: number;
}) {
  const tutorPayout = tx.totalAmount - tx.platformFeeAmount;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      className="p-5 rounded-xl bg-card border border-border/60 hover:border-border/90 transition-colors"
      data-ocid={`transactions.item.${index + 1}`}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
          <Receipt className="w-5 h-5 text-primary" />
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p className="font-semibold text-foreground text-sm">
              {tx.tutorName}
            </p>
            <Badge
              variant="outline"
              className="text-xs border-primary/30 bg-primary/10 text-primary"
            >
              {tx.sessionType}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {formatTimestamp(tx.timestamp)}
          </p>

          {/* Fee breakdown */}
          <div className="mt-3 flex flex-wrap gap-4 text-xs">
            <div>
              <span className="text-muted-foreground">Platform fee </span>
              <span className="font-semibold text-chart-4">
                {formatCents(tx.platformFeeAmount)}
              </span>
              <span className="text-muted-foreground">
                {" "}
                ({PLATFORM_FEE_PERCENT}%)
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Tutor payout </span>
              <span className="font-semibold text-teal">
                {formatCents(tutorPayout)}
              </span>
              <span className="text-muted-foreground"> (65%)</span>
            </div>
          </div>
        </div>

        {/* Total */}
        <div className="text-right shrink-0">
          <p className="font-display font-bold text-lg text-foreground">
            {formatCents(tx.totalAmount)}
          </p>
          <p className="text-xs text-muted-foreground">Total paid</p>
        </div>
      </div>
    </motion.div>
  );
}

// ── Transaction List ──────────────────────────────────────────────────────────

function TransactionList({
  transactions,
  emptyOcid,
}: {
  transactions: TransactionRecord[];
  emptyOcid: string;
}) {
  if (transactions.length === 0) {
    return (
      <div
        className="text-center py-20 rounded-xl bg-card border border-border/60"
        data-ocid={emptyOcid}
      >
        <div className="w-16 h-16 rounded-2xl bg-muted/50 border border-border/60 flex items-center justify-center mx-auto mb-4">
          <Receipt className="w-8 h-8 text-muted-foreground/50" />
        </div>
        <p className="font-display font-semibold text-foreground mb-1">
          No transactions yet
        </p>
        <p className="text-muted-foreground text-sm max-w-xs mx-auto">
          Paid session bookings with tutors will appear here with a full fee
          breakdown.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <TransactionSummary transactions={transactions} />
      <div className="space-y-2">
        {transactions.map((tx, i) => (
          <TransactionRow key={tx.id} tx={tx} index={i} />
        ))}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TransactionsPage() {
  const { identity, login } = useInternetIdentity();
  const isLoggedIn = !!identity && !identity.getPrincipal().isAnonymous();

  const { data: role } = useCallerRole();
  const isAdmin = role === "admin";

  const { data: myTransactions, isLoading: myLoading } = useGetMyTransactions();
  const { data: allTransactions, isLoading: allLoading } =
    useGetAllTransactions();

  if (!isLoggedIn) {
    return <LoginPrompt onLogin={login} />;
  }

  return (
    <div className="min-h-screen py-10" data-ocid="transactions.page">
      <div className="container mx-auto px-4">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Page Header */}
          <div className="p-6 rounded-2xl bg-card border border-border/60 mb-6 relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-5"
              style={{
                background:
                  "radial-gradient(ellipse at top right, oklch(0.78 0.155 67), transparent 60%)",
              }}
              aria-hidden="true"
            />
            <div className="relative flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
                <Receipt className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-foreground mb-1">
                  Transaction History
                </h1>
                <p className="text-sm text-muted-foreground">
                  A full record of your paid sessions, platform fees, and tutor
                  payouts.
                </p>
              </div>
            </div>

            {/* Fee policy notice */}
            <div className="relative mt-5 pt-5 border-t border-border/50">
              <div className="flex items-start gap-3 p-3.5 rounded-lg bg-chart-4/8 border border-chart-4/20">
                <TrendingUp className="w-4 h-4 text-chart-4 mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-chart-4">
                    Platform fee policy:{" "}
                  </span>
                  ExamGuide retains{" "}
                  <span className="font-semibold text-chart-4">
                    {PLATFORM_FEE_PERCENT}%
                  </span>{" "}
                  of every paid session as a platform fee. The remaining{" "}
                  <span className="font-semibold text-teal">65%</span> is paid
                  directly to the tutor. This fee is shown on every transaction
                  below.
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          {isAdmin ? (
            <Tabs defaultValue="mine" data-ocid="transactions.tab">
              <TabsList className="bg-surface-2 border border-border/60 h-auto p-1 gap-1 mb-6">
                <TabsTrigger
                  value="mine"
                  className="text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  data-ocid="transactions.my.tab"
                >
                  My Transactions
                  {myTransactions && myTransactions.length > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-1.5 text-xs px-1.5 py-0"
                    >
                      {myTransactions.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="all"
                  className="text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  data-ocid="transactions.all.tab"
                >
                  All Transactions
                  {allTransactions && allTransactions.length > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-1.5 text-xs px-1.5 py-0"
                    >
                      {allTransactions.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="mine">
                {myLoading ? (
                  <TransactionsSkeleton />
                ) : (
                  <TransactionList
                    transactions={myTransactions ?? []}
                    emptyOcid="transactions.my.empty_state"
                  />
                )}
              </TabsContent>

              <TabsContent value="all">
                {allLoading ? (
                  <TransactionsSkeleton />
                ) : (
                  <TransactionList
                    transactions={allTransactions ?? []}
                    emptyOcid="transactions.all.empty_state"
                  />
                )}
              </TabsContent>
            </Tabs>
          ) : myLoading ? (
            <TransactionsSkeleton />
          ) : (
            <TransactionList
              transactions={myTransactions ?? []}
              emptyOcid="transactions.my.empty_state"
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}
