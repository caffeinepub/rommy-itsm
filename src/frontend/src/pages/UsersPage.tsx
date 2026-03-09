import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Principal } from "@icp-sdk/core/principal";
import { Shield, Users } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { UserRole } from "../backend.d";
import { AppLayout } from "../components/shared/AppLayout";
import {
  useAllUsers,
  useMyProfile,
  useUpdateUserRole,
} from "../hooks/useQueries";

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

export function UsersPage() {
  const { data: users, isLoading } = useAllUsers();
  const { data: myProfile } = useMyProfile();
  const updateRole = useUpdateUserRole();

  const isMasterAdmin = myProfile?.role === UserRole.MasterAdmin;
  const myPrincipal = myProfile?.principal?.toString();

  const handleRoleChange = async (
    userPrincipal: Principal,
    newRole: UserRole,
    currentRole: UserRole,
  ) => {
    if (newRole === currentRole) return;
    try {
      await updateRole.mutateAsync({ userPrincipal, newRole });
      toast.success("User role updated successfully");
    } catch {
      toast.error("Failed to update user role");
    }
  };

  return (
    <AppLayout title="User Management">
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="text-xs border-border text-muted-foreground"
          >
            {users?.length ?? 0} users
          </Badge>
          {isMasterAdmin && (
            <Badge
              variant="outline"
              className="text-xs border-violet-500/30 text-violet-400 bg-violet-500/10"
            >
              <Shield className="h-3 w-3 mr-1" />
              You can change roles
            </Badge>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-card border-border">
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-4 space-y-3">
                  {["sk1", "sk2", "sk3", "sk4", "sk5"].map((sk) => (
                    <Skeleton key={sk} className="h-12 w-full" />
                  ))}
                </div>
              ) : !users || users.length === 0 ? (
                <div
                  data-ocid="users.empty_state"
                  className="flex flex-col items-center justify-center py-16"
                >
                  <Users className="h-10 w-10 text-muted-foreground/20 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No users found
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table data-ocid="users.table">
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-xs font-semibold text-muted-foreground">
                          User
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground w-32">
                          Department
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground w-36">
                          Role
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground w-44">
                          Principal
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground w-28">
                          Joined
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user, idx) => {
                        const initials = user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2);
                        const isMe = user.principal.toString() === myPrincipal;

                        return (
                          <TableRow
                            key={user.principal.toString()}
                            data-ocid={`users.item.${idx + 1}`}
                            className="border-border hover:bg-accent/30"
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8 flex-shrink-0">
                                  <AvatarFallback className="bg-primary/15 text-primary text-xs font-bold">
                                    {initials}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                                    {user.name}
                                    {isMe && (
                                      <Badge
                                        variant="outline"
                                        className="text-[10px] px-1.5 py-0 h-4 border-primary/30 text-primary bg-primary/10"
                                      >
                                        You
                                      </Badge>
                                    )}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {user.department}
                            </TableCell>
                            <TableCell>
                              {isMasterAdmin && !isMe ? (
                                <Select
                                  value={user.role}
                                  onValueChange={(v) =>
                                    handleRoleChange(
                                      user.principal as Principal,
                                      v as UserRole,
                                      user.role,
                                    )
                                  }
                                  disabled={updateRole.isPending}
                                >
                                  <SelectTrigger
                                    data-ocid={`users.role_select.${idx + 1}`}
                                    className="w-36 h-7 text-xs bg-input border-border"
                                  >
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-popover border-border">
                                    {Object.values(UserRole).map((role) => (
                                      <SelectItem
                                        key={role}
                                        value={role}
                                        className="text-xs"
                                      >
                                        {roleLabels[role]}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className={`text-xs border ${roleColors[user.role]}`}
                                >
                                  {roleLabels[user.role]}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <code className="text-xs font-mono text-muted-foreground">
                                {user.principal.toString().slice(0, 20)}...
                              </code>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {new Date(
                                Number(user.createdAt) / 1_000_000,
                              ).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
}
