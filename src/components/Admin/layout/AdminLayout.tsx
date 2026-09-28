import { useState, useEffect, useRef } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Settings,
  Palette,
  Home,
  User,
  Briefcase,
  FolderKanban,
  Award,
  FileText,
  HelpCircle,
  Mail,
  Menu,
  X,
  ChevronLeft,
  ExternalLink,
  Database,
  PlayCircle,
  Key,
} from "lucide-react";

const navItems = [
  { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { path: "/admin/common", label: "Common Settings", icon: Settings },
  { path: "/admin/theme", label: "Theme", icon: Palette },
  { path: "/admin/home", label: "Home Page", icon: Home },
  { path: "/admin/about", label: "About Page", icon: User },
  { path: "/admin/services", label: "Services", icon: Briefcase },
  { path: "/admin/projects", label: "Projects", icon: FolderKanban },
  { path: "/admin/skills", label: "Skills", icon: Award },
  { path: "/admin/blog", label: "Blog", icon: FileText },
  { path: "/admin/faq", label: "FAQ", icon: HelpCircle },
  { path: "/admin/contact", label: "Contact", icon: Mail },
  { path: "/admin/cache", label: "Cache Management", icon: Database },
  { path: "/admin/replays", label: "Session Replays", icon: PlayCircle },
  { path: "/admin/keys", label: "Keys Management", icon: Key },
];

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const mainRef = useRef<HTMLElement>(null);
  const location = useLocation();

  // Handle header visibility on scroll
  useEffect(() => {
    const mainElement = mainRef.current;
    if (!mainElement) return;

    const handleScroll = () => {
      const currentScrollY = mainElement.scrollTop;

      // Show header when scrolling up or at top
      if (currentScrollY < lastScrollY || currentScrollY < 10) {
        setHeaderVisible(true);
      }
      // Hide header when scrolling down (only if scrolled past header height)
      else if (currentScrollY > lastScrollY && currentScrollY > 64) {
        setHeaderVisible(false);
      }

      setLastScrollY(currentScrollY);
    };

    mainElement.addEventListener('scroll', handleScroll, { passive: true });
    return () => mainElement.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const isActive = (path: string) => {
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen bg-card border-r border-border flex flex-col transition-all duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          } ${sidebarCollapsed ? "w-16" : "w-64"}`}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          {!sidebarCollapsed && (
            <span className="font-semibold text-foreground font-['Sora']">
              Admin Panel
            </span>
          )}
          <button
            type="button"
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft
              className={`w-5 h-5 transition-transform ${sidebarCollapsed ? "rotate-180" : ""
                }`}
            />
          </button>
          <button
            type="button"
            aria-label="Close sidebar"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-secondary text-muted-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${isActive(item.path)
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      }`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    {!sidebarCollapsed && (
                      <span className="text-sm font-medium">{item.label}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <Link
            to="/"
            className={`flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm ${sidebarCollapsed ? "justify-center" : ""
              }`}
          >
            <ExternalLink className="w-4 h-4" />
            {!sidebarCollapsed && <span>View Site</span>}
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col min-w-0 min-h-screen transition-all duration-300 ${sidebarCollapsed
          ? "lg:ml-16"
          : "lg:ml-64"
          }`}
      >
        {/* Top Bar */}
        <header
          className={`h-16 bg-card border-b border-border flex items-center px-4 lg:px-6 fixed top-0 right-0 z-30 transition-all duration-300 ${sidebarCollapsed
            ? "lg:left-16"
            : "lg:left-64"
            } left-0 ${headerVisible ? "translate-y-0" : "-translate-y-full"
            }`}
        >
          <button
            type="button"
            aria-label="Open sidebar"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-secondary text-muted-foreground"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="ml-4 lg:ml-0">
            <p className="text-xs text-muted-foreground">Admin Dashboard</p>
            <p className="text-sm font-medium text-foreground">
              Content Management
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary border border-primary/20">
              v1.0.0
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main
          ref={mainRef}
          className="flex-1 overflow-auto pt-16 px-4 pb-4 lg:px-6"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

