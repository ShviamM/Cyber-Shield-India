import { useEffect, useState } from "react";
import { Shield, LogOut, CheckCircle2, XCircle, AlertTriangle, ShieldAlert, ShieldOff, Phone, Clock, Search, ListFilter, Ban } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { useLogout, useAdminListReports, getAdminListReportsQueryKey, useAdminUpdateReport, useAdminVerifyNumber } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import type { UpdateReportStatusRequestStatus } from "@workspace/api-client-react";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const doLogout = useLogout();
  const queryClient = useQueryClient();
  
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchPhone, setSearchPhone] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const updateReport = useAdminUpdateReport();
  const verifyNumber = useAdminVerifyNumber();

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchPhone);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchPhone]);

  const params = {
    status: statusFilter === "all" ? undefined : statusFilter,
    phone: debouncedSearch || undefined,
    limit: 50,
  };

  const { data, isLoading } = useAdminListReports(params, {
    query: {
      queryKey: getAdminListReportsQueryKey(params),
    }
  });

  const handleLogout = async () => {
    try {
      await doLogout.mutateAsync();
    } finally {
      logout();
    }
  };

  const handleUpdateStatus = async (id: string, status: UpdateReportStatusRequestStatus) => {
    try {
      await updateReport.mutateAsync({ id, data: { status } });
      toast.success(`Report marked as ${status}`);
      queryClient.invalidateQueries({ queryKey: getAdminListReportsQueryKey() });
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleVerifyNumber = async (phone: string, verifiedScam: boolean) => {
    try {
      await verifyNumber.mutateAsync({ phone, data: { verifiedScam } });
      toast.success(
        verifiedScam
          ? `Number ${phone} added to blacklist`
          : `Number ${phone} removed from blacklist`,
      );
      queryClient.invalidateQueries({ queryKey: getAdminListReportsQueryKey() });
    } catch (err) {
      toast.error("Failed to update number reputation");
    }
  };

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full border-destructive/20 bg-destructive/5 text-center p-8">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-6">
            This console is restricted to KavachAI administrators. Your account does not have the required permissions.
          </p>
          <Button variant="outline" onClick={handleLogout}>Sign Out</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg tracking-tight">KavachAI Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-right hidden sm:block">
              <p className="font-medium">{user.fullName}</p>
              <p className="text-muted-foreground text-xs">Moderator</p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Sign Out">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Moderation Queue</h1>
            <p className="text-muted-foreground">Review and action community fraud reports.</p>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search phone number..."
                className="pl-9 bg-background"
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
              />
            </div>
          </div>
        </div>

        <Tabs defaultValue="all" value={statusFilter} onValueChange={setStatusFilter} className="w-full">
          <TabsList className="mb-6 bg-background border">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="verified">Verified</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="spam">Spam</TabsTrigger>
          </TabsList>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full" />)}
            </div>
          ) : data?.reports.length === 0 ? (
            <Card className="border-dashed bg-transparent shadow-none">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <ShieldAlert className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-lg font-medium">No reports found</h3>
                <p className="text-muted-foreground">Queue is clear or no results match your filters.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {data?.reports.map(report => (
                <Card key={report.id} className="overflow-hidden transition-all hover:border-primary/20">
                  <div className="flex flex-col md:flex-row border-b md:border-b-0 border-border">
                    <div className="p-4 md:w-64 border-r border-border bg-muted/10 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span className="font-mono font-medium text-lg">{report.phone}</span>
                        </div>
                        <div className="flex gap-2 flex-wrap mb-4 mt-2">
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
                              <Ban className="w-3 h-3" /> Blacklisted
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-xs text-muted-foreground space-y-1">
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
                        <p className="text-sm whitespace-pre-wrap">{report.description}</p>
                        {report.incidentDate && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Incident occurred: {format(new Date(report.incidentDate), "MMM d, yyyy")}
                          </p>
                        )}
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
                            onClick={() => handleVerifyNumber(report.phone, false)}
                            disabled={verifyNumber.isPending}
                          >
                            <ShieldOff className="w-4 h-4 mr-1" /> Remove from Blacklist
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleVerifyNumber(report.phone, true)}
                            disabled={verifyNumber.isPending}
                          >
                            <Ban className="w-4 h-4 mr-1" /> Blacklist Number
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Tabs>
      </main>
    </div>
  );
}
