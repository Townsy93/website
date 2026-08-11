import {
  BarChart3,
  Building2,
  Calendar,
  CircleDollarSign,
  Crosshair,
  Database,
  Eye,
  Factory,
  FileText,
  GraduationCap,
  Heart,
  HeartHandshake,
  Layout,
  Map,
  MapPin,
  MessageCircle,
  Megaphone,
  Monitor,
  Plug,
  RefreshCw,
  Search,
  Sparkle,
  Sparkles,
  UserCheck,
  Video,
  Wind,
  Workflow,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { ComponentType } from "react";
import {
  AgenciesIcon,
  BuildIcon,
  DiscoverIcon,
  FinanceIcon,
  LandSurveyingIcon,
  NonProfitsIcon,
  PropertyDevIcon,
  SaasIcon,
  ScaleIcon,
} from "./BrandIcons";

type AnyIcon =
  | LucideIcon
  | ComponentType<{ className?: string; strokeWidth?: number }>;

// Curated map so only the icons we actually use are bundled.
// Lucide names match the kebab-case names stored in Sanity; the zl-* names
// are the designer's custom brand icons (BrandIcons.tsx), also stored in
// Sanity for industries and hardcoded for the homepage service stages.
const ICONS: Record<string, AnyIcon> = {
  "zl-industry-saas": SaasIcon,
  "zl-industry-finance": FinanceIcon,
  "zl-industry-nonprofits": NonProfitsIcon,
  "zl-industry-property": PropertyDevIcon,
  "zl-industry-surveying": LandSurveyingIcon,
  "zl-industry-agencies": AgenciesIcon,
  "zl-stage-discover": DiscoverIcon,
  "zl-stage-build": BuildIcon,
  "zl-stage-scale": ScaleIcon,
  "bar-chart-3": BarChart3,
  "building-2": Building2,
  calendar: Calendar,
  "circle-dollar-sign": CircleDollarSign,
  crosshair: Crosshair,
  database: Database,
  eye: Eye,
  factory: Factory,
  "file-text": FileText,
  "graduation-cap": GraduationCap,
  heart: Heart,
  "heart-handshake": HeartHandshake,
  layout: Layout,
  map: Map,
  "map-pin": MapPin,
  "message-circle": MessageCircle,
  megaphone: Megaphone,
  monitor: Monitor,
  plug: Plug,
  "refresh-cw": RefreshCw,
  search: Search,
  sparkle: Sparkle,
  sparkles: Sparkles,
  "user-check": UserCheck,
  video: Video,
  wind: Wind,
  workflow: Workflow,
  zap: Zap,
};

export function Icon({
  name,
  className,
}: {
  name?: string | null;
  className?: string;
}) {
  const Cmp = (name && ICONS[name]) || Sparkle;
  return <Cmp className={className} strokeWidth={2} aria-hidden />;
}
