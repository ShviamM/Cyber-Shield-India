import { Shield, AlertTriangle, CheckCircle, Phone, Link, CreditCard, Eye, BookOpen, Users, Bell, ChevronRight, Zap, MapPin, Lock, MessageCircle, Info, ArrowRight, Radio, TrendingUp, Search, User, XCircle, FileText, HelpCircle } from "lucide-react";

const SAFFRON = "#FF6713";
const NAVY = "#0B3D91";
const GREEN = "#138808";
const WHITE = "#FFFFFF";

export function Prevent() {
  const todayScams = [
    {
      tag: "OTP FRAUD",
      title: "Fake TRAI Call Scam",
      desc: "Callers claim your number will be disconnected and ask for OTP to verify.",
      victims: "2,340 reports today",
      color: "#dc2626",
      bg: "#fff1f1",
      icon: Phone,
    },
    {
      tag: "UPI FRAUD",
      title: "\"Collect Request\" Trick",
      desc: "Scammers send UPI collect requests disguised as refunds. Accepting pays THEM.",
      victims: "1,890 reports today",
      color: "#ea580c",
      bg: "#fff7ed",
      icon: CreditCard,
    },
  ];

  const checkTools = [
    { icon: Phone, label: "Check Number", sublabel: "Spam / Safe?", color: NAVY, bg: "#EBF0FA" },
    { icon: Link, label: "Check Link", sublabel: "Phishing URL?", color: "#7c3aed", bg: "#f5f3ff" },
    { icon: CreditCard, label: "Check UPI ID", sublabel: "Legit account?", color: GREEN, bg: "#f0fdf4" },
    { icon: Eye, label: "Check QR Code", sublabel: "Safe to scan?", color: SAFFRON, bg: "#fff7ed" },
  ];

  const tips = [
    { icon: Lock, text: "Never share OTP, even with bank officials", severity: "critical" },
    { icon: CreditCard, text: "Accept UPI requests only — never approve collect requests", severity: "high" },
    { icon: MessageCircle, text: "TRAI / DoT never call to disconnect SIM", severity: "high" },
    { icon: Shield, text: "Register on DND to block telemarketing", severity: "medium" },
  ];

  const trendingAreas = [
    { city: "Mumbai", cases: 891, rise: "+23%" },
    { city: "Delhi", cases: 743, rise: "+18%" },
    { city: "Bengaluru", cases: 612, rise: "+31%" },
    { city: "Hyderabad", cases: 481, rise: "+14%" },
  ];

  return (
    <div style={{
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      background: "#f8f9ff",
      minHeight: "100vh",
      width: "390px",
      color: "#0f172a",
      overflow: "hidden",
      position: "relative"
    }}>

      {/* Status bar */}
      <div style={{ background: NAVY, padding: "12px 20px 0", display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>9:41</span>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.75)" }}>●●●● 5G</span>
      </div>

      {/* Header with Tricolor accent */}
      <div style={{ background: NAVY, padding: "12px 20px 20px", position: "relative", overflow: "hidden" }}>
        {/* Tricolor strip */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, display: "flex" }}>
          <div style={{ flex: 1, background: SAFFRON }} />
          <div style={{ flex: 1, background: WHITE }} />
          <div style={{ flex: 1, background: GREEN }} />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 12,
              background: "rgba(255,255,255,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Shield size={20} color={SAFFRON} fill="rgba(255,103,19,0.25)" />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 900, color: "#fff", letterSpacing: -0.4 }}>
                Netra<span style={{ color: SAFFRON }}>ksh</span>
              </p>
              <p style={{ margin: 0, fontSize: 9, color: "rgba(255,255,255,0.55)", letterSpacing: 1 }}>
                CYBER CRIME PREVENTION · INDIA
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <div style={{ position: "relative" }}>
              <Bell size={18} color="rgba(255,255,255,0.75)" />
              <div style={{
                position: "absolute", top: -3, right: -3,
                width: 8, height: 8, borderRadius: "50%",
                background: "#fbbf24", border: "2px solid " + NAVY
              }} />
            </div>
            <User size={18} color="rgba(255,255,255,0.75)" />
          </div>
        </div>

        {/* SOS Button + Stats */}
        <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
          <button style={{
            flex: "0 0 auto",
            background: "#dc2626",
            borderRadius: 14,
            border: "none",
            padding: "12px 18px",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            boxShadow: "0 4px 20px rgba(220,38,38,0.45)"
          }}>
            <Phone size={20} color="#fff" fill="rgba(255,255,255,0.3)" />
            <span style={{ fontSize: 12, fontWeight: 900, color: "#fff" }}>1930</span>
            <span style={{ fontSize: 8, color: "rgba(255,255,255,0.8)", whiteSpace: "nowrap" }}>Cyber Helpline</span>
          </button>
          <div style={{ flex: 1, background: "rgba(255,255,255,0.08)", borderRadius: 14, padding: "12px 14px" }}>
            <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.55)" }}>Protected today</p>
            <p style={{ margin: "4px 0 0", fontSize: 22, fontWeight: 900, color: "#fff" }}>48,392</p>
            <p style={{ margin: "2px 0 0", fontSize: 9, color: "rgba(255,255,255,0.45)" }}>Indians kept safe from cyber crime</p>
          </div>
        </div>
      </div>

      {/* Verify Before You Act */}
      <div style={{ margin: "16px 20px 0" }}>
        <div style={{
          background: "#fff",
          borderRadius: 18,
          padding: "16px",
          boxShadow: "0 2px 16px rgba(11,61,145,0.07)",
          border: "1px solid rgba(11,61,145,0.08)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "#EBF0FA", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Search size={14} color={NAVY} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: "#0f172a" }}>Verify Before You Act</p>
              <p style={{ margin: 0, fontSize: 10, color: "#64748b" }}>Check anything suspicious instantly</p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {checkTools.map((t, i) => (
              <button key={i} style={{
                background: t.bg,
                border: "none",
                borderRadius: 12,
                padding: "12px 10px",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                gap: 6,
                textAlign: "left"
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8, background: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: `0 2px 8px ${t.color}25`
                }}>
                  <t.icon size={16} color={t.color} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "#1e293b" }}>{t.label}</p>
                  <p style={{ margin: 0, fontSize: 9, color: "#64748b" }}>{t.sublabel}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Today's Active Scams */}
      <div style={{ margin: "16px 20px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#dc2626", boxShadow: "0 0 0 3px rgba(220,38,38,0.2)" }} />
            <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: "#0f172a" }}>Active Scams Today</p>
          </div>
          <span style={{ fontSize: 11, color: NAVY, fontWeight: 600 }}>All 23 →</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {todayScams.map((s, i) => (
            <div key={i} style={{
              background: "#fff",
              borderRadius: 16,
              padding: "14px",
              border: `1.5px solid ${s.color}20`,
              boxShadow: `0 2px 12px ${s.color}0D`
            }}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: s.bg,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                }}>
                  <s.icon size={18} color={s.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <span style={{
                      fontSize: 9, fontWeight: 800, letterSpacing: 0.8,
                      color: s.color, background: s.bg, padding: "3px 8px", borderRadius: 20
                    }}>{s.tag}</span>
                    <ChevronRight size={14} color="#94a3b8" />
                  </div>
                  <p style={{ margin: "6px 0 4px", fontSize: 13, fontWeight: 700, color: "#0f172a", lineHeight: 1.2 }}>{s.title}</p>
                  <p style={{ margin: 0, fontSize: 11, color: "#64748b", lineHeight: 1.4 }}>{s.desc}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 8 }}>
                    <AlertTriangle size={10} color={s.color} />
                    <span style={{ fontSize: 10, color: s.color, fontWeight: 600 }}>{s.victims}</span>
                  </div>
                </div>
              </div>
              {/* Prevention tip inline */}
              <div style={{
                marginTop: 10,
                background: "#f0fdf4",
                borderRadius: 10,
                padding: "8px 12px",
                display: "flex",
                alignItems: "center",
                gap: 8,
                border: "1px solid #bbf7d0"
              }}>
                <CheckCircle size={13} color={GREEN} />
                <span style={{ fontSize: 10, color: "#166534", fontWeight: 600, lineHeight: 1.3 }}>
                  {i === 0 ? "Hang up immediately. TRAI never calls." : "Paying = you sending money. Never accept collect requests."}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prevention Rules */}
      <div style={{ margin: "16px 20px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <BookOpen size={14} color={NAVY} />
          <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: "#0f172a" }}>Golden Rules of Safety</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {tips.map((t, i) => (
            <div key={i} style={{
              background: "#fff",
              borderRadius: 12,
              padding: "11px 14px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              border: "1px solid #f1f5f9"
            }}>
              <div style={{
                width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                background: t.severity === "critical" ? "#fee2e2" : t.severity === "high" ? "#fff7ed" : "#f0fdf4",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <t.icon size={14} color={t.severity === "critical" ? "#dc2626" : t.severity === "high" ? SAFFRON : GREEN} />
              </div>
              <p style={{ margin: 0, fontSize: 11, color: "#334155", fontWeight: 500, lineHeight: 1.4, flex: 1 }}>{t.text}</p>
              <div style={{
                width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
                background: t.severity === "critical" ? "#dc2626" : t.severity === "high" ? SAFFRON : GREEN
              }} />
            </div>
          ))}
        </div>
      </div>

      {/* Trending by city */}
      <div style={{ margin: "16px 20px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <MapPin size={14} color={NAVY} />
          <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: "#0f172a" }}>Hotspots This Week</p>
        </div>
        <div style={{
          background: "#fff",
          borderRadius: 16,
          overflow: "hidden",
          border: "1px solid #f1f5f9",
          boxShadow: "0 2px 10px rgba(0,0,0,0.04)"
        }}>
          {trendingAreas.map((a, i) => (
            <div key={i} style={{
              padding: "11px 16px",
              display: "flex",
              alignItems: "center",
              borderBottom: i < trendingAreas.length - 1 ? "1px solid #f8fafc" : "none"
            }}>
              <div style={{
                width: 24, height: 24, borderRadius: 6,
                background: "#EBF0FA",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginRight: 12, flexShrink: 0,
                fontSize: 11, fontWeight: 800, color: NAVY
              }}>{i + 1}</div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#1e293b" }}>{a.city}</p>
                <p style={{ margin: "1px 0 0", fontSize: 10, color: "#94a3b8" }}>{a.cases} cases reported</p>
              </div>
              <div style={{
                padding: "3px 8px", borderRadius: 20,
                background: "#fee2e2",
                fontSize: 10, fontWeight: 800, color: "#dc2626"
              }}>{a.rise}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Community CTA */}
      <div style={{ margin: "16px 20px 100px" }}>
        <div style={{
          background: `linear-gradient(135deg, ${NAVY} 0%, #1e40af 100%)`,
          borderRadius: 18,
          padding: "18px",
          display: "flex",
          alignItems: "center",
          gap: 14,
          position: "relative",
          overflow: "hidden"
        }}>
          <div style={{
            position: "absolute", right: -20, top: -20,
            width: 100, height: 100, borderRadius: "50%",
            background: "rgba(255,103,19,0.15)"
          }} />
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: "rgba(255,255,255,0.12)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
          }}>
            <Users size={22} color={SAFFRON} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: "#fff" }}>Protect Your Circle</p>
            <p style={{ margin: "3px 0 0", fontSize: 10, color: "rgba(255,255,255,0.65)", lineHeight: 1.4 }}>
              Warn family & friends. Share scam alerts directly.
            </p>
          </div>
          <ArrowRight size={18} color={SAFFRON} />
        </div>
      </div>

      {/* Bottom Nav */}
      <div style={{
        position: "fixed", bottom: 0, width: 390,
        background: "#fff",
        borderTop: "2px solid #f1f5f9",
        display: "flex", justifyContent: "space-around", padding: "10px 0 22px"
      }}>
        {[
          { icon: Shield, label: "Home", active: true },
          { icon: Search, label: "Verify" },
          { icon: AlertTriangle, label: "Threats" },
          { icon: BookOpen, label: "Learn" },
          { icon: User, label: "Profile" },
        ].map((n, i) => (
          <div key={i} style={{ textAlign: "center", cursor: "pointer" }}>
            <n.icon size={20} color={n.active ? NAVY : "#cbd5e1"} />
            <p style={{ margin: "3px 0 0", fontSize: 9, color: n.active ? NAVY : "#94a3b8", fontWeight: n.active ? 700 : 400 }}>{n.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
