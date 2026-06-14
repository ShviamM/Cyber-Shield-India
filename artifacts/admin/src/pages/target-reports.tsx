import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, ShieldAlert, ShieldOff, Link2, AtSign, Clock, Search, Ban, Activity } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { format } from "date-fns";
import {
  useAdminListTargetReports,
  getAdminListTargetReportsQueryKey,
  useAdminUpdateTargetReport,
  useAdminVerifyTarget,
} from "@workspace/api-client-react";
import type { AdminTargetReport } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { UpdateReportStatusRequestStatus } from "@workspace/api-client-react";

type TargetType = "url" | "upi";

type PendingVerify = {
  targetType: TargetType;
  targetValue: string;
  verifiedScam: boolean;
};

export default function TargetReports() {
  const queryClient = useQueryClient();

  const PAGE_SIZE = 20;

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [jumpValue, setJumpValue] = useState("");
  const [reports, setReports] = useState<AdminTargetReport[]>([]);
  const [pendingVerify, setPendingVerify] = useState<PendingVerify | null>(null);

  const updateReport = useAdminUpdateTargetReport();
  const verifyTarget = useAdminVerifyTarget();

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Reset to the first page whenever the active filters or search change
  const filterKey = `${statusFilter}|${typeFilter}|${debouncedSearch}`;
  useEffect(() => {
    setPage(1);
  }, [filterKey]);

  const params = {
    status: statusFilter === "all" ? undefined : statusFilter,
    type: typeFilter === "all" ? undefined : (typeFilter as TargetType),
    search: debouncedSearch || undefined,
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  };

  const { data, isLoading, isFetching } = useAdminListTargetReports(params, {
    query: {
      queryKey: getAdminListTargetReportsQueryKey(params),
    },
  });

  // Mirror the current page's reports into local state (supports optimistic edits)
  useEffect(() => {
    if (!data) return;
    setReports(data.reports);
  }, [data]);

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const goToPage = (target: number) => {
    const clamped = Math.min(Math.max(1, target), totalPages);
    setPage(clamped);
  };

  const handleJump = () => {
    const parsed = parseInt(jumpValue, 10);
    if (!Number.isNaN(parsed)) goToPage(parsed);
    setJumpValue("");
  };

  const pageNumbers: (number | "ellipsis")[] = (() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | "ellipsis")[] = [1];
    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);
    if (start > 2) pages.push("ellipsis");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages - 1) pages.push("ellipsis");
    pages.push(totalPages);
    return pages;
  })();

  const handleUpdateStatus = async (id: string, status: UpdateReportStatusRequestStatus) => {
    try {
      await updateReport.mutateAsync({ id, data: { status } });
      toast.success(`Report marked as ${status}`);
      setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
      queryClient.invalidateQueries({ queryKey: getAdminListTargetReportsQueryKey() });
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleVerifyTarget = async () => {
    if (!pendingVerify) return;
    const { targetType, targetValue, verifiedScam } = pendingVerify;
    try {
      await verifyTarget.mutateAsync({ data: { targetType, targetValue, verifiedScam } });
      toast.success(
        verifiedScam
          ? `${targetValue} marked as verified scam`
          : `${targetValue} cleared`,
      );
      setReports((prev) =>
        prev.map((r) =>
          r.targetType === targetType && r.targetValue === targetValue
            ? { ...r, verifiedScam }
            : r,
        ),
      );
      queryClient.invalidateQueries({ queryKey: getAdminListTargetReportsQueryKey() });
    } catch (err) {
      toast.error("Failed to update target reputation");
    } finally {
      setPendingVerify(null);
    }
  };

  return (
    <AppShell>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Link &amp; UPI Reports</h1>
          <p className="text-muted-foreground">
            Review community reports for scam links and UPI IDs.
            {!isLoading && total > 0 && (
              <span className="ml-1">
                Showing {(page - 1) * PAGE_SIZE + 1}&ndash;{Math.min(page * PAGE_SIZE, total)} of {total} report{total === 1 ? "" : "s"} (page {page} of {totalPages}).
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search link or UPI ID..."
              className="pl-9 bg-background"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList className="bg-background border">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="verified">Verified</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="spam">Spam</TabsTrigger>
          </TabsList>
        </Tabs>

        <Tabs value={typeFilter} onValueChange={setTypeFilter}>
          <TabsList className="bg-background border">
            <TabsTrigger value="all">All types</TabsTrigger>
            <TabsTrigger value="url">Links</TabsTrigger>
            <TabsTrigger value="upi">UPI IDs</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      ) : reports.length === 0 ? (
        <Card className="border-dashed bg-transparent shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <ShieldAlert className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-medium">No reports found</h3>
            <p className="text-muted-foreground">Queue is clear or no results match your filters.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => {
            const TypeIcon = report.targetType === "upi" ? AtSign : Link2;
            return (
              <Card key={report.id} className="overflow-hidden transition-all hover:border-primary/20">
                <div className="flex flex-col md:flex-row border-b md:border-b-0 border-border">
                  <div className="p-4 md:w-72 border-r border-border bg-muted/10 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <TypeIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="font-mono font-medium text-sm break-all">{report.targetValue}</span>
                      </div>
                      <div className="flex gap-2 flex-wrap mb-3 mt-2">
                        <Badge variant="outline" className="bg-background uppercase">
                          {report.targetType}
                        </Badge>
                        <Badge variant="outline" className="bg-background">
                          {report.categoryKey}
                        </Badge>
                        <Badge variant={
                          report.status === 'verified' ? 'destructive' :
                          report.status === 'rejected' ? 'secondary' :
                          report.status === 'spam' ? 'secondary' : 'default'
                        }>
                          {report.status}
                        </Badge>
                        {report.verifiedScam && (
                          <Badge variant="destructive" className="gap-1">
                            <Ban className="w-3 h-3" /> Verified scam
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-foreground">
                        <Activity className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="font-medium">{report.reportCount}</span>
                        <span className="text-muted-foreground">
                          total {report.reportCount === 1 ? "report" : "reports"}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground space-y-1 mt-4">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Reported: {format(new Date(report.createdAt), "MMM d, yyyy")}
                      </div>
                      <div>By: {report.reporterName || 'Anonymous'}</div>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wider">Report Details</h4>
                      <p className="text-sm whitespace-pre-wrap break-words">{report.description}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-border/50">
                      <span className="text-xs font-semibold mr-2 text-muted-foreground">ACTIONS:</span>
                      {report.status !== 'verified' && (
                        <Button size="sm" variant="destructive" onClick={() => handleUpdateStatus(report.id, 'verified')} disabled={updateReport.isPending}>
                          <CheckCircle2 className="w-4 h-4 mr-1" /> Verify Scam
                        </Button>
                      )}
                      {report.status !== 'rejected' && (
                        <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(report.id, 'rejected')} disabled={updateReport.isPending}>
                          <XCircle className="w-4 h-4 mr-1" /> Reject
                        </Button>
                      )}
                      {report.status !== 'spam' && (
                        <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => handleUpdateStatus(report.id, 'spam')} disabled={updateReport.isPending}>
                          Mark as Spam
                        </Button>
                      )}
                      <div className="flex-1" />
                      {report.verifiedScam ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setPendingVerify({ targetType: report.targetType, targetValue: report.targetValue, verifiedScam: false })}
                          disabled={verifyTarget.isPending}
                        >
                          <ShieldOff className="w-4 h-4 mr-1" /> Clear Verified Scam
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setPendingVerify({ targetType: report.targetType, targetValue: report.targetValue, verifiedScam: true })}
                          disabled={verifyTarget.isPending}
                        >
                          <Ban className="w-4 h-4 mr-1" /> Mark Verified Scam
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}

          {totalPages > 1 && (
            <div className="flex flex-col items-center gap-3 pt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => { e.preventDefault(); goToPage(page - 1); }}
                      aria-disabled={page === 1}
                      className={page === 1 ? "pointer-events-none opacity-50" : undefined}
                    />
                  </PaginationItem>

                  {pageNumbers.map((p, i) =>
                    p === "ellipsis" ? (
                      <PaginationItem key={`ellipsis-${i}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={p}>
                        <PaginationLink
                          href="#"
                          isActive={p === page}
                          onClick={(e) => { e.preventDefault(); goToPage(p); }}
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => { e.preventDefault(); goToPage(page + 1); }}
                      aria-disabled={page === totalPages}
                      className={page === totalPages ? "pointer-events-none opacity-50" : undefined}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {isFetching && <span>Loading&hellip;</span>}
                <span>Jump to page</span>
                <Input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={jumpValue}
                  onChange={(e) => setJumpValue(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleJump(); }}
                  placeholder={`${page}`}
                  className="h-8 w-20 bg-background"
                />
                <Button size="sm" variant="outline" onClick={handleJump} disabled={!jumpValue}>
                  Go
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <AlertDialog open={pendingVerify !== null} onOpenChange={(open) => { if (!open) setPendingVerify(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingVerify?.verifiedScam ? "Mark as verified scam?" : "Clear verified scam?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingVerify?.verifiedScam ? (
                <>
                  This will mark <span className="font-mono font-medium text-foreground break-all">{pendingVerify?.targetValue}</span> as a verified scam, emitting a high-confidence signal whenever anyone checks it.
                </>
              ) : (
                <>
                  This will clear the verified-scam reputation for <span className="font-mono font-medium text-foreground break-all">{pendingVerify?.targetValue}</span>.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={verifyTarget.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); handleVerifyTarget(); }}
              disabled={verifyTarget.isPending}
            >
              {verifyTarget.isPending
                ? "Saving..."
                : pendingVerify?.verifiedScam
                ? "Mark Verified Scam"
                : "Clear Verified Scam"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
