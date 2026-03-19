import { Button } from "@/components/ui/button";
import { ExternalLink, Megaphone, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useActor } from "../hooks/useActor";
import { usePlanInfo } from "../hooks/usePlanInfo";

const SESSION_KEY = "examguide_ad_dismissed";

interface AdBanner {
  id: number;
  company: string;
  tagline: string;
  ctaText: string;
  ctaUrl: string;
}

const SAMPLE_ADS: AdBanner[] = [
  {
    id: -1,
    company: "Unacademy",
    tagline: "India's largest learning platform",
    ctaText: "Explore Courses",
    ctaUrl: "https://unacademy.com",
  },
  {
    id: -2,
    company: "BYJU'S",
    tagline: "Learn better, score higher",
    ctaText: "Start Free",
    ctaUrl: "https://byjus.com",
  },
  {
    id: -3,
    company: "Khan Academy",
    tagline: "Free world-class education for anyone",
    ctaText: "Learn Now",
    ctaUrl: "https://khanacademy.org",
  },
];

export default function AdBannerStrip() {
  const { isPaid } = usePlanInfo();
  const { actor } = useActor();
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem(SESSION_KEY) === "1",
  );
  const [ads, setAds] = useState<AdBanner[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    if (!actor) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const a = actor as any;
    if (typeof a.getAdContent !== "function") {
      setAds(SAMPLE_ADS);
      return;
    }
    try {
      a.getAdContent()
        .then((result: AdBanner[]) => {
          setAds(result && result.length > 0 ? result : SAMPLE_ADS);
        })
        .catch(() => setAds(SAMPLE_ADS));
    } catch {
      setAds(SAMPLE_ADS);
    }
  }, [actor]);

  // Auto-rotate every 6s
  useEffect(() => {
    if (ads.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIdx((i) => (i + 1) % ads.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [ads.length]);

  if (isPaid || dismissed || ads.length === 0) return null;

  const ad = ads[currentIdx];

  const handleDismiss = () => {
    sessionStorage.setItem(SESSION_KEY, "1");
    setDismissed(true);
  };

  return (
    <div
      className="w-full mt-8 rounded-2xl border border-amber/30 bg-amber/5 px-4 py-3 flex items-center gap-4"
      data-ocid="ad_banner.panel"
    >
      <div className="shrink-0 w-8 h-8 rounded-lg bg-amber/15 border border-amber/30 flex items-center justify-center">
        <Megaphone className="w-4 h-4 text-amber" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-amber uppercase tracking-wide">
            Ad
          </span>
          <span className="font-semibold text-sm text-foreground">
            {ad.company}
          </span>
          <span className="text-sm text-muted-foreground hidden sm:inline">
            —
          </span>
          <span className="text-sm text-muted-foreground hidden sm:inline">
            {ad.tagline}
          </span>
        </div>
        <p className="text-xs text-muted-foreground sm:hidden mt-0.5">
          {ad.tagline}
        </p>
      </div>
      {ads.length > 1 && (
        <div className="hidden sm:flex items-center gap-1.5 shrink-0">
          {ads.map((dotAd, i) => (
            <button
              key={`dot-${dotAd.id}`}
              type="button"
              onClick={() => setCurrentIdx(i)}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                i === currentIdx ? "bg-amber" : "bg-amber/30"
              }`}
              aria-label={`Ad ${i + 1}`}
            />
          ))}
        </div>
      )}
      <a
        href={ad.ctaUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0"
        data-ocid="ad_banner.button"
      >
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-amber/40 text-amber hover:bg-amber/10 text-xs"
        >
          {ad.ctaText}
          <ExternalLink className="w-3 h-3" />
        </Button>
      </a>
      <button
        type="button"
        onClick={handleDismiss}
        className="shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        aria-label="Dismiss ad"
        data-ocid="ad_banner.close_button"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
