/**
 * Centralized icon mappings for the A-hub mobile app.
 * All emoji→Phosphor replacements organized by domain.
 *
 * Import convention: phosphor-react-native uses default exports
 * without the "Icon" suffix (e.g., House, not HouseIcon).
 */
import {
  type Icon,
  House, CreditCard, Calendar, Storefront, User,
  CalendarBlank, PaperPlaneTilt, Trophy, Wallet, Buildings,
  ClipboardText, Star, MapPin, PersonSimpleRun, Bicycle,
  PersonSimpleWalk, SwimmingPool, Mountains, Note, ShoppingCart,
  CurrencyDollar, DownloadSimple, UploadSimple, ArrowUp, ArrowDown,
  ArrowCounterClockwise, Handshake, Wrench, Sparkle, ChatCircle,
  Confetti, Bell, Coin, Shuffle, Heart,
  Tag, Fire, Timer, Warning, Check,
  Checks, Play, Trash, SpeakerSlash, Camera,
  Microphone, PaperPlaneRight, Globe, DeviceMobile, QrCode,
  CaretLeft, CaretRight, Ticket, Package, Clock,
  CheckCircle, XCircle, Record, Users, Gear,
  Moon, Sun, Lock, FileText, Question,
  ChartBar, Scan, ArrowUpRight, ArrowDownLeft, SealCheck,
  Medal, PencilSimple, Bank, InstagramLogo, Phone,
  Chat, Link, Image, CircleNotch, X,
  Crown, ShareNetwork, BookmarkSimple, ListBullets, MapTrifold,
  MagnifyingGlass, ArrowBendUpLeft, CopySimple, Plus, ImageSquare,
  File, PushPin, BellSlash, Archive, DotsThreeVertical,
  Eye, EyeSlash, FingerprintSimple, WifiSlash,
} from 'phosphor-react-native';

// ─── TAB BAR ────────────────────────────────────────
export const TAB_ICONS = {
  home: House,
  card: CreditCard,
  calendar: Calendar,
  store: Storefront,
  user: User,
} as const satisfies Record<string, Icon>;

// ─── HOME QUICK ACTIONS ─────────────────────────────
export const QUICK_ACTION_ICONS = {
  events: CalendarBlank,
  transfer: PaperPlaneTilt,
  rankings: Trophy,
  wallet: Wallet,
  spaces: Buildings,
  bookings: ClipboardText,
  subscriptions: Star,
} as const satisfies Record<string, Icon>;

// ─── TRANSACTION SOURCES ────────────────────────────
export const TRANSACTION_ICONS = {
  EVENT_CHECKIN: MapPin,
  STRAVA_RUN: PersonSimpleRun,
  STRAVA_RIDE: Bicycle,
  STRAVA_WALK: PersonSimpleWalk,
  STRAVA_SWIM: SwimmingPool,
  STRAVA_HIKE: Mountains,
  DAILY_POST: Note,
  PURCHASE_POINTS: ShoppingCart,
  PURCHASE_PIX: CreditCard,
  CASHBACK: CurrencyDollar,
  TRANSFER_IN: DownloadSimple,
  TRANSFER_OUT: UploadSimple,
  ADMIN_CREDIT: ArrowUp,
  ADMIN_DEBIT: ArrowDown,
  REFUND: ArrowCounterClockwise,
  SUBSCRIPTION_BONUS: Star,
  REFERRAL: Handshake,
  MANUAL_ADJUSTMENT: Wrench,
  DEFAULT: Sparkle,
} as const satisfies Record<string, Icon>;

// ─── NOTIFICATION CATEGORIES ────────────────────────
export const NOTIFICATION_ICONS = {
  ALL: ClipboardText,
  SOCIAL: ChatCircle,
  EVENTS: Confetti,
  POINTS: Star,
  RESERVATIONS: Calendar,
  SYSTEM: Bell,
} as const satisfies Record<string, Icon>;

// ─── PAYMENT METHODS ────────────────────────────────
export const PAYMENT_ICONS = {
  POINTS: Coin,
  MONEY: CreditCard,
  MIXED: Shuffle,
} as const satisfies Record<string, Icon>;

// ─── STORE ──────────────────────────────────────────
export const STORE_ICONS = {
  categoryFallback: Tag,
  emptyState: Storefront,
  favorite: Heart,
  rating: Star,
  cart: ShoppingCart,
  promotion: Fire,
  timer: Timer,
  timerUrgent: Warning,
  productPlaceholder: Storefront,
} as const satisfies Record<string, Icon>;

// ─── MESSAGES ───────────────────────────────────────
export const MESSAGE_ICONS = {
  sent: Check,
  delivered: Checks,
  read: Checks,
  sending: CircleNotch,
  play: Play,
  trash: Trash,
  muted: SpeakerSlash,
  unmuted: Bell,
  camera: Camera,
  microphone: Microphone,
  send: PaperPlaneRight,
  image: Image,
  close: X,
} as const satisfies Record<string, Icon>;

// ─── CARD / CARTEIRINHA ─────────────────────────────
export const CARD_ICONS = {
  crown: Crown,
  share: ShareNetwork,
  sun: Sun,
  qrCode: QrCode,
} as const satisfies Record<string, Icon>;

export const CARD_HISTORY_ICONS = {
  CHECKIN: Buildings,
  BENEFIT_USED: Sparkle,
  EVENT_VALIDATION: Calendar,
  QR_SCANNED: DeviceMobile,
  DEFAULT: ClipboardText,
} as const satisfies Record<string, Icon>;

export const PARTNER_ICONS = {
  website: Globe,
  phone: Phone,
  instagram: InstagramLogo,
  whatsapp: Chat,
  location: MapPin,
  category: Tag,
  lock: Lock,
  photos: Camera,
} as const satisfies Record<string, Icon>;

// ─── EVENTS ─────────────────────────────────────────
export const EVENT_ICONS = {
  date: Calendar,
  location: MapPin,
  rating: Star,
  attendees: Users,
  prize: Trophy,
  live: Record,
  link: Link,
  celebration: Confetti,
} as const satisfies Record<string, Icon>;

// ─── ORDERS ─────────────────────────────────────────
export const ORDER_ICONS = {
  voucher: Ticket,
  package: Package,
  location: MapPin,
  list: ClipboardText,
} as const satisfies Record<string, Icon>;

export const ORDER_STATUS_ICONS = {
  PENDING: Clock,
  CONFIRMED: Check,
  READY: Package,
  COMPLETED: CheckCircle,
  CANCELLED: XCircle,
} as const satisfies Record<string, Icon>;

// ─── PROFILE / SETTINGS ────────────────────────────
export const PROFILE_ICONS = {
  messages: ChatCircle,
  settings: Gear,
  themeDark: Moon,
  themeLight: Sun,
  notifications: Bell,
  terms: FileText,
  privacy: Lock,
  badges: Medal,
  rankings: ChartBar,
  help: Question,
  subscription: Star,
  back: CaretLeft,
} as const satisfies Record<string, Icon>;

// ─── WALLET / PDV ───────────────────────────────────
export const WALLET_ICONS = {
  user: User,
  card: CreditCard,
  history: ClipboardText,
  mobile: DeviceMobile,
  scanner: Scan,
  transfer: PaperPlaneTilt,
  qrCode: QrCode,
  checkin: MapPin,
} as const satisfies Record<string, Icon>;

// ─── SUBSCRIPTIONS ──────────────────────────────────
export const SUBSCRIPTION_BENEFIT_ICONS = {
  points_events: MapPin,
  points_strava: PersonSimpleRun,
  points_posts: Note,
  discount_store: Storefront,
  discount_pdv: Bank,
  discount_spaces: Buildings,
  cashback: CurrencyDollar,
  verified: SealCheck,
  included: Check,
} as const satisfies Record<string, Icon>;

// ─── NAVIGATION ─────────────────────────────────────
export const NAV_ICONS = {
  back: CaretLeft,
  forward: CaretRight,
} as const satisfies Record<string, Icon>;

// ─── MISC ───────────────────────────────────────────
export const MISC_ICONS = {
  close: X,
  dnd: Moon,
  recording: Record,
  edit: PencilSimple,
  transferIn: ArrowDownLeft,
  transferOut: ArrowUpRight,
  verified: SealCheck,
  success: CheckCircle,
  error: XCircle,
  warning: Warning,
  clock: Clock,
  sparkle: Sparkle,
} as const satisfies Record<string, Icon>;

// ─── RE-EXPORTS for direct usage ────────────────────
export {
  House,
  CreditCard,
  Calendar,
  Storefront,
  User,
  CalendarBlank,
  PaperPlaneTilt,
  Trophy,
  Wallet,
  Buildings,
  ClipboardText,
  Star,
  MapPin,
  PersonSimpleRun,
  Bicycle,
  PersonSimpleWalk,
  SwimmingPool,
  Mountains,
  Note,
  ShoppingCart,
  CurrencyDollar,
  DownloadSimple,
  UploadSimple,
  ArrowUp,
  ArrowDown,
  ArrowCounterClockwise,
  Handshake,
  Wrench,
  Sparkle,
  ChatCircle,
  Confetti,
  Bell,
  Coin,
  Shuffle,
  Heart,
  Tag,
  Fire,
  Timer,
  Warning,
  Check,
  Checks,
  Play,
  Trash,
  SpeakerSlash,
  Camera,
  Microphone,
  PaperPlaneRight,
  Globe,
  DeviceMobile,
  QrCode,
  CaretLeft,
  CaretRight,
  Ticket,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Record,
  Users,
  Gear,
  Moon,
  Sun,
  Lock,
  FileText,
  Question,
  ChartBar,
  Scan,
  ArrowUpRight,
  ArrowDownLeft,
  SealCheck,
  Medal,
  PencilSimple,
  Bank,
  InstagramLogo,
  Phone,
  Chat,
  Link,
  Image,
  CircleNotch,
  X,
  Crown,
  ShareNetwork,
  BookmarkSimple,
  ListBullets,
  MapTrifold,
  MagnifyingGlass,
  ArrowBendUpLeft,
  CopySimple,
  Plus,
  ImageSquare,
  File,
  PushPin,
  BellSlash,
  Archive,
  DotsThreeVertical,
  Eye,
  EyeSlash,
  FingerprintSimple,
  WifiSlash,
};
