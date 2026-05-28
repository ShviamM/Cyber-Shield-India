import { Shield, Phone, Link, CreditCard, Eye, Users, Bell, Search, Zap, MessageSquare, ChevronRight, TrendingUp, User, Radio, Wifi, CheckCircle, AlertTriangle, Lock, ArrowRight, Star, MapPin, PhoneCall } from "lucide-react";

const SAFFRON = "#FF6713";
const NAVY = "#0B3D91";
const GREEN = "#138808";

export function Killer() {
  const familyMembers = [
    { name: "Papa", status: "safe", lastSeen: "2m ago", calls: 0 },
    { name: "Mummy", status: "warning", lastSeen: "now", calls: 1 },
    { name: "Dadi", status: "safe", lastSeen: "1h ago", calls: 0 },
  ];

  const quickVerify = [
    { icon: Phone, label: "Number", color: NAVY, bg: "#EBF0FA" },
    { icon: MessageSquare, label: "WhatsApp\nLink", color: "#25D366", bg: "#f0fdf4" },
    { icon: CreditCard, label: "UPI ID", color: "#7c3aed", bg: "#f5f3ff" },
    { icon: Eye, label: "QR Code", color: SAFFRON, bg: "#fff7ed" },
  ];

  const liveThreats = [
    { city: "Mumbai", type: "Fake FedEx Call", count: "2.3k", trend: "🔴", color: "#dc2626" },
    { city: "Delhi", type: "TRAI SIM Scam", count: "1.8k", trend: "🔴", color: "#dc2626" },
    { city: "Bengaluru", type: "Job Offer Fraud", count: "1.1k", trend: "🟠", color: "#ea580c" },
  ];

  return (
    <div style={{
      fontFamily: "'Inter', sans-serif",
      background: "#060b18",
      minHeight: "100vh",
      width: "390px",
      color: "#fff",
      overflowX: "hidden",
      position: "relative"
    }}>

      {/* Status bar */}
      <div style={{ background: "#060b18", padding: "12px 20px 0", display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>9:41</span>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <Wifi size={12} color="rgba(255,255,255,0.6)" />
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>5G ●●●●</span>
        </div>
      </div>

      {/* Header */}
      <div style={{ padding: "14px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 12,
            background: "linear-gradient(135deg, #FF6713, #0B3D91)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <Shield size={20} color="#fff" fill="rgba(255,255,255,0.25)" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 18, fontWeight: 900, color: "#fff", letterSpacing: -0.5 }}>
              Kavach<span style={{ color: SAFFRON }}>AI</span>
            </p>
            <p style={{ margin: 0, fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: 0.8 }}>INDIA CYBER SHIELD</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <Bell size={18} color="rgba(255,255,255,0.6)" />
            <div style={{ position: "absolute", top: -3, right: -3, width: 8, height: 8, borderRadius: "50%", background: "#ef4444", border: "2px solid #060b18" }} />
          </div>
          <User size={18} color="rgba(255,255,255,0.6)" />
        </div>
      </div>

      {/* GUARDIAN SHIELD — Hero card */}
      <div style={{ margin: "18px 20px 0", position: "relative" }}>
        <div style={{
          borderRadius: 22,
          padding: "22px",
          background: "linear-gradient(135deg, #0d1f4a 0%, #0B3D91 60%, #1a5276 100%)",
          border: "1px solid rgba(255,103,19,0.25)",
          overflow: "hidden",
          position: "relative"
        }}>
          {/* Glow rings */}
          <div style={{ position: "absolute", top: -40, right: -40, width: 150, height: 150, borderRadius: "50%", background: "rgba(255,103,19,0.08)", filter: "blur(20px)" }} />
          <div style={{ position: "absolute", bottom: -30, left: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(19,136,8,0.08)", filter: "blur(20px)" }} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 0 4px rgba(34,197,94,0.2)" }} />
                <span style={{ fontSize: 10, color: "#22c55e", fontWeight: 800, letterSpacing: 1.5 }}>GUARDIAN ACTIVE</span>
              </div>
              <p style={{ margin: 0, fontSize: 26, fontWeight: 900, color: "#fff", lineHeight: 1.1 }}>
                You are<br />
                <span style={{ color: SAFFRON }}>Protected</span>
              </p>
              <p style={{ margin: "8px 0 0", fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 1.4 }}>
                AI screening all calls & links<br />in real-time
              </p>
            </div>

            {/* Animated shield */}
            <div style={{ position: "relative", width: 80, height: 80 }}>
              <div style={{
                width: 80, height: 80, borderRadius: "50%",
                border: "2px solid rgba(255,103,19,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                position: "relative"
              }}>
                <div style={{
                  position: "absolute", inset: 6,
                  borderRadius: "50%",
                  border: "2px solid rgba(255,103,19,0.5)"
                }} />
                <Shield size={32} color={SAFFRON} fill="rgba(255,103,19,0.2)" />
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: "flex", gap: 0, marginTop: 18, borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 16 }}>
            {[
              { val: "1,247", label: "Blocked Today" },
              { val: "98.4%", label: "Accuracy" },
              { val: "48.3L", label: "Users Safe" },
            ].map((s, i) => (
              <div key={i} style={{ flex: 1, textAlign: "center", borderRight: i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 900, color: "#fff" }}>{s.val}</p>
                <p style={{ margin: "2px 0 0", fontSize: 9, color: "rgba(255,255,255,0.4)" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SOS + Helpline */}
      <div style={{ margin: "14px 20px 0", display: "flex", gap: 10 }}>
        <button style={{
          flex: "0 0 auto",
          background: "#dc2626",
          borderRadius: 14, border: "none",
          padding: "12px 20px", cursor: "pointer",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
          boxShadow: "0 6px 20px rgba(220,38,38,0.4)"
        }}>
          <Phone size={18} color="#fff" fill="rgba(255,255,255,0.2)" />
          <span style={{ fontSize: 16, fontWeight: 900, color: "#fff", lineHeight: 1 }}>1930</span>
          <span style={{ fontSize: 8, color: "rgba(255,255,255,0.8)", whiteSpace: "nowrap" }}>Helpline</span>
        </button>
        <div style={{
          flex: 1, background: "#0f172a", borderRadius: 14,
          border: "1px solid rgba(255,255,255,0.06)", padding: "12px 14px"
        }}>
          <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.4)" }}>Scam of the Moment</p>
          <p style={{ margin: "4px 0 0", fontSize: 12, fontWeight: 700, color: "#fbbf24", lineHeight: 1.3 }}>
            Fake FedEx parcel calls spiking in Mumbai & Pune
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 5 }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#ef4444" }} />
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>2,341 reports · Live</span>
          </div>
        </div>
      </div>

      {/* Verify Before You Act */}
      <div style={{ margin: "14px 20px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: "#e2e8f0" }}>Verify Before You Act</p>
          <Zap size={14} color={SAFFRON} />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {quickVerify.map((v, i) => (
            <button key={i} style={{
              flex: 1, background: "#0f172a",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 14, padding: "12px 6px", cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 6
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: 10,
                background: v.bg + "15",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <v.icon size={16} color={v.color} />
              </div>
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.6)", fontWeight: 600, textAlign: "center", whiteSpace: "pre-line", lineHeight: 1.2 }}>{v.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Family Shield */}
      <div style={{ margin: "14px 20px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <Users size={14} color={SAFFRON} />
            <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: "#e2e8f0" }}>Family Shield</p>
          </div>
          <span style={{ fontSize: 11, color: SAFFRON, fontWeight: 600 }}>+ Add</span>
        </div>
        <div style={{
          background: "#0f172a", borderRadius: 16,
          border: "1px solid rgba(255,255,255,0.05)", overflow: "hidden"
        }}>
          {familyMembers.map((m, i) => (
            <div key={i} style={{
              padding: "12px 16px", display: "flex", alignItems: "center", gap: 12,
              borderBottom: i < familyMembers.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
              background: m.status === "warning" ? "rgba(234,88,12,0.05)" : "transparent"
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: m.status === "warning" ? "rgba(234,88,12,0.15)" : "rgba(255,255,255,0.06)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, fontWeight: 800, color: m.status === "warning" ? SAFFRON : "rgba(255,255,255,0.5)",
                flexShrink: 0
              }}>
                {m.name[0]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: m.status === "warning" ? "#fff" : "#94a3b8" }}>{m.name}</span>
                  {m.status === "warning"
                    ? <span style={{ fontSize: 9, fontWeight: 800, background: "rgba(234,88,12,0.2)", color: SAFFRON, padding: "2px 7px", borderRadius: 4 }}>⚠ ALERT</span>
                    : <span style={{ fontSize: 9, color: "#22c55e", fontWeight: 600 }}>✓ Safe</span>
                  }
                </div>
                <span style={{ fontSize: 10, color: m.status === "warning" ? "rgba(255,103,19,0.7)" : "#334155" }}>
                  {m.status === "warning" ? "Receiving suspicious call now!" : `Last active ${m.lastSeen}`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Threat Feed */}
      <div style={{ margin: "14px 20px 100px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#ef4444", boxShadow: "0 0 0 3px rgba(239,68,68,0.2)" }} />
            <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: "#e2e8f0" }}>Live Threat Feed</p>
          </div>
          <span style={{ fontSize: 11, color: SAFFRON, fontWeight: 600 }}>See All →</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {liveThreats.map((t, i) => (
            <div key={i} style={{
              background: "#0f172a", borderRadius: 14, padding: "12px 14px",
              display: "flex", alignItems: "center", gap: 12,
              border: `1px solid ${t.color}18`
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: t.color + "18",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
              }}>
                <PhoneCall size={16} color={t.color} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#e2e8f0" }}>{t.type}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                  <MapPin size={9} color="#475569" />
                  <span style={{ fontSize: 10, color: "#475569" }}>{t.city}</span>
                  <span style={{ fontSize: 10, color: "#1e3a5f" }}>·</span>
                  <span style={{ fontSize: 10, color: t.color, fontWeight: 700 }}>{t.count} reports</span>
                </div>
              </div>
              <ChevronRight size={14} color="#334155" />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Nav */}
      <div style={{
        position: "fixed", bottom: 0, width: 390,
        background: "#0a0e1a", borderTop: "1px solid rgba(255,255,255,0.06)",
        display: "flex", justifyContent: "space-around", padding: "10px 0 22px"
      }}>
        {[
          { icon: Shield, label: "Home", active: true },
          { icon: Search, label: "Verify" },
          { icon: AlertTriangle, label: "Threats" },
          { icon: Users, label: "Family" },
          { icon: User, label: "Profile" },
        ].map((n, i) => (
          <div key={i} style={{ textAlign: "center", cursor: "pointer" }}>
            <n.icon size={20} color={n.active ? SAFFRON : "#334155"} />
            <p style={{ margin: "3px 0 0", fontSize: 9, color: n.active ? SAFFRON : "#334155", fontWeight: n.active ? 700 : 400 }}>{n.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
