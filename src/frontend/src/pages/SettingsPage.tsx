import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  CheckCircle2,
  GitBranch,
  Lock,
  Settings,
  Shield,
  Users,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { TicketPriority, UserRole } from "../backend.d";
import { AppLayout } from "../components/shared/AppLayout";
import { useMyProfile } from "../hooks/useQueries";

// ── Config types & storage ─────────────────────────────────────────

const SETTINGS_KEY = "rommy_settings";

interface SystemSettings {
  systemName: string;
  timezone: string;
  slaTargets: Record<
    TicketPriority,
    { responseHours: number; resolutionHours: number }
  >;
  priorityLabels: Record<TicketPriority, string>;
  assignmentMode: "auto" | "manual" | "both";
  autoAssignByCategory: boolean;
  autoAssignBySkill: boolean;
  approvalRequired: boolean;
  approvalRoles: string[];
  notifyOnTicketCreate: boolean;
  notifyOnTicketAssign: boolean;
  notifyOnSLABreach: boolean;
  notifyOnChangeApproval: boolean;
  notifyOnEscalation: boolean;
}

const defaultSettings: SystemSettings = {
  systemName: "Rommy ITSM",
  timezone: "UTC",
  slaTargets: {
    [TicketPriority.Critical]: { responseHours: 1, resolutionHours: 4 },
    [TicketPriority.High]: { responseHours: 4, resolutionHours: 8 },
    [TicketPriority.Medium]: { responseHours: 8, resolutionHours: 24 },
    [TicketPriority.Low]: { responseHours: 24, resolutionHours: 72 },
  },
  priorityLabels: {
    [TicketPriority.Critical]: "Critical",
    [TicketPriority.High]: "High",
    [TicketPriority.Medium]: "Medium",
    [TicketPriority.Low]: "Low",
  },
  assignmentMode: "both",
  autoAssignByCategory: true,
  autoAssignBySkill: true,
  approvalRequired: true,
  approvalRoles: ["Manager", "MasterAdmin"],
  notifyOnTicketCreate: true,
  notifyOnTicketAssign: true,
  notifyOnSLABreach: true,
  notifyOnChangeApproval: true,
  notifyOnEscalation: true,
};

function loadSettings(): SystemSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) return { ...defaultSettings, ...JSON.parse(stored) };
  } catch {
    /* ignore */
  }
  return defaultSettings;
}

function saveSettings(s: SystemSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

const priorityOrder: TicketPriority[] = [
  TicketPriority.Critical,
  TicketPriority.High,
  TicketPriority.Medium,
  TicketPriority.Low,
];

const priorityColors: Record<TicketPriority, string> = {
  [TicketPriority.Critical]: "text-red-400 border-red-500/30 bg-red-500/10",
  [TicketPriority.High]:
    "text-orange-400 border-orange-500/30 bg-orange-500/10",
  [TicketPriority.Medium]: "text-amber-400 border-amber-500/30 bg-amber-500/10",
  [TicketPriority.Low]: "text-blue-400 border-blue-500/30 bg-blue-500/10",
};

export function SettingsPage() {
  const { data: profile } = useMyProfile();
  const [settings, setSettings] = useState<SystemSettings>(loadSettings);
  const [saving, setSaving] = useState(false);

  const isMasterAdmin = profile?.role === UserRole.MasterAdmin;

  if (!isMasterAdmin) {
    return (
      <AppLayout title="Settings">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-14 h-14 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-destructive" />
          </div>
          <h2 className="font-display text-lg font-bold mb-1">
            Access Restricted
          </h2>
          <p className="text-sm text-muted-foreground max-w-xs">
            Settings are only accessible to Master Admins.
          </p>
        </div>
      </AppLayout>
    );
  }

  function handleSave() {
    setSaving(true);
    saveSettings(settings);
    setTimeout(() => {
      setSaving(false);
      toast.success("Settings saved successfully");
    }, 400);
  }

  function update(partial: Partial<SystemSettings>) {
    setSettings((prev) => ({ ...prev, ...partial }));
  }

  return (
    <AppLayout title="Settings">
      <div className="space-y-6 animate-fade-in max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-sm font-semibold text-foreground">
              System Configuration
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Master Admin only. Changes are saved locally.
            </p>
          </div>
          <Button
            data-ocid="settings.save_button"
            onClick={handleSave}
            disabled={saving}
            size="sm"
          >
            {saving ? "Saving..." : "Save All Settings"}
          </Button>
        </div>

        <Tabs defaultValue="general" data-ocid="settings.tabs">
          <TabsList className="bg-card border border-border h-auto flex-wrap gap-1 p-1">
            {[
              {
                value: "general",
                label: "General",
                icon: <Settings className="h-3.5 w-3.5" />,
              },
              {
                value: "sla",
                label: "SLA Config",
                icon: <Shield className="h-3.5 w-3.5" />,
              },
              {
                value: "priorities",
                label: "Priority Levels",
                icon: <Zap className="h-3.5 w-3.5" />,
              },
              {
                value: "assignment",
                label: "Assignment Rules",
                icon: <Users className="h-3.5 w-3.5" />,
              },
              {
                value: "approvals",
                label: "Approval Workflows",
                icon: <GitBranch className="h-3.5 w-3.5" />,
              },
              {
                value: "notifications",
                label: "Notifications",
                icon: <Bell className="h-3.5 w-3.5" />,
              },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                data-ocid={`settings.${tab.value}_tab`}
                className="flex items-center gap-1.5 text-xs"
              >
                {tab.icon}
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* General */}
          <TabsContent value="general" className="mt-4">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="font-display text-sm">
                    General Settings
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Basic system configuration and display preferences.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="system-name" className="text-sm">
                      System Name
                    </Label>
                    <Input
                      id="system-name"
                      data-ocid="settings.system_name_input"
                      value={settings.systemName}
                      onChange={(e) => update({ systemName: e.target.value })}
                      placeholder="e.g. Rommy ITSM"
                    />
                    <p className="text-xs text-muted-foreground">
                      Displayed in the sidebar and browser title.
                    </p>
                  </div>
                  <Separator className="bg-border" />
                  <div className="space-y-1.5">
                    <Label htmlFor="timezone" className="text-sm">
                      Timezone
                    </Label>
                    <Input
                      id="timezone"
                      data-ocid="settings.timezone_input"
                      value={settings.timezone}
                      onChange={(e) => update({ timezone: e.target.value })}
                      placeholder="e.g. UTC, Asia/Singapore"
                    />
                    <p className="text-xs text-muted-foreground">
                      Used for displaying timestamps across the system.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* SLA Config */}
          <TabsContent value="sla" className="mt-4">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="font-display text-sm">
                    SLA Targets
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Configure response and resolution time targets per priority
                    level (ITIL defaults pre-loaded).
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {priorityOrder.map((priority) => {
                    const sla = settings.slaTargets[priority];
                    return (
                      <div key={priority} className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={`text-xs ${priorityColors[priority]}`}
                          >
                            {settings.priorityLabels[priority]}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-3 pl-1">
                          <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">
                              Response Time (hours)
                            </Label>
                            <Input
                              data-ocid={`settings.sla_response_${priority.toLowerCase()}_input`}
                              type="number"
                              min={1}
                              value={sla.responseHours}
                              onChange={(e) =>
                                update({
                                  slaTargets: {
                                    ...settings.slaTargets,
                                    [priority]: {
                                      ...sla,
                                      responseHours: Math.max(
                                        1,
                                        Number.parseInt(e.target.value) || 1,
                                      ),
                                    },
                                  },
                                })
                              }
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">
                              Resolution Time (hours)
                            </Label>
                            <Input
                              data-ocid={`settings.sla_resolution_${priority.toLowerCase()}_input`}
                              type="number"
                              min={1}
                              value={sla.resolutionHours}
                              onChange={(e) =>
                                update({
                                  slaTargets: {
                                    ...settings.slaTargets,
                                    [priority]: {
                                      ...sla,
                                      resolutionHours: Math.max(
                                        sla.responseHours,
                                        Number.parseInt(e.target.value) || 1,
                                      ),
                                    },
                                  },
                                })
                              }
                            />
                          </div>
                        </div>
                        {priority !== TicketPriority.Low && (
                          <Separator className="bg-border/50" />
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Priority Levels */}
          <TabsContent value="priorities" className="mt-4">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="font-display text-sm">
                    Priority Levels
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Customize the display labels for each priority level.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {priorityOrder.map((priority) => (
                    <div key={priority} className="flex items-center gap-3">
                      <Badge
                        variant="outline"
                        className={`text-xs w-20 justify-center flex-shrink-0 ${priorityColors[priority]}`}
                      >
                        {priority}
                      </Badge>
                      <Input
                        data-ocid={`settings.priority_label_${priority.toLowerCase()}_input`}
                        value={settings.priorityLabels[priority]}
                        onChange={(e) =>
                          update({
                            priorityLabels: {
                              ...settings.priorityLabels,
                              [priority]: e.target.value,
                            },
                          })
                        }
                        placeholder={`Label for ${priority}`}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Assignment Rules */}
          <TabsContent value="assignment" className="mt-4">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="font-display text-sm">
                    Assignment Rules
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Configure how tickets are assigned to IT agents.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-3">
                    <Label className="text-sm">Assignment Mode</Label>
                    <div className="space-y-2">
                      {[
                        {
                          value: "auto",
                          label: "Auto-assign only",
                          desc: "Tickets are automatically assigned based on rules",
                        },
                        {
                          value: "manual",
                          label: "Manual assignment only",
                          desc: "Agents and admins manually assign tickets",
                        },
                        {
                          value: "both",
                          label: "Both (recommended)",
                          desc: "Auto-assign with manual override capability",
                        },
                      ].map((opt) => (
                        <button
                          type="button"
                          key={opt.value}
                          data-ocid={`settings.assignment_mode_${opt.value}_button`}
                          onClick={() =>
                            update({
                              assignmentMode:
                                opt.value as SystemSettings["assignmentMode"],
                            })
                          }
                          className={`w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-all ${
                            settings.assignmentMode === opt.value
                              ? "border-primary/50 bg-primary/5"
                              : "border-border hover:border-border/80 hover:bg-accent/30"
                          }`}
                        >
                          <div
                            className={`mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                              settings.assignmentMode === opt.value
                                ? "border-primary"
                                : "border-muted-foreground/50"
                            }`}
                          >
                            {settings.assignmentMode === opt.value && (
                              <div className="w-2 h-2 rounded-full bg-primary" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{opt.label}</p>
                            <p className="text-xs text-muted-foreground">
                              {opt.desc}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <Separator className="bg-border" />

                  <div className="space-y-3">
                    <Label className="text-sm">Auto-assignment Rules</Label>
                    <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                      <div>
                        <p className="text-sm font-medium">
                          Assign by Category
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Route tickets to agents skilled in the ticket's
                          category
                        </p>
                      </div>
                      <Switch
                        data-ocid="settings.auto_assign_category_switch"
                        checked={settings.autoAssignByCategory}
                        onCheckedChange={(v) =>
                          update({ autoAssignByCategory: v })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                      <div>
                        <p className="text-sm font-medium">Assign by Skill</p>
                        <p className="text-xs text-muted-foreground">
                          Match tickets to agents with the required skill set
                        </p>
                      </div>
                      <Switch
                        data-ocid="settings.auto_assign_skill_switch"
                        checked={settings.autoAssignBySkill}
                        onCheckedChange={(v) =>
                          update({ autoAssignBySkill: v })
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Approval Workflows */}
          <TabsContent value="approvals" className="mt-4">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="font-display text-sm">
                    Approval Workflows
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Define who can approve Change Requests and whether approvals
                    are required.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div>
                      <p className="text-sm font-medium">
                        Require Approval for Changes
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Change requests must be approved before implementation
                      </p>
                    </div>
                    <Switch
                      data-ocid="settings.approval_required_switch"
                      checked={settings.approvalRequired}
                      onCheckedChange={(v) => update({ approvalRequired: v })}
                    />
                  </div>

                  <Separator className="bg-border" />

                  <div className="space-y-2">
                    <Label className="text-sm">Approver Roles</Label>
                    <p className="text-xs text-muted-foreground">
                      Select which roles can approve change requests.
                    </p>
                    <div className="space-y-2">
                      {["ITAgent", "Manager", "MasterAdmin"].map((role) => {
                        const isSelected =
                          settings.approvalRoles.includes(role);
                        return (
                          <button
                            type="button"
                            key={role}
                            data-ocid={`settings.approver_role_${role.toLowerCase()}_button`}
                            onClick={() =>
                              update({
                                approvalRoles: isSelected
                                  ? settings.approvalRoles.filter(
                                      (r) => r !== role,
                                    )
                                  : [...settings.approvalRoles, role],
                              })
                            }
                            className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                              isSelected
                                ? "border-primary/50 bg-primary/5"
                                : "border-border hover:bg-accent/30"
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                isSelected
                                  ? "border-primary bg-primary"
                                  : "border-muted-foreground/50"
                              }`}
                            >
                              {isSelected && (
                                <CheckCircle2 className="h-2.5 w-2.5 text-primary-foreground" />
                              )}
                            </div>
                            <span className="text-sm font-medium">
                              {role === "ITAgent"
                                ? "IT Agent"
                                : role === "Manager"
                                  ? "Manager"
                                  : "Master Admin"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="mt-4">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="font-display text-sm">
                    Notification Preferences
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Configure which system events trigger notifications.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    {
                      key: "notifyOnTicketCreate" as const,
                      label: "New Ticket Created",
                      desc: "Notify when a new incident or service request is submitted",
                      ocid: "settings.notify_ticket_create_switch",
                    },
                    {
                      key: "notifyOnTicketAssign" as const,
                      label: "Ticket Assigned",
                      desc: "Notify agent when a ticket is assigned to them",
                      ocid: "settings.notify_ticket_assign_switch",
                    },
                    {
                      key: "notifyOnSLABreach" as const,
                      label: "SLA Breach Alert",
                      desc: "Notify when a ticket is about to breach or has breached its SLA",
                      ocid: "settings.notify_sla_breach_switch",
                    },
                    {
                      key: "notifyOnChangeApproval" as const,
                      label: "Change Approval Required",
                      desc: "Notify approvers when a change request is submitted for approval",
                      ocid: "settings.notify_change_approval_switch",
                    },
                    {
                      key: "notifyOnEscalation" as const,
                      label: "Ticket Escalation",
                      desc: "Notify when a ticket is automatically escalated due to SLA breach",
                      ocid: "settings.notify_escalation_switch",
                    },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between p-3 rounded-lg border border-border"
                    >
                      <div>
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.desc}
                        </p>
                      </div>
                      <Switch
                        data-ocid={item.ocid}
                        checked={settings[item.key]}
                        onCheckedChange={(v) => update({ [item.key]: v })}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
