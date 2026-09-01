import {
  Activity,
  Bell,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Footprints,
  Heart,
  House,
  Info,
  Layers,
  LocateFixed,
  Lock,
  MapPin,
  MessageCircle,
  Mic,
  Navigation,
  Phone,
  PhoneCall,
  Plus,
  Route,
  Settings,
  Share,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Siren,
  TriangleAlert,
  UserPlus,
  Users,
  Video,
  X,
  type LucideIcon,
} from 'lucide-react-native';

// Kebab-case (design) → Lucide component. Matches the design's sakhi-icons.css set.
const ICONS: Record<string, LucideIcon> = {
  activity: Activity,
  bell: Bell,
  check: Check,
  'chevron-down': ChevronDown,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  clock: Clock,
  eye: Eye,
  footprints: Footprints,
  heart: Heart,
  house: House,
  info: Info,
  layers: Layers,
  'locate-fixed': LocateFixed,
  lock: Lock,
  'map-pin': MapPin,
  'message-circle': MessageCircle,
  mic: Mic,
  navigation: Navigation,
  phone: Phone,
  'phone-call': PhoneCall,
  plus: Plus,
  route: Route,
  settings: Settings,
  share: Share,
  shield: Shield,
  'shield-alert': ShieldAlert,
  'shield-check': ShieldCheck,
  siren: Siren,
  'triangle-alert': TriangleAlert,
  'user-plus': UserPlus,
  users: Users,
  video: Video,
  x: X,
};

export type IconName = keyof typeof ICONS | string;

export function Icon({
  name,
  size = 20,
  color = '#121114',
  strokeWidth = 2,
}: {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  const Cmp = ICONS[name];
  if (!Cmp) return null;
  return <Cmp size={size} color={color} strokeWidth={strokeWidth} />;
}
