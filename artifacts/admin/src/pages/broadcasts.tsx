import { useState } from "react";
import { Megaphone, Send, Users, CheckCircle2, Clock } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  useAdminListBroadcasts,
  useAdminSendBroadcast,
  getAdminListBroadcastsQueryKey,
} from "@workspace/api-client-react";

const TITLE_MAX = 80;
const BODY_MAX = 240;

function formatWhen(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function Broadcasts() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const { data, isLoading } = useAdminListBroadcasts({
    query: { queryKey: getAdminListBroadcastsQueryKey() },
  });

  const send = useAdminSendBroadcast();

  const canSend =
    title.trim().length > 0 && body.trim().length > 0 && !send.isPending;

  const handleSend = async () => {
    if (!canSend) return;
    try {
      const result = await send.mutateAsync({
        data: { title: title.trim(), body: body.trim() },
      });
      toast.success(
        `Broadcast sent — delivered to ${result.successCount} of ${result.recipientCount} device${result.recipientCount === 1 ? "" : "s"}.`,
      );
      setTitle("");
      setBody("");
      await queryClient.invalidateQueries({
        queryKey: getAdminListBroadcastsQueryKey(),
      });
    } catch {
      toast.error("Could not send the broadcast. Please try again.");
    }
  };

  const broadcasts = data?.broadcasts ?? [];

  return (
    <AppShell>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Broadcast Center</h1>
        <p className="text-muted-foreground">
          Send a push notification to every Netraksh app user. Use it for scam
          alerts and important safety updates.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-2 h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Megaphone className="w-4 h-4 text-[#FF6713]" />
              New Broadcast
            </CardTitle>
            <CardDescription>
              Delivered instantly to all registered devices.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="broadcast-title">Title</Label>
              <Input
                id="broadcast-title"
                value={title}
                maxLength={TITLE_MAX}
                placeholder="e.g. New UPI scam alert"
                onChange={(e) => setTitle(e.target.value)}
              />
              <p className="text-xs text-muted-foreground text-right">
                {title.length}/{TITLE_MAX}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="broadcast-body">Message</Label>
              <Textarea
                id="broadcast-body"
                value={body}
                maxLength={BODY_MAX}
                rows={4}
                placeholder="Describe the threat and what users should do."
                onChange={(e) => setBody(e.target.value)}
              />
              <p className="text-xs text-muted-foreground text-right">
                {body.length}/{BODY_MAX}
              </p>
            </div>
            <Button
              className="w-full"
              disabled={!canSend}
              onClick={handleSend}
            >
              <Send className="w-4 h-4 mr-2" />
              {send.isPending ? "Sending…" : "Send Broadcast"}
            </Button>
          </CardContent>
        </Card>

        <div className="lg:col-span-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Recent Broadcasts
          </h2>

          {isLoading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : broadcasts.length === 0 ? (
            <Card className="border-dashed bg-transparent shadow-none">
              <CardHeader>
                <CardTitle className="text-base">No broadcasts yet</CardTitle>
                <CardDescription>
                  Messages you send will appear here with their delivery counts.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="space-y-3">
              {broadcasts.map((b) => (
                <Card key={b.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{b.title}</p>
                        <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                          {b.body}
                        </p>
                      </div>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap shrink-0">
                        <Clock className="w-3 h-3" />
                        {formatWhen(b.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {b.recipientCount.toLocaleString("en-IN")} targeted
                      </span>
                      <span className="flex items-center gap-1 text-[#138808]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {b.successCount.toLocaleString("en-IN")} delivered
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
