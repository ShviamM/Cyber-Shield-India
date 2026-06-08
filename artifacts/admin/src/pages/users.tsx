import { useMemo, useState } from "react";
import {
  Users as UsersIcon,
  Search,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Gift,
  CalendarClock,
  Ban,
  RotateCcw,
  History,
  Loader2,
  Crown,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useAdminUsers,
  getAdminUsersQueryKey,
  useAdminGetUser,
  getAdminGetUserQueryKey,
  useAdminGetUserAudit,
  getAdminGetUserAuditQueryKey,
  useAdminListRoles,
  getAdminListRolesQueryKey,
  useAdminExtendTrial,
  useAdminActivateTrial,
  useAdminResetTrial,
  useAdminUpdateUserRole,
  useAdminUpdateUserStatus,
} from "@workspace/api-client-react";

const PAGE_SIZE = 20;

function formatDate(value?: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value?: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusBadgeClass(status: string): string {
  switch (status) {
    case "suspended":
      return "bg-amber-500/10 text-amber-600 border-amber-500/20";
    case "blocked":
      return "bg-destructive/10 text-destructive border-destructive/20";
    default:
      return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
  }
}

export default function Users() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const params = useMemo(
    () => ({
      ...(search ? { search } : {}),
      ...(roleFilter !== "all" ? { role: roleFilter } : {}),
      ...(statusFilter !== "all" ? { status: statusFilter } : {}),
      page,
      pageSize: PAGE_SIZE,
    }),
    [search, roleFilter, statusFilter, page],
  );

  const { data, isLoading } = useAdminUsers(params, {
    query: { queryKey: getAdminUsersQueryKey(params) },
  });
  const { data: rolesData } = useAdminListRoles({
    query: { queryKey: getAdminListRolesQueryKey() },
  });

  const users = data?.users ?? [];
  const total = data?.total ?? 0;
  const roles = rolesData?.roles ?? [];
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const submitSearch = () => {
    setPage(1);
    setSearch(searchInput.trim());
  };

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <UsersIcon className="w-6 h-6 text-[#0B3D91]" />
          User Management
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Search members, manage trials, roles and account status.
        </p>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground">Search</Label>
              <div className="mt-1 flex gap-2">
                <Input
                  placeholder="Name or phone…"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submitSearch()}
                />
                <Button onClick={submitSearch} variant="secondary">
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="w-full sm:w-44">
              <Label className="text-xs text-muted-foreground">Role</Label>
              <Select
                value={roleFilter}
                onValueChange={(v) => {
                  setPage(1);
                  setRoleFilter(v);
                }}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All roles</SelectItem>
                  {roles.map((r) => (
                    <SelectItem key={r.name} value={r.name}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-44">
              <Label className="text-xs text-muted-foreground">Status</Label>
              <Select
                value={statusFilter}
                onValueChange={(v) => {
                  setPage(1);
                  setStatusFilter(v);
                }}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-5 space-y-3">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-2/3" />
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center">
              <UsersIcon className="w-8 h-8 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-sm font-medium">No users found</p>
              <p className="text-xs text-muted-foreground mt-1">
                Try adjusting your search or filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Phone</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Plan</th>
                    <th className="px-4 py-3 font-medium">Devices</th>
                    <th className="px-4 py-3 font-medium">Reports</th>
                    <th className="px-4 py-3 font-medium">Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr
                      key={u.id}
                      className="border-b last:border-0 hover:bg-muted/40 cursor-pointer"
                      onClick={() => setSelectedId(u.id)}
                    >
                      <td className="px-4 py-3 font-medium">
                        {u.fullName || "—"}
                        {u.isAdmin && (
                          <Crown className="ml-1.5 inline w-3.5 h-3.5 text-[#FF6713]" />
                        )}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-muted-foreground">
                        {u.phone}
                      </td>
                      <td className="px-4 py-3 capitalize">{u.role}</td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className={`capitalize ${statusBadgeClass(u.status)}`}
                        >
                          {u.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 capitalize">{u.plan ?? "—"}</td>
                      <td className="px-4 py-3 tabular-nums">{u.deviceCount}</td>
                      <td className="px-4 py-3 tabular-nums">{u.reportsFiled}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDate(u.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {total > 0
            ? `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, total)} of ${total}`
            : "0 results"}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="tabular-nums">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {selectedId && (
        <UserDetailDialog
          userId={selectedId}
          roles={roles.map((r) => ({ name: r.name, label: r.label }))}
          onClose={() => setSelectedId(null)}
        />
      )}
    </AppShell>
  );
}

function UserDetailDialog({
  userId,
  roles,
  onClose,
}: {
  userId: string;
  roles: { name: string; label: string }[];
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [trialDays, setTrialDays] = useState(7);
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [showAudit, setShowAudit] = useState(false);

  const { data: user, isLoading } = useAdminGetUser(userId, {
    query: { queryKey: getAdminGetUserQueryKey(userId) },
  });
  const { data: auditData } = useAdminGetUserAudit(userId, {
    query: { queryKey: getAdminGetUserAuditQueryKey(userId), enabled: showAudit },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getAdminGetUserQueryKey(userId) });
    queryClient.invalidateQueries({ queryKey: ["/admin/users"] });
    queryClient.invalidateQueries({
      queryKey: getAdminGetUserAuditQueryKey(userId),
    });
  };

  const extendTrial = useAdminExtendTrial();
  const activateTrial = useAdminActivateTrial();
  const resetTrial = useAdminResetTrial();
  const updateRole = useAdminUpdateUserRole();
  const updateStatus = useAdminUpdateUserStatus();

  const busy =
    extendTrial.isPending ||
    activateTrial.isPending ||
    resetTrial.isPending ||
    updateRole.isPending ||
    updateStatus.isPending;

  const trialBody = () => ({
    days: trialDays,
    ...(reason.trim() ? { reason: reason.trim() } : {}),
    ...(note.trim() ? { note: note.trim() } : {}),
  });

  const handleExtend = async () => {
    try {
      await extendTrial.mutateAsync({ id: userId, data: trialBody() });
      toast.success(`Trial extended by ${trialDays} days.`);
      invalidate();
    } catch {
      toast.error("Could not extend the trial.");
    }
  };

  const handleActivate = async () => {
    try {
      await activateTrial.mutateAsync({ id: userId, data: trialBody() });
      toast.success(`Fresh ${trialDays}-day trial activated.`);
      invalidate();
    } catch {
      toast.error("Could not activate the trial.");
    }
  };

  const handleReset = async () => {
    try {
      await resetTrial.mutateAsync({
        id: userId,
        data: reason.trim() ? { reason: reason.trim() } : {},
      });
      toast.success("Trial eligibility reset.");
      invalidate();
    } catch {
      toast.error("Could not reset the trial.");
    }
  };

  const handleRole = async (role: string) => {
    try {
      await updateRole.mutateAsync({
        id: userId,
        data: { role, ...(reason.trim() ? { reason: reason.trim() } : {}) },
      });
      toast.success("Role updated.");
      invalidate();
    } catch {
      toast.error("Could not update the role.");
    }
  };

  const handleStatus = async (status: "active" | "suspended" | "blocked") => {
    try {
      await updateStatus.mutateAsync({
        id: userId,
        data: { status, ...(reason.trim() ? { reason: reason.trim() } : {}) },
      });
      toast.success(`Account ${status}.`);
      invalidate();
    } catch {
      toast.error("Could not update the status.");
    }
  };

  const entries = auditData?.entries ?? [];

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{user?.fullName || "User"}</DialogTitle>
          <DialogDescription>{user?.phone}</DialogDescription>
        </DialogHeader>

        {isLoading || !user ? (
          <div className="space-y-3 py-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-2/3" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              <Stat label="Role" value={user.role} />
              <Stat
                label="Status"
                value={
                  <Badge
                    variant="outline"
                    className={`capitalize ${statusBadgeClass(user.status)}`}
                  >
                    {user.status}
                  </Badge>
                }
              />
              <Stat label="Devices" value={String(user.deviceCount)} />
              <Stat label="Reports filed" value={String(user.reportsFiled)} />
              <Stat label="Registered" value={formatDate(user.registeredAt)} />
              <Stat
                label="Last login"
                value={formatDateTime(user.lastLoginAt)}
              />
              <Stat
                label="Plan"
                value={user.subscription.plan}
              />
              <Stat
                label="Subscription"
                value={user.subscription.status}
              />
              <Stat
                label="Renews / ends"
                value={formatDate(user.subscription.currentPeriodEnd)}
              />
            </div>

            <div className="rounded-lg border p-4 space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Gift className="w-4 h-4 text-[#FF6713]" />
                Trial controls
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Days</Label>
                  <Input
                    type="number"
                    min={1}
                    max={365}
                    value={trialDays}
                    onChange={(e) =>
                      setTrialDays(
                        Math.max(1, Math.min(365, Number(e.target.value) || 1)),
                      )
                    }
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Reason</Label>
                <Input
                  placeholder="e.g. goodwill, support request"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">
                  Internal note
                </Label>
                <Textarea
                  placeholder="Optional note (admin-only)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="mt-1"
                  rows={2}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={handleExtend} disabled={busy}>
                  <CalendarClock className="w-4 h-4 mr-1" />
                  Extend trial
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleActivate}
                  disabled={busy}
                >
                  <Gift className="w-4 h-4 mr-1" />
                  Activate fresh
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleReset}
                  disabled={busy}
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Reset eligibility
                </Button>
              </div>
            </div>

            <div className="rounded-lg border p-4 space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#0B3D91]" />
                Role &amp; access
              </h3>
              <div className="flex flex-wrap items-end gap-3">
                <div className="w-48">
                  <Label className="text-xs text-muted-foreground">Role</Label>
                  <Select
                    value={user.role}
                    onValueChange={handleRole}
                    disabled={busy || user.isSuperAdmin}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((r) => (
                        <SelectItem key={r.name} value={r.name}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {user.isSuperAdmin && (
                  <p className="text-xs text-muted-foreground pb-2">
                    Super-admin role cannot be changed here.
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {user.status !== "active" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatus("active")}
                    disabled={busy}
                  >
                    Reactivate
                  </Button>
                )}
                {user.status !== "suspended" && !user.isSuperAdmin && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-amber-600 border-amber-500/30 hover:bg-amber-500/10"
                    onClick={() => handleStatus("suspended")}
                    disabled={busy}
                  >
                    <Ban className="w-4 h-4 mr-1" />
                    Suspend
                  </Button>
                )}
                {user.status !== "blocked" && !user.isSuperAdmin && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive border-destructive/30 hover:bg-destructive/10"
                    onClick={() => handleStatus("blocked")}
                    disabled={busy}
                  >
                    <Ban className="w-4 h-4 mr-1" />
                    Block
                  </Button>
                )}
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <button
                className="flex w-full items-center justify-between text-sm font-semibold"
                onClick={() => setShowAudit((s) => !s)}
              >
                <span className="flex items-center gap-2">
                  <History className="w-4 h-4 text-muted-foreground" />
                  Activity history
                </span>
                <span className="text-xs text-muted-foreground">
                  {showAudit ? "Hide" : "Show"}
                </span>
              </button>
              {showAudit && (
                <div className="mt-3 space-y-2">
                  {entries.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      No admin actions recorded for this user.
                    </p>
                  ) : (
                    entries.map((e) => (
                      <div
                        key={e.id}
                        className="rounded-md bg-muted/40 p-2.5 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{e.action}</span>
                          <span className="text-muted-foreground">
                            {formatDateTime(e.createdAt)}
                          </span>
                        </div>
                        <div className="text-muted-foreground mt-0.5">
                          by {e.actorPhone ?? "system"}
                          {e.actorRole ? ` (${e.actorRole})` : ""}
                          {e.reason ? ` — ${e.reason}` : ""}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {busy && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50">
            <Loader2 className="w-6 h-6 animate-spin text-[#0B3D91]" />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium capitalize mt-0.5">{value}</p>
    </div>
  );
}
