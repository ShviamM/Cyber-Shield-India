import { useMemo, useState } from "react";
import { BellRing, Download, Mail, Phone, Search } from "lucide-react";
import { format } from "date-fns";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAdminListWaitlist,
  getAdminListWaitlistQueryKey,
  type WaitlistEntry,
} from "@workspace/api-client-react";

function toCsv(entries: WaitlistEntry[]): string {
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const rows = entries.map((e) => [e.contact, e.contactType, e.lang, e.source, e.createdAt].map(esc).join(","));
  return ["contact,type,language,source,signed_up_at", ...rows].join("\n");
}

function downloadCsv(entries: WaitlistEntry[]) {
  const blob = new Blob([toCsv(entries)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `netraksh-launch-waitlist-${format(new Date(), "yyyy-MM-dd")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Waitlist() {
  const [query, setQuery] = useState("");
  const { data, isLoading, isError } = useAdminListWaitlist({
    query: { queryKey: getAdminListWaitlistQueryKey() },
  });

  const entries = data?.entries ?? [];
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? entries.filter((e) => e.contact.toLowerCase().includes(q)) : entries;
  }, [entries, query]);
  const emails = entries.filter((e) => e.contactType === "email").length;

  return (
    <AppShell>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Launch Waitlist</h1>
          <p className="text-muted-foreground">
            People who asked to be told when the Netraksh app launches, from the website's Download page.
          </p>
        </div>
        <Button onClick={() => downloadCsv(filtered)} disabled={filtered.length === 0} className="gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total sign-ups", value: data?.total, icon: BellRing },
          { label: "Emails", value: data ? emails : undefined, icon: Mail },
          { label: "Mobile numbers", value: data ? entries.length - emails : undefined, icon: Phone },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <s.icon className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-bold">{s.value ?? "—"}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search email or number" className="pl-9" />
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : isError ? (
            <p className="p-8 text-center text-destructive">Couldn't load the waitlist. Check that your role can view business metrics.</p>
          ) : filtered.length === 0 ? (
            <p className="p-8 text-center text-muted-foreground">
              {entries.length === 0 ? "No one has signed up yet." : "No sign-ups match your search."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/40 text-left text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Contact</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Language</th>
                    <th className="px-4 py-3 font-medium">Signed up</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((e) => (
                    <tr key={e.id} className="border-b last:border-0">
                      <td className="px-4 py-3 font-medium">{e.contact}</td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary">{e.contactType === "email" ? "Email" : "Mobile"}</Badge>
                      </td>
                      <td className="px-4 py-3">{e.lang === "hi" ? "Hindi" : "English"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{format(new Date(e.createdAt), "d MMM yyyy, h:mm a")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      {data && data.total > entries.length && (
        <p className="mt-3 text-sm text-muted-foreground">Showing the newest {entries.length} of {data.total}.</p>
      )}
    </AppShell>
  );
}
