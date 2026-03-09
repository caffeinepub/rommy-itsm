import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Calendar, Hash, Shield, User } from "lucide-react";
import { motion } from "motion/react";
import { UserRole } from "../backend.d";
import { AppLayout } from "../components/shared/AppLayout";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useMyProfile } from "../hooks/useQueries";

const roleLabels: Record<UserRole, string> = {
  [UserRole.EndUser]: "End User",
  [UserRole.ITAgent]: "IT Agent",
  [UserRole.Manager]: "Manager",
  [UserRole.MasterAdmin]: "Master Admin",
};

const roleColors: Record<UserRole, string> = {
  [UserRole.EndUser]: "bg-muted/50 text-muted-foreground border-border",
  [UserRole.ITAgent]: "bg-primary/10 text-primary border-primary/30",
  [UserRole.Manager]: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  [UserRole.MasterAdmin]:
    "bg-violet-500/10 text-violet-400 border-violet-500/30",
};

const roleDescriptions: Record<UserRole, string> = {
  [UserRole.EndUser]: "Can submit and track incidents and service requests",
  [UserRole.ITAgent]: "Can manage and resolve tickets across the system",
  [UserRole.Manager]: "Can view all tickets, reports, and user management",
  [UserRole.MasterAdmin]:
    "Full access including all settings and configurations",
};

interface ProfileRowProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

function ProfileRow({ icon, label, value }: ProfileRowProps) {
  return (
    <div className="flex items-start gap-4 py-3">
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center">
        <span className="text-muted-foreground">{icon}</span>
      </div>
      <div className="flex-1">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">
          {label}
        </p>
        <div className="text-sm font-medium text-foreground">{value}</div>
      </div>
    </div>
  );
}

export function ProfilePage() {
  const { data: profile, isLoading } = useMyProfile();
  const { identity } = useInternetIdentity();
  const principal = identity?.getPrincipal().toString();

  const userInitials = profile?.name
    ? profile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <AppLayout title="My Profile">
      <div
        className="max-w-2xl mx-auto space-y-5 animate-fade-in"
        data-ocid="profile.section"
      >
        {isLoading ? (
          <Card className="bg-card border-border">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              {["sk1", "sk2", "sk3", "sk4"].map((sk) => (
                <Skeleton key={sk} className="h-12 w-full" />
              ))}
            </CardContent>
          </Card>
        ) : !profile ? (
          <Card className="bg-card border-border">
            <CardContent className="p-8 text-center">
              <User className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Profile not found. Please contact an administrator.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Profile Header Card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-card border-border overflow-hidden">
                {/* Top accent */}
                <div className="h-1.5 bg-gradient-to-r from-primary via-primary/60 to-transparent" />
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-5">
                    <Avatar className="h-14 w-14">
                      <AvatarFallback className="bg-primary/20 text-primary text-lg font-bold font-display">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="font-display text-xl font-bold text-foreground">
                        {profile.name}
                      </h2>
                      <Badge
                        variant="outline"
                        className={`mt-1 text-xs border ${roleColors[profile.role]}`}
                      >
                        {roleLabels[profile.role]}
                      </Badge>
                    </div>
                  </div>

                  <Separator className="bg-border mb-4" />

                  <div className="space-y-0 divide-y divide-border/50">
                    <ProfileRow
                      icon={<User className="h-4 w-4" />}
                      label="Full Name"
                      value={profile.name}
                    />
                    <ProfileRow
                      icon={<Building2 className="h-4 w-4" />}
                      label="Department"
                      value={profile.department}
                    />
                    <ProfileRow
                      icon={<Shield className="h-4 w-4" />}
                      label="Role"
                      value={
                        <div>
                          <span className="block">
                            {roleLabels[profile.role]}
                          </span>
                          <span className="text-xs text-muted-foreground font-normal mt-0.5 block">
                            {roleDescriptions[profile.role]}
                          </span>
                        </div>
                      }
                    />
                    <ProfileRow
                      icon={<Calendar className="h-4 w-4" />}
                      label="Joined"
                      value={new Date(
                        Number(profile.createdAt) / 1_000_000,
                      ).toLocaleString()}
                    />
                    {principal && (
                      <ProfileRow
                        icon={<Hash className="h-4 w-4" />}
                        label="Principal ID"
                        value={
                          <code className="font-mono text-xs text-muted-foreground break-all">
                            {principal}
                          </code>
                        }
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}

        {/* Footer */}
        <p className="text-xs text-center text-muted-foreground/40">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-muted-foreground transition-colors"
          >
            Built with love using caffeine.ai
          </a>
        </p>
      </div>
    </AppLayout>
  );
}
