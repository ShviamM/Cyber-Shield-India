import { Shield, PhoneCall, AlertTriangle, TrendingUp, Bell, ChevronRight, Lock, Eye, Wifi, User, X, CheckCircle, Phone, MessageSquare } from "lucide-react";

export function Shield_() {
  const recentCalls = [
    { number: "+91 98765 43210", label: "SPAM", type: "Telemarketer", time: "2 min ago", risk: "high" },
    { number: "+91 80000 12345", label: "SCAM", type: "KYC Fraud", time: "15 min ago", risk: "critical" },
    { number: "+91 11234 56789", label: "SAFE", type: "Verified", time: "1 hr ago", risk: "safe" },
    { number: "+91 70099 88776", label: "SPAM", type: "Insurance", time: "2 hr ago", risk: "high" },
    { number: "+91 98100 00001", label: "DANGER", type: "Cyber Crime", time: "3 hr ago", risk: "critical" },
  ];

  const stats = [
    { label: "Blocked Today", value: "127", icon: Shield, color: "#ef4444" },
    { label: "Threats Detected", value: "43", icon: AlertTriangle, color: "#f97316" },
    { label: "Safe Calls", value: "89", icon: CheckCircle, color: "#22c55e" },
  ];

  return (
    <div style={{
      fontFamily: "'Inter', sans-serif",
      background: "#0a0e1a",
      minHeight: "100vh",
      color: "#fff",
      width: "390px",
      overflow: "hidden",
      position: "relative"
    }}>
      {/* Status bar */}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 20px 0", fontSize: 12, color: "#94a3b8" }}>
        <span style={{ fontWeight: 600 }}>9:41</span>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <Wifi size={13} />
          <span style={{ fontSize: 13, fontWeight: 700 }}>●●●●</span>
        </div>
      </div>

      {/* Header */}
      <div style={{ padding: "16px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: "linear-gradient(135deg, #ef4444, #7c3aed)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <Shield size={16} color="#fff" />
            </div>
            <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: -0.5, color: "#fff" }}>KavachApp</span>
          </div>
          <p style={{ margin: "4px 0 0 40px", fontSize: 11, color: "#64748b" }}>Active Protection</p>
        </div>
        <div style={{ position: "relative" }}>
          <Bell size={20} color="#94a3b8" />
          <div style={{
            position: "absolute", top: -4, right: -4,
            width: 10, height: 10, borderRadius: "50%",
            background: "#ef4444", border: "2px solid #0a0e1a"
          }} />
        </div>
      </div>

      {/* Threat Level Card */}
      <div style={{ margin: "20px 20px 0", position: "relative", overflow: "hidden" }}>
        <div style={{
          background: "linear-gradient(135deg, #1a0a2e 0%, #16213e 50%, #0f172a 100%)",
          borderRadius: 20,
          padding: "20px",
          border: "1px solid rgba(239,68,68,0.2)",
          position: "relative"
        }}>
          {/* Glow effect */}
          <div style={{
            position: "absolute", top: -30, right: -30,
            width: 100, height: 100,
            borderRadius: "50%",
            background: "rgba(239,68,68,0.15)",
            filter: "blur(30px)"
          }} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <p style={{ margin: 0, fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: 1.5 }}>Threat Level</p>
              <p style={{ margin: "4px 0 0", fontSize: 28, fontWeight: 900, color: "#ef4444" }}>HIGH</p>
              <p style={{ margin: "4px 0 0", fontSize: 11, color: "#94a3b8" }}>5 spam calls blocked today</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{
                width: 64, height: 64,
                borderRadius: "50%",
                background: "conic-gradient(#ef4444 0deg 230deg, #1e293b 230deg 360deg)",
                display: "flex", alignItems: "center", justifyContent: "center",
                position: "relative"
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: "50%",
                  background: "#0a0e1a",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 800, color: "#ef4444"
                }}>64%</div>
              </div>
            </div>
          </div>

          {/* Threat bar */}
          <div style={{ marginTop: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: "#64748b" }}>Risk Index</span>
              <span style={{ fontSize: 11, color: "#ef4444", fontWeight: 700 }}>HIGH — 64/100</span>
            </div>
            <div style={{ height: 6, background: "#1e293b", borderRadius: 3, overflow: "hidden" }}>
              <div style={{
                width: "64%", height: "100%",
                background: "linear-gradient(90deg, #f97316, #ef4444)",
                borderRadius: 3
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: "flex", gap: 10, margin: "14px 20px 0" }}>
        {stats.map((s, i) => (
          <div key={i} style={{
            flex: 1,
            background: "#111827",
            borderRadius: 14,
            padding: "12px 10px",
            border: "1px solid rgba(255,255,255,0.05)",
            textAlign: "center"
          }}>
            <s.icon size={16} color={s.color} style={{ margin: "0 auto 6px" }} />
            <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</p>
            <p style={{ margin: "2px 0 0", fontSize: 9, color: "#475569", lineHeight: 1.2 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ margin: "16px 20px 0" }}>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{
            flex: 1, padding: "12px", borderRadius: 12,
            background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
            border: "none", color: "#fff", fontSize: 12, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer"
          }}>
            <Phone size={14} /> Report Call
          </button>
          <button style={{
            flex: 1, padding: "12px", borderRadius: 12,
            background: "linear-gradient(135deg, #ef4444, #dc2626)",
            border: "none", color: "#fff", fontSize: 12, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer"
          }}>
            <AlertTriangle size={14} /> File Complaint
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{ margin: "18px 20px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>Recent Activity</p>
          <span style={{ fontSize: 11, color: "#7c3aed", fontWeight: 600 }}>View All</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {recentCalls.map((call, i) => (
            <div key={i} style={{
              background: "#111827",
              borderRadius: 12,
              padding: "12px 14px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              border: `1px solid ${call.risk === "critical" ? "rgba(239,68,68,0.2)" : call.risk === "safe" ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.04)"}`
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: call.risk === "critical" ? "rgba(239,68,68,0.15)" :
                            call.risk === "safe" ? "rgba(34,197,94,0.15)" : "rgba(249,115,22,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
              }}>
                {call.risk === "safe"
                  ? <CheckCircle size={16} color="#22c55e" />
                  : <PhoneCall size={16} color={call.risk === "critical" ? "#ef4444" : "#f97316"} />
                }
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0" }}>{call.number}</span>
                  <span style={{
                    fontSize: 9, fontWeight: 800,
                    color: call.risk === "critical" ? "#ef4444" : call.risk === "safe" ? "#22c55e" : "#f97316",
                    background: call.risk === "critical" ? "rgba(239,68,68,0.1)" : call.risk === "safe" ? "rgba(34,197,94,0.1)" : "rgba(249,115,22,0.1)",
                    padding: "2px 6px", borderRadius: 4
                  }}>{call.label}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
                  <span style={{ fontSize: 10, color: "#475569" }}>{call.type}</span>
                  <span style={{ fontSize: 10, color: "#334155" }}>{call.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Nav */}
      <div style={{
        position: "fixed", bottom: 0, width: 390,
        background: "#0d1117",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        display: "flex", justifyContent: "space-around", padding: "12px 0 24px"
      }}>
        {[
          { icon: Shield, label: "Home", active: true },
          { icon: PhoneCall, label: "Calls" },
          { icon: AlertTriangle, label: "Report" },
          { icon: TrendingUp, label: "Stats" },
          { icon: User, label: "Profile" },
        ].map((nav, i) => (
          <div key={i} style={{ textAlign: "center", cursor: "pointer" }}>
            <nav.icon size={20} color={nav.active ? "#7c3aed" : "#334155"} />
            <p style={{ margin: "3px 0 0", fontSize: 9, color: nav.active ? "#7c3aed" : "#334155", fontWeight: nav.active ? 700 : 400 }}>
              {nav.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export { Shield_ as Shield };
