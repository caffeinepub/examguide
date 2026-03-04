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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { Principal } from "@icp-sdk/core/principal";
import {
  BookOpen,
  CheckCircle,
  CheckCircle2,
  Clock,
  Compass,
  CreditCard,
  Edit,
  GraduationCap,
  Loader2,
  LogIn,
  Save,
  Shield,
  Star,
  Tag,
  Trash2,
  User,
  X,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { BookingRequest } from "../backend.d";
import { formatTimestamp } from "../data/sampleData";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  BookingStatus,
  useBookingRequestsForTutor,
  useCallerProfile,
  useCallerRole,
  useCreateUserProfile,
  useDeleteGuidancePost,
  useDeleteStudyNote,
  useGuidancePosts,
  useIsStripeConfigured,
  useSaveUserProfile,
  useSetStripeConfiguration,
  useStudyNotes,
  useUpdateBookingStatus,
} from "../hooks/useQueries";

function LoginPrompt({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
      <div className="w-20 h-20 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center mb-6">
        <User className="w-10 h-10 text-primary" />
      </div>
      <h2 className="font-display text-2xl font-bold text-foreground mb-2">
        Sign in to view your profile
      </h2>
      <p className="text-muted-foreground text-sm max-w-sm mb-8">
        Access your notes, articles, bookings, and personalized dashboard by
        signing in.
      </p>
      <Button
        size="lg"
        onClick={onLogin}
        className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
        data-ocid="profile.login.primary_button"
      >
        <LogIn className="w-4 h-4" />
        Sign In
      </Button>
    </div>
  );
}

function RoleBadge({ role }: { role: string | null }) {
  if (!role) return null;
  const config = {
    admin: {
      label: "Admin",
      icon: Shield,
      class: "border-destructive/40 bg-destructive/10 text-destructive",
    },
    user: {
      label: "Student",
      icon: GraduationCap,
      class: "border-teal/40 bg-teal/10 text-teal",
    },
    guest: {
      label: "Guest",
      icon: User,
      class: "border-border bg-muted/50 text-muted-foreground",
    },
  };
  const c = config[role as keyof typeof config] ?? config.user;
  const Icon = c.icon;
  return (
    <Badge variant="outline" className={cn("text-xs font-medium", c.class)}>
      <Icon className="w-3 h-3 mr-1" />
      {c.label}
    </Badge>
  );
}

function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const config = {
    [BookingStatus.pending]: "border-chart-4/40 bg-chart-4/10 text-chart-4",
    [BookingStatus.accepted]: "border-teal/40 bg-teal/10 text-teal",
    [BookingStatus.rejected]:
      "border-destructive/40 bg-destructive/10 text-destructive",
  };
  return (
    <Badge
      variant="outline"
      className={cn("text-xs capitalize", config[status])}
    >
      {status}
    </Badge>
  );
}

export default function ProfilePage() {
  const { identity, login } = useInternetIdentity();
  const isLoggedIn = !!identity && !identity.getPrincipal().isAnonymous();
  const principal = identity?.getPrincipal();

  const [editMode, setEditMode] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [expertiseTags, setExpertiseTags] = useState("");
  const [deleteNoteId, setDeleteNoteId] = useState<number | null>(null);
  const [deletePostId, setDeletePostId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [stripeKey, setStripeKey] = useState("");
  const [stripeCountries, setStripeCountries] = useState("US,CA,GB,AU");

  const { data: profile, isLoading: profileLoading } = useCallerProfile();
  const { data: role } = useCallerRole();
  const { data: backendNotes } = useStudyNotes();
  const { data: backendPosts } = useGuidancePosts();
  const { data: bookingRequests } = useBookingRequestsForTutor(
    isLoggedIn ? (principal as Principal) : undefined,
  );

  const createProfile = useCreateUserProfile();
  const saveProfile = useSaveUserProfile();
  const deleteNote = useDeleteStudyNote();
  const deletePost = useDeleteGuidancePost();
  const updateBooking = useUpdateBookingStatus();
  const { data: stripeConfigured } = useIsStripeConfigured();
  const setStripeConfig = useSetStripeConfiguration();

  // Populate form when profile loads
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName ?? "");
      setBio(profile.bio ?? "");
      setExpertiseTags(profile.expertiseTags?.join(", ") ?? "");
    }
  }, [profile]);

  const allNotes = backendNotes ?? [];
  const allPosts = backendPosts ?? [];

  const myNotes = principal
    ? allNotes.filter((n) => {
        try {
          return n.author.toString() === principal.toString();
        } catch {
          return false;
        }
      })
    : [];

  const myPosts = principal
    ? allPosts.filter((p) => {
        try {
          return p.author.toString() === principal.toString();
        } catch {
          return false;
        }
      })
    : [];

  const handleSaveProfile = async () => {
    const tags = expertiseTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    try {
      if (!profile) {
        await createProfile.mutateAsync({
          displayName,
          bio,
          expertiseTags: tags,
        });
        toast.success("Profile created!");
      } else {
        await saveProfile.mutateAsync({
          displayName,
          bio,
          expertiseTags: tags,
        });
        toast.success("Profile saved!");
      }
      setEditMode(false);
    } catch {
      toast.error("Failed to save profile");
    }
  };

  const handleUpdateBooking = async (id: number, status: BookingStatus) => {
    try {
      await updateBooking.mutateAsync({ id, status });
      toast.success(`Booking ${status}`);
    } catch {
      toast.error("Failed to update booking");
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

  if (!isLoggedIn) {
    return <LoginPrompt onLogin={login} />;
  }

  if (profileLoading) {
    return (
      <div
        className="container mx-auto px-4 py-10"
        data-ocid="profile.loading_state"
      >
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex gap-4 p-6 rounded-xl bg-card border border-border/60">
            <Skeleton className="w-20 h-20 rounded-full" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    );
  }

  const principalString = principal?.toString() ?? "Unknown";
  const shortPrincipal = `${principalString.slice(0, 8)}...${principalString.slice(-6)}`;
  const avatarInitials = profile?.displayName
    ? profile.displayName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "ME";

  return (
    <div className="min-h-screen py-10">
      <div className="container mx-auto px-4">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Profile Header */}
          <div className="p-6 rounded-2xl bg-card border border-border/60 mb-6 relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-5"
              style={{
                background:
                  "radial-gradient(ellipse at top left, oklch(0.55 0.12 195), transparent 60%)",
              }}
              aria-hidden="true"
            />
            <div className="relative flex flex-col sm:flex-row items-start gap-5">
              <Avatar className="w-20 h-20 border-2 border-primary/30 shrink-0">
                <AvatarFallback className="bg-primary/20 text-primary font-display font-bold text-2xl">
                  {avatarInitials}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                {editMode ? (
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">
                        Display Name
                      </Label>
                      <Input
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Your Name"
                        className="bg-surface-2 border-border/60 max-w-xs"
                        data-ocid="profile.name.input"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">
                        Bio
                      </Label>
                      <Textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell the community about yourself..."
                        rows={3}
                        className="bg-surface-2 border-border/60 max-w-xl"
                        data-ocid="profile.bio.textarea"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">
                        Expertise Tags (comma-separated)
                      </Label>
                      <Input
                        value={expertiseTags}
                        onChange={(e) => setExpertiseTags(e.target.value)}
                        placeholder="SAT, Mathematics, Critical Reading"
                        className="bg-surface-2 border-border/60 max-w-xs"
                        data-ocid="profile.tags.input"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleSaveProfile}
                        disabled={
                          saveProfile.isPending || createProfile.isPending
                        }
                        className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5"
                        data-ocid="profile.save.button"
                      >
                        {saveProfile.isPending || createProfile.isPending ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Save className="w-3.5 h-3.5" />
                        )}
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditMode(false)}
                        className="border-border/60 gap-1.5"
                        data-ocid="profile.cancel.button"
                      >
                        <X className="w-3.5 h-3.5" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-3 flex-wrap mb-1">
                      <h1 className="font-display text-2xl font-bold text-foreground">
                        {profile?.displayName || "Anonymous Student"}
                      </h1>
                      <RoleBadge role={role ?? null} />
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {profile?.bio ||
                        "No bio yet — click edit to introduce yourself."}
                    </p>
                    {profile?.expertiseTags &&
                      profile.expertiseTags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {profile.expertiseTags.map((tag: string) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-xs border-teal/30 bg-teal/10 text-teal gap-1"
                            >
                              <Tag className="w-2.5 h-2.5" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    <p className="text-xs text-muted-foreground font-mono">
                      {shortPrincipal}
                    </p>
                  </div>
                )}
              </div>

              {!editMode && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditMode(true)}
                  className="border-border/60 gap-1.5 shrink-0"
                  data-ocid="profile.edit.button"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Edit Profile
                </Button>
              )}
            </div>

            {/* Stats row */}
            <div className="relative flex gap-6 mt-5 pt-5 border-t border-border/50">
              {[
                { label: "My Notes", value: myNotes.length, icon: BookOpen },
                { label: "My Articles", value: myPosts.length, icon: Compass },
                {
                  label: "Bookings",
                  value: bookingRequests?.length ?? 0,
                  icon: Star,
                },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-primary" />
                  <span className="font-display font-bold text-foreground">
                    {value}
                  </span>
                  <span className="text-xs text-muted-foreground hidden sm:block">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-surface-2 border border-border/60 h-auto p-1 gap-1 w-full sm:w-auto flex-wrap">
              <TabsTrigger
                value="overview"
                className="text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                data-ocid="profile.overview.tab"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="notes"
                className="text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                data-ocid="profile.notes.tab"
              >
                My Notes ({myNotes.length})
              </TabsTrigger>
              <TabsTrigger
                value="articles"
                className="text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                data-ocid="profile.articles.tab"
              >
                My Articles ({myPosts.length})
              </TabsTrigger>
              <TabsTrigger
                value="bookings"
                className="text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                data-ocid="profile.bookings.tab"
              >
                Bookings ({bookingRequests?.length ?? 0})
              </TabsTrigger>
              {role === "admin" && (
                <TabsTrigger
                  value="payments"
                  className="text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5"
                  data-ocid="profile.payments.tab"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  Payments
                </TabsTrigger>
              )}
            </TabsList>

            {/* Overview */}
            <TabsContent value="overview" className="mt-6">
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  {
                    title: "Study Notes",
                    count: myNotes.length,
                    icon: BookOpen,
                    desc: "Notes you've contributed",
                    color: "text-teal",
                    bg: "bg-teal/10 border-teal/20",
                  },
                  {
                    title: "Guidance Articles",
                    count: myPosts.length,
                    icon: Compass,
                    desc: "Articles you've published",
                    color: "text-chart-4",
                    bg: "bg-chart-4/10 border-chart-4/20",
                  },
                  {
                    title: "Booking Requests",
                    count: bookingRequests?.length ?? 0,
                    icon: Star,
                    desc: "Active tutor sessions",
                    color: "text-primary",
                    bg: "bg-primary/10 border-primary/20",
                  },
                ].map(({ title, count, icon: Icon, desc, color, bg }) => (
                  <div
                    key={title}
                    className="p-5 rounded-xl bg-card border border-border/60"
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded-lg border flex items-center justify-center mb-3",
                        bg,
                      )}
                    >
                      <Icon className={cn("w-5 h-5", color)} />
                    </div>
                    <p className="font-display text-3xl font-bold text-foreground mb-1">
                      {count}
                    </p>
                    <p className="font-semibold text-foreground text-sm">
                      {title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {desc}
                    </p>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* My Notes */}
            <TabsContent value="notes" className="mt-6">
              {myNotes.length === 0 ? (
                <div
                  className="text-center py-16 rounded-xl bg-card border border-border/60"
                  data-ocid="profile.notes.empty_state"
                >
                  <BookOpen className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">
                    You haven't created any notes yet. Head to the Notes library
                    to contribute!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myNotes.map((note, i) => (
                    <div
                      key={note.id}
                      className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/60 group"
                      data-ocid={`profile.notes.item.${i + 1}`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground truncate">
                          {note.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {note.subject} · {formatTimestamp(note.timestamp)}
                        </p>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                        onClick={() => setDeleteNoteId(note.id)}
                        data-ocid={`profile.notes.delete_button.${i + 1}`}
                        aria-label="Delete note"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* My Articles */}
            <TabsContent value="articles" className="mt-6">
              {myPosts.length === 0 ? (
                <div
                  className="text-center py-16 rounded-xl bg-card border border-border/60"
                  data-ocid="profile.articles.empty_state"
                >
                  <Compass className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">
                    You haven't written any articles yet. Go to Guidance to
                    share your insights!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myPosts.map((post, i) => (
                    <div
                      key={post.id}
                      className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/60 group"
                      data-ocid={`profile.articles.item.${i + 1}`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground truncate">
                          {post.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatTimestamp(post.timestamp)}
                        </p>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                        onClick={() => setDeletePostId(post.id)}
                        data-ocid={`profile.articles.delete_button.${i + 1}`}
                        aria-label="Delete article"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Payments (admin only) */}
            {role === "admin" && (
              <TabsContent value="payments" className="mt-6">
                <div className="p-6 rounded-2xl bg-card border border-border/60">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-foreground">
                        Stripe Configuration
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Enable paid tutor sessions on ExamGuide
                      </p>
                    </div>
                  </div>

                  <Separator className="my-5 bg-border/50" />

                  {/* Status */}
                  {stripeConfigured ? (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-teal/8 border border-teal/25 mb-6">
                      <CheckCircle2 className="w-5 h-5 text-teal shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-teal">
                          Stripe is configured and active
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Students can now pay tutors directly through
                          ExamGuide.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 mb-6">
                      <div className="p-4 rounded-xl bg-chart-4/8 border border-chart-4/25 text-sm text-chart-4 font-medium mb-4">
                        Stripe is not yet configured. Add your keys below to
                        enable payments.
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
                          data-ocid="profile.stripe.secret_key.input"
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
                          data-ocid="profile.stripe.countries.input"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          ISO 3166-1 alpha-2 country codes, e.g. US, CA, GB, IN.
                        </p>
                      </div>

                      <Button
                        onClick={handleSaveStripe}
                        disabled={setStripeConfig.isPending}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                        data-ocid="profile.stripe.save.button"
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
                    Tutors on ExamGuide earn money when students book paid
                    sessions. Each tutor sets their hourly rate on their
                    profile. Configure your Stripe keys above to enable the
                    payment flow for all tutors.
                  </p>
                </div>
              </TabsContent>
            )}

            {/* Bookings */}
            <TabsContent value="bookings" className="mt-6">
              {!bookingRequests || bookingRequests.length === 0 ? (
                <div
                  className="text-center py-16 rounded-xl bg-card border border-border/60"
                  data-ocid="profile.bookings.empty_state"
                >
                  <Star className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">
                    No booking requests yet. Book a tutor from the Tutors
                    directory!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookingRequests.map((req: BookingRequest, i: number) => (
                    <div
                      key={req.id}
                      className="p-4 rounded-xl bg-card border border-border/60"
                      data-ocid={`profile.bookings.item.${i + 1}`}
                    >
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground text-sm">
                            Booking #{req.id}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTimestamp(req.timestamp)}
                          </p>
                        </div>
                        <BookingStatusBadge status={req.status} />
                      </div>
                      <p className="text-sm text-foreground/80 bg-surface-2 rounded-lg p-3 border border-border/50 mb-3">
                        {req.message}
                      </p>
                      {req.status === BookingStatus.pending && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="bg-teal/20 hover:bg-teal/30 text-teal border border-teal/30 gap-1.5"
                            onClick={() =>
                              handleUpdateBooking(
                                req.id,
                                BookingStatus.accepted,
                              )
                            }
                            data-ocid={`profile.bookings.confirm_button.${i + 1}`}
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-destructive/40 text-destructive hover:bg-destructive/10 gap-1.5"
                            onClick={() =>
                              handleUpdateBooking(
                                req.id,
                                BookingStatus.rejected,
                              )
                            }
                            data-ocid={`profile.bookings.delete_button.${i + 1}`}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Decline
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* Delete Note Confirmation */}
      <AlertDialog
        open={deleteNoteId !== null}
        onOpenChange={(o) => !o && setDeleteNoteId(null)}
      >
        <AlertDialogContent
          className="bg-card border-border/60"
          data-ocid="profile.delete_note.dialog"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              Delete Note?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This action cannot be undone. The note will be permanently
              removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="border-border/60"
              data-ocid="profile.delete_note.cancel_button"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-ocid="profile.delete_note.confirm_button"
              onClick={async () => {
                if (deleteNoteId !== null) {
                  try {
                    await deleteNote.mutateAsync(deleteNoteId);
                    toast.success("Note deleted");
                  } catch {
                    toast.error("Failed to delete");
                  }
                  setDeleteNoteId(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Post Confirmation */}
      <AlertDialog
        open={deletePostId !== null}
        onOpenChange={(o) => !o && setDeletePostId(null)}
      >
        <AlertDialogContent
          className="bg-card border-border/60"
          data-ocid="profile.delete_post.dialog"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              Delete Article?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This action cannot be undone. The article will be permanently
              removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="border-border/60"
              data-ocid="profile.delete_post.cancel_button"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-ocid="profile.delete_post.confirm_button"
              onClick={async () => {
                if (deletePostId !== null) {
                  try {
                    await deletePost.mutateAsync(deletePostId);
                    toast.success("Article deleted");
                  } catch {
                    toast.error("Failed to delete");
                  }
                  setDeletePostId(null);
                }
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
