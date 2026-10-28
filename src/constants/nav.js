// Public navigation. `key` maps to messages "nav.<key>".
export const PUBLIC_NAV = [
  { key: "home", href: "/" },
  { key: "about", href: "/about" },
  { key: "rooms", href: "/rooms" },
  { key: "offers", href: "/offers" },
  { key: "gallery", href: "/gallery" },
  { key: "attractions", href: "/attractions" },
  { key: "contact", href: "/contact" },
];

export const POLICY_LINKS = [
  { key: "policies", href: "/policies" },
  { key: "cancellation", href: "/cancellation-policy" },
  { key: "terms", href: "/terms-and-conditions" },
  { key: "privacy", href: "/privacy-policy" },
];

// Admin navigation. `owner: true` hides the item from staff (UI only - backend authorises).
export const ADMIN_NAV = [
  { label: "Dashboard", href: "/admin/dashboard", icon: "LayoutDashboard" },
  { label: "Bookings", href: "/admin/bookings", icon: "CalendarCheck" },
  { label: "Rooms", href: "/admin/rooms", icon: "BedDouble" },
  { label: "Tariffs", href: "/admin/tariffs", icon: "IndianRupee" },
  { label: "Guests", href: "/admin/guests", icon: "Users" },
  { label: "Enquiries", href: "/admin/enquiries", icon: "MessageSquare" },
  { label: "Offers", href: "/admin/offers", icon: "BadgePercent" },
  { label: "Gallery", href: "/admin/gallery", icon: "Images" },
  { label: "Reviews", href: "/admin/reviews", icon: "Star" },
  { label: "Attractions", href: "/admin/attractions", icon: "MapPin" },
  { label: "Content", href: "/admin/content", icon: "FileText" },
  { label: "Reports", href: "/admin/reports", icon: "BarChart3" },
  { label: "Settings", href: "/admin/settings", icon: "Settings" },
];
