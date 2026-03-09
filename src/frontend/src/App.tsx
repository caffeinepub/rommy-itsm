import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { Loader2 } from "lucide-react";

import { TicketType, UserRole } from "./backend.d";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useMyProfile } from "./hooks/useQueries";
import { AssetDetailPage } from "./pages/AssetDetailPage";
import { AssetsPage } from "./pages/AssetsPage";
import { ChangeDetailPage } from "./pages/ChangeDetailPage";
import { ChangesPage } from "./pages/ChangesPage";
import { DashboardPage } from "./pages/DashboardPage";
import { KnowledgeBasePage } from "./pages/KnowledgeBasePage";
import { LoginPage } from "./pages/LoginPage";
import { ProblemDetailPage } from "./pages/ProblemDetailPage";
import { ProblemsPage } from "./pages/ProblemsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { SOPsPage } from "./pages/SOPsPage";
import { ServiceCatalogPage } from "./pages/ServiceCatalogPage";
import { TicketDetailPage } from "./pages/TicketDetailPage";
import { TicketsPage } from "./pages/TicketsPage";
import { UsersPage } from "./pages/UsersPage";

// ── Auth Guard Component ────────────────────────────────────────

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: profile, isLoading: profileLoading } = useMyProfile();

  if (isInitializing || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Loader2 className="h-5 w-5 text-primary animate-spin" />
          </div>
          <p className="text-sm text-muted-foreground">Loading Rommy ITSM...</p>
        </div>
      </div>
    );
  }

  if (!identity) {
    return <LoginPage />;
  }

  if (!profile && !profileLoading) {
    return <LoginPage />;
  }

  return <>{children}</>;
}

// ── Role Guard Component ────────────────────────────────────────

function RoleGuard({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}) {
  const { data: profile } = useMyProfile();

  if (!profile || !allowedRoles.includes(profile.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="font-display text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground text-sm">
            You don't have permission to view this page.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// ── Routes ──────────────────────────────────────────────────────

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster richColors position="top-right" />
    </>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LoginPage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: () => (
    <AuthGuard>
      <DashboardPage />
    </AuthGuard>
  ),
});

const incidentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/incidents",
  component: () => (
    <AuthGuard>
      <TicketsPage ticketType={TicketType.Incident} />
    </AuthGuard>
  ),
});

const incidentDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/incidents/$id",
  component: () => (
    <AuthGuard>
      <TicketDetailPage ticketType={TicketType.Incident} />
    </AuthGuard>
  ),
});

const serviceRequestsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/service-requests",
  component: () => (
    <AuthGuard>
      <TicketsPage ticketType={TicketType.ServiceRequest} />
    </AuthGuard>
  ),
});

const serviceRequestDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/service-requests/$id",
  component: () => (
    <AuthGuard>
      <TicketDetailPage ticketType={TicketType.ServiceRequest} />
    </AuthGuard>
  ),
});

const usersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/users",
  component: () => (
    <AuthGuard>
      <RoleGuard allowedRoles={[UserRole.Manager, UserRole.MasterAdmin]}>
        <UsersPage />
      </RoleGuard>
    </AuthGuard>
  ),
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: () => (
    <AuthGuard>
      <ProfilePage />
    </AuthGuard>
  ),
});

const problemsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/problems",
  component: () => (
    <AuthGuard>
      <ProblemsPage />
    </AuthGuard>
  ),
});

const problemDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/problems/$id",
  component: () => (
    <AuthGuard>
      <ProblemDetailPage />
    </AuthGuard>
  ),
});

const changesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/changes",
  component: () => (
    <AuthGuard>
      <ChangesPage />
    </AuthGuard>
  ),
});

const changeDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/changes/$id",
  component: () => (
    <AuthGuard>
      <ChangeDetailPage />
    </AuthGuard>
  ),
});

const assetsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/assets",
  component: () => (
    <AuthGuard>
      <AssetsPage />
    </AuthGuard>
  ),
});

const assetDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/assets/$id",
  component: () => (
    <AuthGuard>
      <AssetDetailPage />
    </AuthGuard>
  ),
});

const serviceCatalogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/service-catalog",
  component: () => (
    <AuthGuard>
      <ServiceCatalogPage />
    </AuthGuard>
  ),
});

const knowledgeBaseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/knowledge-base",
  component: () => (
    <AuthGuard>
      <KnowledgeBasePage />
    </AuthGuard>
  ),
});

const sopsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/sops",
  component: () => (
    <AuthGuard>
      <SOPsPage />
    </AuthGuard>
  ),
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  dashboardRoute,
  incidentsRoute,
  incidentDetailRoute,
  serviceRequestsRoute,
  serviceRequestDetailRoute,
  problemsRoute,
  problemDetailRoute,
  changesRoute,
  changeDetailRoute,
  assetsRoute,
  assetDetailRoute,
  serviceCatalogRoute,
  knowledgeBaseRoute,
  sopsRoute,
  usersRoute,
  profileRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// ── App ─────────────────────────────────────────────────────────

export default function App() {
  return <RouterProvider router={router} />;
}
