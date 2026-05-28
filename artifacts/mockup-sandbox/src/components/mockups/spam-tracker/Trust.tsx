import { Shield, Phone, FileText, Bell, User, ChevronRight, CheckCircle, AlertCircle, Info, HelpCircle, Lock, Search, Mic, Star, Clock, TrendingUp, PhoneCall, Flag } from "lucide-react";

export function Trust() {
  const services = [
    { icon: Phone, label: "Check Number", sublabel: "Instant lookup", color: "#1d4ed8", bg: "#eff6ff" },
    { icon: Flag, label: "Report Spam", sublabel: "Report a call", color: "#15803d", bg: "#f0fdf4" },
    { icon: FileText, label: "File Complaint", sublabel: "Cyber crime portal", color: "#7c3aed", bg: "#f5f3ff" },
    { icon: Lock, label: "DND Registry", sublabel: "Block unwanted calls", color: "#b45309", bg: "#fffbeb" },
  ];

  const recentReports = [
    { number: "+91 98200 10001", type: "Financial Fraud", status: "verified", reports: 4812 },
    { number: "+91 80011 20002", type: "Job Fraud", status: "new", reports: 234 },
    { number: "+91 70099 30003", type: "Impersonation", status: "verified", reports: 1893 },
  ];

  const alerts = [
    { title: "New UPI Fraud Pattern", severity: "high", time: "Today" },
    { title: "Fake TRAI Calls Surge", severity: "medium", time: "Yesterday" },
  ];

  return (
    <div style={{
      fontFamily: "'Inter', sans-serif",
      background: "#f8fafc",
      minHeight: "100vh",
      width: "390px",
      color: "#0f172a",
      overflow: "hidden"
    }}>
      {/* Status bar */}
      <div style={{
        background: "#1d4ed8",
        padding: "12px 20px 0",
        display: "flex", justifyContent: "space-between"
      }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>9:41</span>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.8)" }}>●●●● 4G</span>
      </div>

      {/* Header */}
      <div style={{
        background: "linear-gradient(180deg, #1d4ed8 0%, #1e40af 100%)",
        padding: "14px 20px 28px"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: "rgba(255,255,255,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <Shield size={20} color="#fff" fill="rgba(255,255,255,0.3)" />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 17, fontWeight: 900, color: "#fff", letterSpacing: -0.3 }}>Cyber Mitra</p>
              <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.65)" }}>Ministry of Home Affairs · India</p>
            </div>
          </div>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "rgba(255,255,255,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <Bell size={16} color="#fff" />
          </div>
        </div>

        {/* Search */}
        <div style={{
          marginTop: 18,
          background: "#fff",
          borderRadius: 12,
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          gap: 10
        }}>
          <Search size={16} color="#3b82f6" />
          <span style={{ fontSize: 13, color: "#94a3b8", flex: 1 }}>Search number, complaint ID...</span>
          <Mic size={16} color="#3b82f6" />
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          {[
            { value: "2.4 Cr", label: "DB Entries" },
            { value: "98%", label: "Accuracy" },
            { value: "4.8★", label: "Rating" },
          ].map((s, i) => (
            <div key={i} style={{
              flex: 1,
              background: "rgba(255,255,255,0.12)",
              borderRadius: 10,
              padding: "10px 8px",
              textAlign: "center"
            }}>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#fff" }}>{s.value}</p>
              <p style={{ margin: "2px 0 0", fontSize: 9, color: "rgba(255,255,255,0.65)" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick services */}
      <div style={{ padding: "0 20px", marginTop: -14 }}>
        <div style={{
          background: "#fff",
          borderRadius: 20,
          padding: "18px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
          border: "1px solid rgba(0,0,0,0.04)"
        }}>
          <p style={{ margin: "0 0 14px", fontSize: 12, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: 1 }}>Quick Services</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {services.map((s, i) => (
              <div key={i} style={{
                background: s.bg,
                borderRadius: 14,
                padding: "14px 12px",
                cursor: "pointer",
                border: `1px solid ${s.color}18`
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 8,
                  boxShadow: `0 2px 8px ${s.color}20`
                }}>
                  <s.icon size={18} color={s.color} />
                </div>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#1e293b" }}>{s.label}</p>
                <p style={{ margin: "2px 0 0", fontSize: 10, color: "#64748b" }}>{s.sublabel}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div style={{ padding: "16px 20px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#0f172a" }}>Safety Advisories</p>
          <span style={{ fontSize: 11, color: "#1d4ed8", fontWeight: 600 }}>See All</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {alerts.map((a, i) => (
            <div key={i} style={{
              background: "#fff",
              borderRadius: 12,
              padding: "12px 14px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
              border: "1px solid #f1f5f9"
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: a.severity === "high" ? "#fee2e2" : "#fef3c7",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
              }}>
                <AlertCircle size={18} color={a.severity === "high" ? "#dc2626" : "#d97706"} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#0f172a" }}>{a.title}</p>
                <p style={{ margin: "2px 0 0", fontSize: 10, color: "#94a3b8" }}>Govt Advisory · {a.time}</p>
              </div>
              <div style={{
                padding: "3px 8px", borderRadius: 20,
                background: a.severity === "high" ? "#fee2e2" : "#fef3c7",
                fontSize: 9, fontWeight: 700,
                color: a.severity === "high" ? "#dc2626" : "#d97706"
              }}>
                {a.severity.toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top reported numbers */}
      <div style={{ padding: "16px 20px 100px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#0f172a" }}>Top Reported Numbers</p>
          <span style={{ fontSize: 11, color: "#1d4ed8", fontWeight: 600 }}>Database</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {recentReports.map((r, i) => (
            <div key={i} style={{
              background: "#fff",
              borderRadius: 12,
              padding: "14px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
              border: "1px solid #f1f5f9"
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: "#eff6ff",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
              }}>
                <PhoneCall size={18} color="#1d4ed8" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#0f172a" }}>{r.number}</p>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 4,
                    padding: "2px 7px", borderRadius: 20,
                    background: r.status === "verified" ? "#f0fdf4" : "#eff6ff",
                    border: `1px solid ${r.status === "verified" ? "#bbf7d0" : "#bfdbfe"}`
                  }}>
                    {r.status === "verified"
                      ? <CheckCircle size={9} color="#15803d" />
                      : <Clock size={9} color="#1d4ed8" />
                    }
                    <span style={{ fontSize: 9, fontWeight: 700, color: r.status === "verified" ? "#15803d" : "#1d4ed8" }}>
                      {r.status === "verified" ? "VERIFIED" : "NEW"}
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                  <p style={{ margin: 0, fontSize: 10, color: "#64748b" }}>{r.type}</p>
                  <p style={{ margin: 0, fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>{r.reports.toLocaleString()} reports</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Nav */}
      <div style={{
        position: "fixed", bottom: 0, width: 390,
        background: "#fff",
        borderTop: "1.5px solid #e2e8f0",
        display: "flex", justifyContent: "space-around", padding: "10px 0 22px"
      }}>
        {[
          { icon: Shield, label: "Home", active: true },
          { icon: Search, label: "Lookup" },
          { icon: Flag, label: "Report" },
          { icon: TrendingUp, label: "Stats" },
          { icon: User, label: "Profile" },
        ].map((n, i) => (
          <div key={i} style={{ textAlign: "center", cursor: "pointer" }}>
            <n.icon size={20} color={n.active ? "#1d4ed8" : "#cbd5e1"} />
            <p style={{ margin: "3px 0 0", fontSize: 9, color: n.active ? "#1d4ed8" : "#94a3b8", fontWeight: n.active ? 700 : 400 }}>{n.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
