import { useState } from "react";
import { CheckCircle2, Inbox, Mail, RotateCcw } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useAdminListContactMessages,
  getAdminListContactMessagesQueryKey,
  useAdminUpdateContactMessage,
  type AdminListContactMessagesStatus,
} from "@workspace/api-client-react";

const SUBJECT_LABELS: Record<string, string> = {
  support: "Support",
  partnership: "Partnership",
  media: "Media",
  other: "Other",
};

type Filter = "new" | "handled" | "all";

export default function ContactMessages() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<Filter>("new");
  const params = filter === "all" ? undefined : { status: filter as AdminListContactMessagesStatus };
  const { data, isLoading, isError } = useAdminListContactMessages(params, {
    query: { queryKey: getAdminListContactMessagesQueryKey(params) },
  });
  const update = useAdminUpdateContactMessage();

  const setStatus = async (id: string, status: "new" | "handled") => {
    try {
      await update.mutateAsync({ id, data: { status } });
      toast.success(status === "handled" ? "Marked as handled" : "Moved back to new");
      await queryClient.invalidateQueries({ queryKey: getAdminListContactMessagesQueryKey() });
    } catch {
      toast.error("Couldn't update the message. Please try again.");
    }
  };

  const messages = data?.messages ?? [];

  return (
    <AppShell>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Contact Messages</h1>
        <p className="text-muted-foreground">
          Messages sent through the website's Contact page. Reply by email, then mark them as handled.
        </p>
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)} className="mb-6">
        <TabsList>
          <TabsTrigger value="new">New{data ? ` (${data.newCount})` : ""}</TabsTrigger>
          <TabsTrigger value="handled">Handled</TabsTrigger>
          <TabsTrigger value="all">All{data ? ` (${data.total})` : ""}</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      ) : isError ? (
        <Card><CardContent className="p-8 text-center text-destructive">Couldn't load messages. Check that your role can view business metrics.</CardContent></Card>
      ) : messages.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-10 text-center text-muted-foreground">
            <Inbox className="h-10 w-10" />
            {filter === "new" ? "No new messages. You're all caught up." : "No messages here yet."}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {messages.map((m) => (
            <Card key={m.id} className={m.status === "new" ? "border-primary/30" : ""}>
              <CardContent className="p-5">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{m.name}</span>
                  <a href={`mailto:${m.email}`} className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                    <Mail className="h-3.5 w-3.5" />
                    {m.email}
                  </a>
                  <Badge variant="secondary">{SUBJECT_LABELS[m.subject] ?? m.subject}</Badge>
                  {m.lang === "hi" && <Badge variant="outline">Hindi</Badge>}
                  {m.status === "new" && <Badge>New</Badge>}
                  <span className="ml-auto text-sm text-muted-foreground">{format(new Date(m.createdAt), "d MMM yyyy, h:mm a")}</span>
                </div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.message}</p>
                <div className="mt-4 flex gap-2">
                  {m.status === "new" ? (
                    <Button size="sm" onClick={() => setStatus(m.id, "handled")} disabled={update.isPending} className="gap-1.5">
                      <CheckCircle2 className="h-4 w-4" />
                      Mark as handled
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => setStatus(m.id, "new")} disabled={update.isPending} className="gap-1.5">
                      <RotateCcw className="h-4 w-4" />
                      Move back to new
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
