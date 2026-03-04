import { Link } from "@tanstack/react-router";
import {
  BookOpen,
  Compass,
  Globe,
  GraduationCap,
  Heart,
  Users,
} from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  const hostname = encodeURIComponent(window.location.hostname);

  return (
    <footer className="border-t border-border/50 bg-navy/80 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary" />
              </div>
              <span className="font-display font-bold text-xl">
                <span className="text-gradient-amber">Exam</span>
                <span className="text-foreground">Guide</span>
              </span>
            </div>
            <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
              A global platform connecting students with expert tutors, curated
              study notes, and strategic guidance for every major exam
              worldwide.
            </p>
            <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
              <Globe className="w-3.5 h-3.5 text-teal" />
              <span>Serving students in 150+ countries</span>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="font-display font-semibold text-sm text-foreground mb-4 uppercase tracking-wider">
              Explore
            </h4>
            <ul className="space-y-2.5">
              {[
                { to: "/notes", label: "Study Notes", icon: BookOpen },
                { to: "/tutors", label: "Find Tutors", icon: Users },
                { to: "/guidance", label: "Guidance Articles", icon: Compass },
                { to: "/profile", label: "Your Profile", icon: GraduationCap },
              ].map(({ to, label, icon: Icon }) => (
                <li key={to}>
                  <Link
                    to={to}
                    data-ocid={`footer.${label.toLowerCase().replace(" ", "_")}.link`}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Exams */}
          <div>
            <h4 className="font-display font-semibold text-sm text-foreground mb-4 uppercase tracking-wider">
              Popular Exams
            </h4>
            <ul className="space-y-2.5">
              {["SAT", "GRE", "IELTS", "JEE", "UPSC", "GMAT"].map((exam) => (
                <li key={exam}>
                  <Link
                    to="/notes"
                    data-ocid={`footer.${exam.toLowerCase()}.link`}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {exam} Preparation
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border/50 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © {year}. Built with{" "}
            <Heart className="inline w-3 h-3 text-red-400 fill-red-400" /> using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${hostname}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
          <p className="text-xs text-muted-foreground">
            Empowering students globally — one exam at a time
          </p>
        </div>
      </div>
    </footer>
  );
}
