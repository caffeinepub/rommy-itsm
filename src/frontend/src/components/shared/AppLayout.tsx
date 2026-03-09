import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link, useLocation } from "@tanstack/react-router";
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  ChevronLeft,
  Clock,
  FileText,
  GitBranch,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  Shield,
  ShoppingBag,
  ShoppingCart,
  User,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { UserRole } from "../../backend.d";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import { useMyProfile } from "../../hooks/useQueries";

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  ocid: string;
  roles?: UserRole[];
  group?: string;
}

const navItems: NavItem[] = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="h-4 w-4" />,
    ocid: "nav.dashboard_link",
    group: "main",
  },
  {
    to: "/incidents",
    label: "Incidents",
    icon: <AlertTriangle className="h-4 w-4" />,
    ocid: "nav.incidents_link",
    group: "tickets",
  },
  {
    to: "/service-requests",
    label: "Service Requests",
    icon: <ShoppingCart className="h-4 w-4" />,
    ocid: "nav.service_requests_link",
    group: "tickets",
  },
  {
    to: "/problems",
    label: "Problems",
    icon: <Zap className="h-4 w-4" />,
    ocid: "nav.problems_link",
    group: "tickets",
  },
  {
    to: "/changes",
    label: "Change Management",
    icon: <GitBranch className="h-4 w-4" />,
    ocid: "nav.changes_link",
    group: "tickets",
  },
  {
    to: "/assets",
    label: "Assets (CMDB)",
    icon: <Package className="h-4 w-4" />,
    ocid: "nav.assets_link",
    group: "catalog",
  },
  {
    to: "/service-catalog",
    label: "Service Catalog",
    icon: <ShoppingBag className="h-4 w-4" />,
    ocid: "nav.service_catalog_link",
    group: "catalog",
  },
  {
    to: "/knowledge-base",
    label: "Knowledge Base",
    icon: <BookOpen className="h-4 w-4" />,
    ocid: "nav.knowledge_base_link",
    group: "catalog",
  },
  {
    to: "/sops",
    label: "SOPs & Process",
    icon: <FileText className="h-4 w-4" />,
    ocid: "nav.sops_link",
    group: "catalog",
  },
  {
    to: "/sla",
    label: "SLA Management",
    icon: <Clock className="h-4 w-4" />,
    ocid: "nav.sla_link",
    group: "analytics",
  },
  {
    to: "/reports",
    label: "Reports",
    icon: <BarChart3 className="h-4 w-4" />,
    ocid: "nav.reports_link",
    group: "analytics",
  },
  {
    to: "/users",
    label: "User Management",
    icon: <Users className="h-4 w-4" />,
    ocid: "nav.users_link",
    roles: [UserRole.Manager, UserRole.MasterAdmin],
    group: "admin",
  },
  {
    to: "/settings",
    label: "Settings",
    icon: <Settings className="h-4 w-4" />,
    ocid: "nav.settings_link",
    roles: [UserRole.MasterAdmin],
    group: "admin",
  },
  {
    to: "/profile",
    label: "Profile",
    icon: <User className="h-4 w-4" />,
    ocid: "nav.profile_link",
    group: "admin",
  },
];

const groupLabels: Record<string, string> = {
  main: "",
  tickets: "TICKETS",
  catalog: "CATALOG",
  analytics: "ANALYTICS",
  admin: "ADMIN",
};

const roleLabels: Record<UserRole, string> = {
  [UserRole.EndUser]: "End User",
  [UserRole.ITAgent]: "IT Agent",
  [UserRole.Manager]: "Manager",
  [UserRole.MasterAdmin]: "Master Admin",
};

const roleColors: Record<UserRole, string> = {
  [UserRole.EndUser]: "bg-muted text-muted-foreground border-border",
  [UserRole.ITAgent]: "bg-primary/10 text-primary border-primary/20",
  [UserRole.Manager]: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  [UserRole.MasterAdmin]:
    "bg-violet-500/10 text-violet-600 border-violet-500/20",
};

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
}

export function AppLayout({ children, title }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { clear } = useInternetIdentity();
  const { data: profile } = useMyProfile();

  const userInitials = profile?.name
    ? profile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  const visibleNav = navItems.filter(
    (item) =>
      !item.roles || (profile?.role && item.roles.includes(profile.role)),
  );

  // Group the nav items
  const groups = ["main", "tickets", "catalog", "analytics", "admin"];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className={`flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out ${
          collapsed ? "w-16" : "w-60"
        }`}
      >
        {/* Logo */}
        <div
          className={`flex items-center h-14 px-3 border-b border-sidebar-border gap-3 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Shield className="h-4 w-4 text-primary" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <span className="font-display text-sm font-bold text-sidebar-foreground tracking-tight">
                Rommy ITSM
              </span>
            </div>
          )}
          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-sidebar-foreground flex-shrink-0"
              onClick={() => setCollapsed(true)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-2 overflow-y-auto">
          {groups.map((group) => {
            const groupItems = visibleNav.filter(
              (item) => item.group === group,
            );
            if (groupItems.length === 0) return null;
            const label = groupLabels[group];
            return (
              <div key={group} className="mb-1">
                {!collapsed && label && (
                  <p className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest">
                    {label}
                  </p>
                )}
                {collapsed && label && (
                  <div className="my-1 border-t border-sidebar-border/50" />
                )}
                <div className="space-y-0.5">
                  {groupItems.map((item) => {
                    const isActive = location.pathname === item.to;
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        data-ocid={item.ocid}
                        className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-150 group ${
                          isActive
                            ? "nav-link-active"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                        } ${collapsed ? "justify-center px-2" : ""}`}
                      >
                        <span
                          className={`flex-shrink-0 ${
                            isActive
                              ? "text-primary"
                              : "text-muted-foreground group-hover:text-sidebar-foreground"
                          }`}
                        >
                          {item.icon}
                        </span>
                        {!collapsed && (
                          <span className="truncate">{item.label}</span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Bottom: User + Logout */}
        <div className="border-t border-sidebar-border p-3">
          {!collapsed && profile && (
            <div className="flex items-center gap-2 mb-3 px-1">
              <Avatar className="h-7 w-7 flex-shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-sidebar-foreground truncate">
                  {profile.name}
                </p>
                <Badge
                  className={`mt-0.5 text-[10px] px-1.5 py-0 h-4 border ${
                    roleColors[profile.role]
                  }`}
                  variant="outline"
                >
                  {roleLabels[profile.role]}
                </Badge>
              </div>
            </div>
          )}
          {!collapsed && <Separator className="mb-2 bg-sidebar-border" />}
          <Button
            variant="ghost"
            size="sm"
            data-ocid="nav.logout_button"
            onClick={clear}
            className={`text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors ${
              collapsed ? "w-full justify-center px-2" : "w-full justify-start"
            }`}
          >
            <LogOut className={`h-4 w-4 ${collapsed ? "" : "mr-2"}`} />
            {!collapsed && "Sign Out"}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Header */}
        <header className="flex items-center h-14 px-6 border-b border-border bg-card backdrop-blur-sm gap-4 flex-shrink-0 shadow-xs">
          {collapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground"
              onClick={() => setCollapsed(false)}
            >
              <Menu className="h-4 w-4" />
            </Button>
          )}
          <h1 className="font-display text-base font-bold text-foreground">
            {title}
          </h1>
          <div className="flex-1" />
          {profile && (
            <Badge
              className={`text-xs border ${roleColors[profile.role]}`}
              variant="outline"
            >
              {roleLabels[profile.role]}
            </Badge>
          )}
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
