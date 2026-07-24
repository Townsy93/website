import {
  BarChart3,
  Building2,
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
  MessageCircle,
  Megaphone,
  Monitor,
  Plug,
  RefreshCw,
  Search,
  Sparkle,
  Sparkles,
  UserCheck,
  Wind,
  Workflow,
  Zap,
  type LucideIcon,
} from "lucide-react";

// Curated map so only the icons we actually use are bundled.
// Names match the Lucide kebab-case names stored in Sanity.
const ICONS: Record<string, LucideIcon> = {
  "bar-chart-3": BarChart3,
  "building-2": Building2,
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
  "message-circle": MessageCircle,
  megaphone: Megaphone,
  monitor: Monitor,
  plug: Plug,
  "refresh-cw": RefreshCw,
  search: Search,
  sparkle: Sparkle,
  sparkles: Sparkles,
  "user-check": UserCheck,
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
