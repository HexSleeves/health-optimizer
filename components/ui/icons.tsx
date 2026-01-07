/**
 * Cross-platform icon wrapper
 * Uses lucide-react on web and lucide-react-native on native
 */
import { Platform } from 'react-native';

// Re-export icons from the appropriate package
export {
  Home,
  User,
  ClipboardList,
  MessageCircle,
  Settings,
  Heart,
  Pill,
  AlertTriangle,
  Target,
  ChevronRight,
  Edit,
  Plus,
  X,
  Search,
  Check,
  Sparkles,
  Activity,
  Utensils,
  Dumbbell,
  Moon,
  TrendingUp,
  RefreshCw,
  Clock,
  Send,
  Mic,
  Paperclip,
  Bot,
  AlertCircle,
  CheckCircle,
  Info,
  Eye,
  EyeOff,
  Shield,
  Bell,
  Palette,
  Database,
  Trash2,
  LogOut,
  ExternalLink,
  MessageSquarePlus,
  History,
  Smartphone,
} from 'lucide-react-native';

// Note: lucide-react-native works on web through react-native-web
// If icons don't render, the metro.config may need web aliasing
