import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookMarked,
  BookOpen,
  CheckCircle,
  Compass,
  FileText,
  Globe2,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import type { Variants } from "motion/react";
import { SAMPLE_EXAM_CATEGORIES } from "../data/sampleData";
import {
  useExamCategories,
  useStudyNotes,
  useTutorProfiles,
} from "../hooks/useQueries";

const FEATURES = [
  {
    icon: BookOpen,
    title: "Curated Study Notes",
    description:
      "Access thousands of high-quality notes crafted by top scorers. Organized by exam, subject, and topic for efficient revision.",
    color: "text-teal",
    bgColor: "bg-teal/10 border-teal/20",
    link: "/notes",
  },
  {
    icon: Users,
    title: "Expert Tutors & Mentors",
    description:
      "Connect with verified tutors who have aced the exams you're targeting. Book one-on-one sessions tailored to your weaknesses.",
    color: "text-primary",
    bgColor: "bg-primary/10 border-primary/20",
    link: "/tutors",
  },
  {
    icon: Compass,
    title: "Strategic Guidance",
    description:
      "In-depth articles, exam breakdowns, and proven strategies from students who scored in the 99th percentile.",
    color: "text-chart-4",
    bgColor: "bg-chart-4/10 border-chart-4/20",
    link: "/guidance",
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const EXAM_COLORS = [
  "bg-teal/15 text-teal border-teal/25",
  "bg-primary/15 text-primary border-primary/25",
  "bg-chart-4/15 text-chart-4 border-chart-4/25",
  "bg-chart-2/15 text-chart-2 border-chart-2/25",
  "bg-chart-5/15 text-chart-5 border-chart-5/25",
  "bg-teal/15 text-teal border-teal/25",
];

export default function LandingPage() {
  const { data: tutors, isLoading: tutorsLoading } = useTutorProfiles();
  const { data: notes, isLoading: notesLoading } = useStudyNotes();
  const { data: backendCategories, isLoading: categoriesLoading } =
    useExamCategories();

  const categories =
    backendCategories && backendCategories.length > 0
      ? backendCategories
      : SAMPLE_EXAM_CATEGORIES;

  const dynamicStats = [
    {
      value: tutors?.length ?? 0,
      label: "Tutors & Mentors",
      icon: Users,
      isLoading: tutorsLoading,
    },
    {
      value: notes?.length ?? 0,
      label: "Study Notes",
      icon: FileText,
      isLoading: notesLoading,
    },
    {
      value: backendCategories?.length ?? 0,
      label: "Exam Categories",
      icon: Globe2,
      isLoading: categoriesLoading,
    },
  ];

  return (
    <div className="overflow-hidden">
      {/* ── Hero Section ─────────────────────────────────────── */}
      <section
        className="relative min-h-[92vh] flex items-center bg-mesh"
        data-ocid="hero.section"
      >
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage:
              "url('/assets/generated/hero-bg.dim_1600x900.jpg')",
          }}
          aria-hidden="true"
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/40 to-background"
          aria-hidden="true"
        />

        {/* Floating accents */}
        <div
          className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full blur-3xl opacity-10 animate-float"
          style={{ background: "oklch(0.55 0.12 195)" }}
          aria-hidden="true"
        />
        <div
          className="absolute bottom-1/3 left-1/4 w-48 h-48 rounded-full blur-3xl opacity-8 animate-float"
          style={{ animationDelay: "2s", background: "oklch(0.78 0.155 67)" }}
          aria-hidden="true"
        />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="max-w-4xl"
            initial="hidden"
            animate="show"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants}>
              <Badge
                variant="outline"
                className="mb-6 border-primary/40 bg-primary/10 text-primary px-4 py-1.5 text-sm font-medium"
              >
                <Zap className="w-3.5 h-3.5 mr-1.5" />
                Open platform for exam prep worldwide
              </Badge>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-5xl sm:text-6xl md:text-7xl font-display font-bold leading-[1.05] mb-6"
            >
              Your Global
              <br />
              <span className="text-gradient-amber">Exam Success</span>
              <br />
              Starts Here
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-lg sm:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed"
            >
              Access expert study notes, connect with top-scoring tutors, and
              get strategic guidance for any exam — SAT, GRE, IELTS, JEE, UPSC,
              and 25+ more. One platform for your entire exam journey.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-wrap gap-4"
            >
              <Button
                size="lg"
                asChild
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow font-semibold px-8"
                data-ocid="hero.explore.primary_button"
              >
                <Link to="/notes">
                  Start Studying
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-border/60 hover:border-teal/50 hover:bg-teal/5 font-semibold px-8"
                data-ocid="hero.tutors.secondary_button"
              >
                <Link to="/tutors">Find a Tutor</Link>
              </Button>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="flex flex-wrap gap-x-6 gap-y-2 mt-8"
            >
              {[
                "Free to browse",
                "No signup to read",
                "Expert-verified content",
              ].map((item) => (
                <span
                  key={item}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground"
                >
                  <CheckCircle className="w-3.5 h-3.5 text-teal" />
                  {item}
                </span>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats Band ───────────────────────────────────────── */}
      <section className="relative z-10 -mt-px border-y border-border/50 bg-surface-1/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            className="grid grid-cols-3 gap-6"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            {dynamicStats.map(({ value, label, icon: Icon, isLoading }) => (
              <motion.div
                key={label}
                variants={itemVariants}
                className="flex flex-col items-center gap-2 text-center"
                data-ocid="stats.section"
              >
                <Icon className="w-5 h-5 text-primary" />
                {isLoading ? (
                  <Skeleton className="h-9 w-16 rounded-md" />
                ) : (
                  <span className="font-display text-3xl font-bold text-gradient-amber">
                    {value}
                  </span>
                )}
                <span className="text-sm text-muted-foreground">{label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Exam Categories ──────────────────────────────────── */}
      <section className="py-20" data-ocid="exams.section">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Badge
              variant="outline"
              className="mb-4 border-teal/40 bg-teal/10 text-teal"
            >
              <BookMarked className="w-3.5 h-3.5 mr-1.5" />
              Exam Categories
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">
              Prep for Any Exam,{" "}
              <span className="text-gradient-teal">Anywhere in the World</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              From competitive engineering entrances to international language
              certifications — we have resources for every major exam.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            {categories.map((cat, i) => (
              <motion.div key={cat.id} variants={itemVariants}>
                <Link
                  to="/notes"
                  data-ocid={`exams.item.${i + 1}`}
                  className={cn(
                    "flex flex-col items-center gap-3 p-4 rounded-xl border bg-card text-center",
                    "transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover",
                    "cursor-pointer group",
                  )}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-lg border flex items-center justify-center font-display font-bold text-sm",
                      EXAM_COLORS[i % EXAM_COLORS.length],
                    )}
                  >
                    {cat.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-display font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                      {cat.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {cat.description}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          <div className="text-center mt-8">
            <Button
              variant="outline"
              asChild
              data-ocid="exams.view_all.button"
              className="border-border/60 hover:border-primary/50"
            >
              <Link to="/notes">
                View All Exams
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section className="py-20 bg-mesh" data-ocid="features.section">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Badge
              variant="outline"
              className="mb-4 border-primary/40 bg-primary/10 text-primary"
            >
              <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
              Everything You Need
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">
              Three Pillars of{" "}
              <span className="text-gradient-amber">Exam Success</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              ExamGuide combines knowledge, expertise, and strategy into one
              seamless platform.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-6"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            {FEATURES.map(
              ({ icon: Icon, title, description, color, bgColor, link }, i) => (
                <motion.div key={title} variants={itemVariants}>
                  <Link
                    to={link}
                    data-ocid={`features.item.${i + 1}`}
                    className="block group"
                  >
                    <div className="h-full p-7 rounded-2xl bg-card border border-border/60 bg-card-hover relative overflow-hidden">
                      {/* Subtle corner glow */}
                      <div
                        className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity"
                        style={{ background: "currentColor" }}
                      />
                      <div
                        className={cn(
                          "w-12 h-12 rounded-xl border flex items-center justify-center mb-5",
                          bgColor,
                        )}
                      >
                        <Icon className={cn("w-6 h-6", color)} />
                      </div>
                      <h3 className="font-display text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                        {title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-5">
                        {description}
                      </p>
                      <span
                        className={cn(
                          "flex items-center gap-1.5 text-sm font-medium",
                          color,
                        )}
                      >
                        Explore
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ),
            )}
          </motion.div>
        </div>
      </section>

      {/* ── CTA Section ──────────────────────────────────────── */}
      <section
        className="py-20 border-t border-border/50"
        data-ocid="cta.section"
      >
        <div className="container mx-auto px-4">
          <motion.div
            className="relative max-w-3xl mx-auto text-center rounded-3xl p-12 overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.20 0.04 195 / 0.8), oklch(0.18 0.03 240 / 0.8))",
              border: "1px solid oklch(0.55 0.12 195 / 0.3)",
            }}
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div
              className="absolute -top-20 -right-20 w-60 h-60 rounded-full blur-3xl opacity-15"
              style={{ background: "oklch(0.78 0.155 67)" }}
              aria-hidden="true"
            />
            <div
              className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full blur-3xl opacity-10"
              style={{ background: "oklch(0.55 0.12 195)" }}
              aria-hidden="true"
            />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4 text-foreground">
                Ready to Ace Your Exam?
              </h2>
              <p className="text-muted-foreground mb-8 text-lg max-w-xl mx-auto">
                Join thousands of students who transformed their scores with
                ExamGuide's proven resources and expert guidance.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button
                  size="lg"
                  asChild
                  className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow font-semibold px-8"
                  data-ocid="cta.get_started.primary_button"
                >
                  <Link to="/notes">
                    Get Started Free
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="border-teal/40 hover:bg-teal/10 text-foreground font-semibold px-8"
                  data-ocid="cta.find_tutor.secondary_button"
                >
                  <Link to="/tutors">Browse Tutors</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
