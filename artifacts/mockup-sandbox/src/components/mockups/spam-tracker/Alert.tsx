import { AlertTriangle, Phone, ShieldCheck, Bell, TrendingUp, User, ChevronRight, Zap, MapPin, MessageSquare, PhoneOff, Flag, Search } from "lucide-react";

export function Alert() {
  const threats = [
    { type: "OTP Fraud", calls: 2341, change: "+18%", hot: true },
    { type: "Loan Scam", calls: 1892, change: "+34%", hot: true },
    { type: "KYC Expired", calls: 1204, change: "+5%", hot: false },
    { type: "Prize Winner", calls: 987, change: "-12%", hot: false },
  ];

  const recent = [
    { num: "+91 90000 11111", tag: "UPI FRAUD", city: "Mumbai", ago: "now", color: "#dc2626" },
    { num: "+91 80000 22222", tag: "TELEMARKETER", city: "Delhi", ago: "4m", color: "#ea580c" },
    { num: "+91 70000 33333", tag: "INSURANCE", city: "Bangalore", ago: "12m", color: "#d97706" },
    { num: "+91 98000 44444", tag: "CYBER CRIME", city: "Hyderabad", ago: "1h", color: "#dc2626" },
  ];

  return (
    <div style={{
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      background: "#fff7ed",
      minHeight: "100vh",
      width: "390px",
      color: "#1c1917",
      overflow: "hidden"
    }}>
      {/* Status bar */}
      <div style={{
        background: "linear-gradient(135deg, #ea580c 0%, #dc2626 100%)",
        padding: "12px 20px 0",
        display: "flex", justifyContent: "space-between", alignItems: "center"
      }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>9:41</span>
        <div style={{ display: "flex", gap: 4 }}>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.8)" }}>●●●● 5G</span>
        </div>
      </div>

      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #ea580c 0%, #dc2626 100%)",
        padding: "12px 20px 24px"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: "rgba(255,255,255,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <Zap size={18} color="#fff" fill="#fff" />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 18, fontWeight: 900, color: "#fff" }}>SurakshaSetu</p>
                <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.7)" }}>India's Spam Shield</p>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <Search size={18} color="rgba(255,255,255,0.8)" />
            <div style={{ position: "relative" }}>
              <Bell size={18} color="rgba(255,255,255,0.8)" />
              <div style={{
                position: "absolute", top: -3, right: -3,
                width: 8, height: 8, borderRadius: "50%",
                background: "#fbbf24"
              }} />
            </div>
          </div>
        </div>

        {/* Main alert banner */}
        <div style={{
          marginTop: 16,
          background: "rgba(0,0,0,0.2)",
          borderRadius: 16,
          padding: "16px",
          display: "flex",
          alignItems: "center",
          gap: 14
        }}>
          <div style={{
            width: 56, height: 56,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0
          }}>
            <AlertTriangle size={24} color="#fbbf24" fill="rgba(251,191,36,0.3)" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: 1 }}>Alert</p>
            <p style={{ margin: "2px 0 0", fontSize: 22, fontWeight: 900, color: "#fff", lineHeight: 1.1 }}>348 Scam Calls<br/>Blocked Today</p>
          </div>
        </div>
      </div>

      {/* Stats pills */}
      <div style={{ padding: "0 20px", marginTop: -16 }}>
        <div style={{ display: "flex", gap: 8 }}>
          {[
            { label: "Blocked", value: "348", bg: "#dc2626", fg: "#fff" },
            { label: "Reported", value: "67", bg: "#fff", fg: "#dc2626", border: "#dc2626" },
            { label: "Safe", value: "201", bg: "#fff", fg: "#16a34a", border: "#16a34a" },
          ].map((s, i) => (
            <div key={i} style={{
              flex: 1,
              background: s.bg,
              border: s.border ? `2px solid ${s.border}` : "2px solid transparent",
              borderRadius: 12,
              padding: "10px 8px",
              textAlign: "center",
              boxShadow: "0 4px 14px rgba(0,0,0,0.1)"
            }}>
              <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color: s.fg }}>{s.value}</p>
              <p style={{ margin: "2px 0 0", fontSize: 10, fontWeight: 600, color: s.fg, opacity: 0.8 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Search bar */}
      <div style={{ padding: "16px 20px 0" }}>
        <div style={{
          background: "#fff",
          borderRadius: 12,
          border: "1.5px solid #fed7aa",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          boxShadow: "0 2px 8px rgba(234,88,12,0.08)"
        }}>
          <Search size={16} color="#ea580c" />
          <span style={{ fontSize: 13, color: "#9a3412", fontWeight: 500 }}>Check any number...</span>
        </div>
      </div>

      {/* Trending threats */}
      <div style={{ padding: "16px 20px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: "#1c1917" }}>Trending Threats</p>
          <div style={{
            display: "flex", alignItems: "center", gap: 4,
            background: "#fee2e2", borderRadius: 20, padding: "3px 8px"
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#dc2626" }} />
            <span style={{ fontSize: 10, color: "#dc2626", fontWeight: 700 }}>LIVE</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {threats.map((t, i) => (
            <div key={i} style={{
              background: "#fff",
              borderRadius: 12,
              padding: "12px 14px",
              display: "flex",
              alignItems: "center",
              boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
              border: "1px solid #fef3c7"
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                background: t.hot ? "#fee2e2" : "#fef3c7",
                display: "flex", alignItems: "center", justifyContent: "center", marginRight: 12
              }}>
                {t.hot ? <Zap size={14} color="#dc2626" /> : <PhoneOff size={14} color="#d97706" />}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#1c1917" }}>{t.type}</p>
                <p style={{ margin: "2px 0 0", fontSize: 10, color: "#78716c" }}>{t.calls.toLocaleString()} reports this week</p>
              </div>
              <span style={{
                fontSize: 11, fontWeight: 800,
                color: t.change.startsWith("+") ? "#dc2626" : "#16a34a"
              }}>{t.change}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent blocked */}
      <div style={{ padding: "16px 20px 100px" }}>
        <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 800, color: "#1c1917" }}>Recently Blocked</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {recent.map((r, i) => (
            <div key={i} style={{
              background: "#fff",
              borderRadius: 12,
              padding: "10px 14px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
              border: "1px solid #f5f5f4"
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: r.color + "15",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
              }}>
                <PhoneOff size={16} color={r.color} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{r.num}</span>
                  <span style={{ fontSize: 9, fontWeight: 800, color: r.color, background: r.color + "15", padding: "2px 7px", borderRadius: 4 }}>{r.tag}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                  <MapPin size={9} color="#a8a29e" />
                  <span style={{ fontSize: 10, color: "#a8a29e" }}>{r.city}</span>
                  <span style={{ fontSize: 10, color: "#d4d0cc" }}>·</span>
                  <span style={{ fontSize: 10, color: "#a8a29e" }}>{r.ago}</span>
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
        borderTop: "2px solid #fed7aa",
        display: "flex", justifyContent: "space-around", padding: "10px 0 22px"
      }}>
        {[
          { icon: ShieldCheck, label: "Home", active: true },
          { icon: Phone, label: "Calls" },
          { icon: Flag, label: "Report" },
          { icon: TrendingUp, label: "Trends" },
          { icon: User, label: "Profile" },
        ].map((n, i) => (
          <div key={i} style={{ textAlign: "center", cursor: "pointer" }}>
            <n.icon size={20} color={n.active ? "#ea580c" : "#d6d3d1"} />
            <p style={{ margin: "3px 0 0", fontSize: 9, color: n.active ? "#ea580c" : "#a8a29e", fontWeight: n.active ? 700 : 400 }}>{n.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
