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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import type { Principal } from "@icp-sdk/core/principal";
import {
  BookOpen,
  Clock,
  CreditCard,
  DollarSign,
  Filter,
  GraduationCap,
  Info,
  Loader2,
  MessageCircle,
  Plus,
  Search,
  Send,
  Star,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { Review, TutorMentorProfile } from "../backend.d";
import { SAMPLE_EXAM_CATEGORIES } from "../data/sampleData";
import { formatTimestamp } from "../data/sampleData";
import { useCreateCheckoutSession } from "../hooks/useCheckout";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  PLATFORM_FEE_PERCENT,
  useCreateBookingRequest,
  useCreateReview,
  useCreateTutorProfile,
  useExamCategories,
  useRecordTransaction,
  useReviewsForTutor,
  useTutorProfiles,
} from "../hooks/useQueries";

// Session types with multipliers on hourlyRate
const SESSION_TYPES = [
  { value: "1hr", label: "1-Hour Session", multiplier: 1 },
  { value: "2hr", label: "2-Hour Session", multiplier: 2 },
  { value: "plan", label: "Study Plan Review", multiplier: 1.5 },
  { value: "mock", label: "Mock Exam + Feedback", multiplier: 2.5 },
] as const;

type SessionTypeValue = (typeof SESSION_TYPES)[number]["value"];

function StarRating({
  rating,
  size = "sm",
}: { rating: number; size?: "sm" | "md" }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            size === "sm" ? "w-3.5 h-3.5" : "w-5 h-5",
            i <= rating
              ? "text-primary fill-primary"
              : "text-muted-foreground/40",
          )}
        />
      ))}
    </div>
  );
}

function TutorReviews({ tutor }: { tutor: TutorMentorProfile }) {
  const { data: reviews = [] } = useReviewsForTutor(tutor.user as Principal);
  const avg =
    reviews.length > 0
      ? reviews.reduce((s: number, r: Review) => s + r.rating, 0) /
        reviews.length
      : 0;

  if (reviews.length === 0)
    return (
      <p className="text-sm text-muted-foreground italic">
        No reviews yet — be the first!
      </p>
    );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-3xl font-display font-bold text-primary">
          {avg.toFixed(1)}
        </span>
        <div>
          <StarRating rating={Math.round(avg)} size="md" />
          <p className="text-xs text-muted-foreground mt-0.5">
            {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
          </p>
        </div>
      </div>
      <div className="space-y-3">
        {reviews.slice(0, 5).map((r: Review) => (
          <div
            key={r.id}
            className="p-3 rounded-lg bg-surface-2 border border-border/50"
          >
            <div className="flex items-center justify-between mb-1">
              <StarRating rating={r.rating} />
              <span className="text-xs text-muted-foreground">
                {formatTimestamp(r.timestamp)}
              </span>
            </div>
            <p className="text-sm text-foreground/90">{r.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TutorsPage() {
  const { identity } = useInternetIdentity();
  const isLoggedIn = !!identity && !identity.getPrincipal().isAnonymous();

  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterExam, setFilterExam] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTutor, setSelectedTutor] = useState<TutorMentorProfile | null>(
    null,
  );
  const [createProfileOpen, setCreateProfileOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [bookingMessage, setBookingMessage] = useState("");
  const [sessionType, setSessionType] = useState<SessionTypeValue>("1hr");
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);

  // Profile creation form
  const [profileName, setProfileName] = useState("");
  const [profileBio, setProfileBio] = useState("");
  const [profileSubjects, setProfileSubjects] = useState("");
  const [profileAvailability, setProfileAvailability] = useState("");
  const [profileRate, setProfileRate] = useState("");
  const [profileIsMentor, setProfileIsMentor] = useState(false);
  const [profileExamIds, setProfileExamIds] = useState("");

  const { data: backendProfiles, isLoading } = useTutorProfiles();
  const { data: backendCategories } = useExamCategories();

  const createTutor = useCreateTutorProfile();
  const createBooking = useCreateBookingRequest();
  const createReview = useCreateReview();
  const createCheckout = useCreateCheckoutSession();
  const recordTx = useRecordTransaction();

  // Calculate price based on session type and tutor's hourly rate
  const selectedSession = SESSION_TYPES.find((s) => s.value === sessionType)!;
  const hasHourlyRate =
    selectedTutor?.hourlyRate != null && selectedTutor.hourlyRate > 0;
  const sessionPriceDollars = hasHourlyRate
    ? Math.round(
        selectedTutor!.hourlyRate! * selectedSession.multiplier * 100,
      ) / 100
    : 0;
  const sessionPriceCents = Math.round(sessionPriceDollars * 100);

  const categories =
    backendCategories && backendCategories.length > 0
      ? backendCategories
      : SAMPLE_EXAM_CATEGORIES;

  const allProfiles = backendProfiles ?? [];

  const filteredProfiles = useMemo(() => {
    return allProfiles.filter((p) => {
      if (filterRole !== "all" && filterRole === "mentor" && !p.isMentor)
        return false;
      if (filterRole !== "all" && filterRole === "tutor" && p.isMentor)
        return false;
      if (filterExam !== "all") {
        const examIds = Array.from(p.exams);
        if (!examIds.includes(Number(filterExam))) return false;
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.bio.toLowerCase().includes(q) ||
          p.subjects.some((s: string) => s.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [allProfiles, filterRole, filterExam, searchQuery]);

  const getExamNames = (examIds: Uint32Array) => {
    return Array.from(examIds)
      .map((id) => categories.find((c) => c.id === id)?.name)
      .filter(Boolean)
      .join(", ");
  };

  const handleBook = async () => {
    if (!isLoggedIn) {
      toast.error("Please log in to send a request");
      return;
    }
    if (!selectedTutor || !bookingMessage.trim()) {
      toast.error("Please add a message");
      return;
    }

    // If tutor has an hourly rate, use Stripe checkout
    if (hasHourlyRate) {
      try {
        const successUrlSuffix = `?amount=${sessionPriceCents}&tutorName=${encodeURIComponent(selectedTutor.name)}&sessionType=${encodeURIComponent(selectedSession.label)}`;
        const session = await createCheckout.mutateAsync({
          items: [
            {
              name: `${selectedSession.label} with ${selectedTutor.name}`,
              description: bookingMessage.slice(0, 200),
              amount: sessionPriceCents,
              quantity: 1,
            },
          ],
          successUrlSuffix,
        });
        // best-effort record — don't await, don't block checkout
        recordTx.mutate({
          tutorName: selectedTutor.name,
          sessionType: selectedSession.label,
          totalAmount: sessionPriceCents,
        });
        window.location.href = session.url;
      } catch {
        toast.error("Failed to start payment. Please try again.");
      }
      return;
    }

    // No hourly rate — send plain booking request
    try {
      await createBooking.mutateAsync({
        tutor: selectedTutor.user as Principal,
        message: bookingMessage,
      });
      toast.success("Booking request sent!");
      setBookingOpen(false);
      setBookingMessage("");
    } catch (err) {
      console.error("Booking request error:", err);
      toast.error("Failed to send request. Please try again.");
    }
  };

  const handleReview = async () => {
    if (!selectedTutor || !reviewText.trim()) {
      toast.error("Please write a review");
      return;
    }
    try {
      await createReview.mutateAsync({
        tutor: selectedTutor.user as Principal,
        rating: reviewRating,
        text: reviewText,
      });
      toast.success("Review submitted!");
      setReviewOpen(false);
      setReviewText("");
    } catch {
      toast.error("Failed to submit review");
    }
  };

  const handleCreateProfile = async () => {
    if (
      !profileName ||
      !profileBio ||
      !profileSubjects ||
      !profileAvailability
    ) {
      toast.error("Please fill all required fields");
      return;
    }
    try {
      const subjects = profileSubjects.split(",").map((s) => s.trim());
      const examIdsParsed = profileExamIds
        ? new Uint32Array(
            profileExamIds.split(",").map((s) => Number.parseInt(s.trim())),
          )
        : new Uint32Array([]);
      await createTutor.mutateAsync({
        name: profileName,
        subjects,
        exams: examIdsParsed,
        availability: profileAvailability,
        hourlyRate: profileRate ? Number.parseFloat(profileRate) : null,
        bio: profileBio,
        isMentor: profileIsMentor,
      });
      toast.success("Profile created!");
      setCreateProfileOpen(false);
    } catch {
      toast.error("Failed to create profile");
    }
  };

  return (
    <div className="min-h-screen py-10">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <Badge
                variant="outline"
                className="mb-3 border-primary/40 bg-primary/10 text-primary"
              >
                <Users className="w-3.5 h-3.5 mr-1.5" />
                Expert Tutors & Mentors
              </Badge>
              <h1 className="text-4xl font-display font-bold text-foreground">
                Find Your Perfect Guide
              </h1>
              <p className="text-muted-foreground mt-1.5">
                Connect with verified tutors and mentors worldwide
              </p>
            </div>
            {isLoggedIn && (
              <Button
                onClick={() => setCreateProfileOpen(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0 gap-2"
                data-ocid="tutors.create_profile.button"
              >
                <Plus className="w-4 h-4" />
                Create My Profile
              </Button>
            )}
          </div>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, subject..."
              className="pl-9 bg-surface-2 border-border/60"
              data-ocid="tutors.search_input"
            />
          </div>
          <ToggleGroup
            type="single"
            value={filterRole}
            onValueChange={(v) => setFilterRole(v || "all")}
            className="border border-border/60 rounded-lg p-1 bg-surface-2"
            data-ocid="tutors.role.toggle"
          >
            <ToggleGroupItem
              value="all"
              className="text-xs px-3 py-1.5 rounded"
            >
              All
            </ToggleGroupItem>
            <ToggleGroupItem
              value="tutor"
              className="text-xs px-3 py-1.5 rounded"
            >
              Tutors
            </ToggleGroupItem>
            <ToggleGroupItem
              value="mentor"
              className="text-xs px-3 py-1.5 rounded"
            >
              Mentors
            </ToggleGroupItem>
          </ToggleGroup>
          <Select value={filterExam} onValueChange={setFilterExam}>
            <SelectTrigger
              className="w-full sm:w-44 bg-surface-2 border-border/60"
              data-ocid="tutors.exam.select"
            >
              <Filter className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue placeholder="All Exams" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Exams</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tutor Grid */}
        {isLoading ? (
          <div
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
            data-ocid="tutors.loading_state"
          >
            {Array.from({ length: 6 }, (_, i) => `sk-${i}`).map((key) => (
              <div
                key={key}
                className="p-5 rounded-xl bg-card border border-border/60"
              >
                <div className="flex gap-3 mb-4">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div
            className="text-center py-20 rounded-xl bg-card border border-border/60"
            data-ocid="tutors.empty_state"
          >
            <Users className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="font-display text-lg font-semibold mb-2">
              {searchQuery || filterRole !== "all" || filterExam !== "all"
                ? "No tutors found"
                : "No tutors or mentors yet"}
            </h3>
            <p className="text-muted-foreground text-sm mb-6">
              {searchQuery || filterRole !== "all" || filterExam !== "all"
                ? "Try adjusting your filters or search query"
                : "No tutors or mentors have signed up yet. Be the first to create a profile!"}
            </p>
            {!searchQuery &&
              filterRole === "all" &&
              filterExam === "all" &&
              (isLoggedIn ? (
                <Button
                  onClick={() => setCreateProfileOpen(true)}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                  data-ocid="tutors.empty_state.button"
                >
                  <Plus className="w-4 h-4" />
                  Create My Profile
                </Button>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  Sign in to create your profile
                </p>
              ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProfiles.map((tutor, i) => (
              <motion.div
                key={tutor.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
                data-ocid={`tutors.item.${i + 1}`}
              >
                <button
                  type="button"
                  className="group h-full w-full text-left p-5 rounded-xl bg-card border border-border/60 cursor-pointer bg-card-hover"
                  onClick={() => setSelectedTutor(tutor)}
                >
                  <div className="flex items-start gap-3 mb-4">
                    <Avatar className="w-12 h-12 border-2 border-primary/30">
                      <AvatarFallback className="bg-primary/20 text-primary font-display font-bold">
                        {tutor.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-display font-bold text-foreground group-hover:text-primary transition-colors truncate">
                          {tutor.name}
                        </h3>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs shrink-0",
                            tutor.isMentor
                              ? "border-chart-4/40 bg-chart-4/10 text-chart-4"
                              : "border-teal/40 bg-teal/10 text-teal",
                          )}
                        >
                          {tutor.isMentor ? (
                            <GraduationCap className="w-3 h-3 mr-1" />
                          ) : (
                            <BookOpen className="w-3 h-3 mr-1" />
                          )}
                          {tutor.isMentor ? "Mentor" : "Tutor"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <StarRating rating={4} />
                        <span className="text-xs text-muted-foreground">
                          (4.8)
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4 leading-relaxed">
                    {tutor.bio}
                  </p>

                  <div className="space-y-2 border-t border-border/50 pt-3">
                    <div className="flex flex-wrap gap-1.5">
                      {tutor.subjects.slice(0, 3).map((s: string) => (
                        <Badge
                          key={s}
                          variant="secondary"
                          className="text-xs bg-surface-3 text-muted-foreground"
                        >
                          {s}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {tutor.availability.slice(0, 30)}
                        {tutor.availability.length > 30 ? "..." : ""}
                      </span>
                      {tutor.hourlyRate != null && (
                        <span className="flex items-center gap-1 text-primary font-semibold">
                          <DollarSign className="w-3 h-3" />${tutor.hourlyRate}
                          /hr
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Tutor Profile Sheet */}
      <Sheet
        open={!!selectedTutor}
        onOpenChange={(o) => !o && setSelectedTutor(null)}
      >
        <SheetContent
          side="right"
          className="w-full sm:max-w-xl bg-card border-border/60 overflow-y-auto p-0"
          data-ocid="tutors.sheet"
        >
          {selectedTutor && (
            <>
              <div className="p-6 bg-surface-2 border-b border-border/60">
                <SheetHeader>
                  <div className="flex items-center gap-4 mb-3">
                    <Avatar className="w-16 h-16 border-2 border-primary/30">
                      <AvatarFallback className="bg-primary/20 text-primary font-display font-bold text-xl">
                        {selectedTutor.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <SheetTitle className="font-display text-2xl text-foreground text-left">
                        {selectedTutor.name}
                      </SheetTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs",
                            selectedTutor.isMentor
                              ? "border-chart-4/40 bg-chart-4/10 text-chart-4"
                              : "border-teal/40 bg-teal/10 text-teal",
                          )}
                        >
                          {selectedTutor.isMentor ? "Mentor" : "Tutor"}
                        </Badge>
                        {selectedTutor.hourlyRate != null && (
                          <span className="text-sm text-primary font-semibold">
                            ${selectedTutor.hourlyRate}/hr
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <SheetDescription className="text-foreground/90 text-sm leading-relaxed text-left">
                    {selectedTutor.bio}
                  </SheetDescription>
                </SheetHeader>
              </div>

              <div className="p-6 space-y-6">
                {/* Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 rounded-lg bg-surface-2 border border-border/50">
                    <p className="text-muted-foreground text-xs mb-1 font-medium uppercase tracking-wide">
                      Subjects
                    </p>
                    <p className="text-foreground">
                      {selectedTutor.subjects.join(", ")}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-surface-2 border border-border/50">
                    <p className="text-muted-foreground text-xs mb-1 font-medium uppercase tracking-wide">
                      Exams
                    </p>
                    <p className="text-foreground">
                      {getExamNames(selectedTutor.exams)}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-surface-2 border border-border/50 col-span-2">
                    <p className="text-muted-foreground text-xs mb-1 font-medium uppercase tracking-wide">
                      Availability
                    </p>
                    <p className="text-foreground">
                      {selectedTutor.availability}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                {isLoggedIn ? (
                  <div className="flex gap-3">
                    <Button
                      className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                      onClick={() => setBookingOpen(true)}
                      data-ocid="tutors.book.primary_button"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Book / Contact
                    </Button>
                    <Button
                      variant="outline"
                      className="border-border/60 gap-2"
                      onClick={() => setReviewOpen(true)}
                      data-ocid="tutors.review.secondary_button"
                    >
                      <Star className="w-4 h-4" />
                      Review
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-2 bg-surface-2 rounded-lg border border-border/50">
                    Log in to send a booking request or leave a review
                  </p>
                )}

                <Separator className="bg-border/50" />

                {/* Reviews */}
                <div>
                  <h4 className="font-display font-semibold text-foreground mb-4">
                    Student Reviews
                  </h4>
                  <TutorReviews tutor={selectedTutor} />
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Booking Dialog */}
      <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
        <DialogContent
          className="max-w-md bg-card border-border/60"
          data-ocid="tutors.booking.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              Book {selectedTutor?.name}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              {hasHourlyRate
                ? "Choose a session type and pay securely via Stripe"
                : "Send a message explaining what you need help with"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {/* Session Type (only if tutor has an hourly rate) */}
            {hasHourlyRate && (
              <>
                <div>
                  <Label className="text-sm font-medium text-foreground mb-1.5 block">
                    Session Type
                  </Label>
                  <Select
                    value={sessionType}
                    onValueChange={(v) => setSessionType(v as SessionTypeValue)}
                  >
                    <SelectTrigger
                      className="bg-surface-2 border-border/60"
                      data-ocid="tutors.booking.session_type.select"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SESSION_TYPES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price display */}
                <div
                  className="flex items-center justify-between p-3 rounded-lg bg-primary/8 border border-primary/20"
                  data-ocid="tutors.booking.price.card"
                >
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <DollarSign className="w-4 h-4 text-primary" />
                    <span>{selectedSession.label}</span>
                  </div>
                  <span className="font-display font-bold text-primary text-lg">
                    ${sessionPriceDollars.toFixed(2)}
                  </span>
                </div>

                {/* Fee disclosure banner */}
                <div
                  className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/25 text-sm space-y-1"
                  data-ocid="tutors.booking.fee_disclosure.card"
                >
                  <div className="flex items-center gap-2 font-semibold text-amber-600 dark:text-amber-400">
                    <Info className="w-4 h-4 shrink-0" />
                    Platform Fee Applies
                  </div>
                  <div className="text-muted-foreground text-xs space-y-0.5 pl-6">
                    <div className="flex justify-between">
                      <span>Total you pay</span>
                      <span className="font-medium text-foreground">
                        ${sessionPriceDollars.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>ExamGuide fee ({PLATFORM_FEE_PERCENT}%)</span>
                      <span className="font-medium text-amber-600 dark:text-amber-400">
                        $
                        {(
                          (sessionPriceDollars * PLATFORM_FEE_PERCENT) /
                          100
                        ).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-amber-500/20 pt-0.5 mt-0.5">
                      <span>Tutor receives</span>
                      <span className="font-medium text-green-600 dark:text-green-400">
                        $
                        {(
                          (sessionPriceDollars * (100 - PLATFORM_FEE_PERCENT)) /
                          100
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div>
              <Label className="text-sm font-medium text-foreground mb-1.5 block">
                Your Message
              </Label>
              <Textarea
                value={bookingMessage}
                onChange={(e) => setBookingMessage(e.target.value)}
                placeholder="Hi! I'm preparing for SAT in 3 months and struggling with the Math section. I'd love to discuss a study plan..."
                rows={5}
                className="bg-surface-2 border-border/60"
                data-ocid="tutors.booking.textarea"
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-border/60"
                onClick={() => setBookingOpen(false)}
                data-ocid="tutors.booking.cancel_button"
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                onClick={handleBook}
                disabled={createBooking.isPending || createCheckout.isPending}
                data-ocid="tutors.booking.pay.primary_button"
              >
                {createBooking.isPending || createCheckout.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : hasHourlyRate ? (
                  <CreditCard className="w-4 h-4" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {hasHourlyRate
                  ? `Book & Pay ($${sessionPriceDollars.toFixed(2)})`
                  : "Send Request"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent
          className="max-w-md bg-card border-border/60"
          data-ocid="tutors.review.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              Leave a Review
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              Share your experience with {selectedTutor?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">
                Rating
              </Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((r) => (
                  <button
                    type="button"
                    key={r}
                    onClick={() => setReviewRating(r)}
                    className="focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                    aria-label={`${r} stars`}
                  >
                    <Star
                      className={cn(
                        "w-7 h-7 transition-colors",
                        r <= reviewRating
                          ? "text-primary fill-primary"
                          : "text-muted-foreground/40 hover:text-primary/60",
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-foreground mb-1.5 block">
                Your Review
              </Label>
              <Textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share what you learned and how this tutor helped you..."
                rows={4}
                className="bg-surface-2 border-border/60"
                data-ocid="tutors.review.textarea"
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-border/60"
                onClick={() => setReviewOpen(false)}
                data-ocid="tutors.review.cancel_button"
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleReview}
                disabled={createReview.isPending}
                data-ocid="tutors.review.submit_button"
              >
                {createReview.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Submit Review
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Profile Dialog */}
      <Dialog open={createProfileOpen} onOpenChange={setCreateProfileOpen}>
        <DialogContent
          className="max-w-lg bg-card border-border/60 max-h-[85vh] overflow-y-auto"
          data-ocid="tutors.profile.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              Create Tutor / Mentor Profile
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              Share your expertise and connect with students
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label className="text-sm font-medium text-foreground mb-1.5 block">
                Full Name *
              </Label>
              <Input
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="Dr. Jane Smith"
                className="bg-surface-2 border-border/60"
                data-ocid="tutors.profile.input"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-foreground mb-1.5 block">
                Bio *
              </Label>
              <Textarea
                value={profileBio}
                onChange={(e) => setProfileBio(e.target.value)}
                placeholder="Describe your background, experience, and teaching approach..."
                rows={4}
                className="bg-surface-2 border-border/60"
                data-ocid="tutors.profile.textarea"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-foreground mb-1.5 block">
                Subjects * (comma-separated)
              </Label>
              <Input
                value={profileSubjects}
                onChange={(e) => setProfileSubjects(e.target.value)}
                placeholder="Mathematics, Physics, English"
                className="bg-surface-2 border-border/60"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-foreground mb-1.5 block">
                Exam Category IDs (comma-separated numbers)
              </Label>
              <Input
                value={profileExamIds}
                onChange={(e) => setProfileExamIds(e.target.value)}
                placeholder="1, 2, 6"
                className="bg-surface-2 border-border/60"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {categories.map((c) => `${c.id}=${c.name}`).join(", ")}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-foreground mb-1.5 block">
                Availability *
              </Label>
              <Input
                value={profileAvailability}
                onChange={(e) => setProfileAvailability(e.target.value)}
                placeholder="Weekdays 6pm-9pm EST"
                className="bg-surface-2 border-border/60"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-foreground mb-1.5 block">
                Hourly Rate (USD, optional)
              </Label>
              <Input
                type="number"
                value={profileRate}
                onChange={(e) => setProfileRate(e.target.value)}
                placeholder="75"
                className="bg-surface-2 border-border/60"
              />
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-2 border border-border/50">
              <input
                type="checkbox"
                id="is-mentor"
                checked={profileIsMentor}
                onChange={(e) => setProfileIsMentor(e.target.checked)}
                className="w-4 h-4 accent-primary"
                data-ocid="tutors.profile.checkbox"
              />
              <Label
                htmlFor="is-mentor"
                className="text-sm text-foreground cursor-pointer"
              >
                I'm a mentor (not just a subject tutor — I provide career
                guidance too)
              </Label>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 border-border/60"
                onClick={() => setCreateProfileOpen(false)}
                data-ocid="tutors.profile.cancel_button"
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleCreateProfile}
                disabled={createTutor.isPending}
                data-ocid="tutors.profile.submit_button"
              >
                {createTutor.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Create Profile
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
