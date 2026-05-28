import { Phone, PhoneOff, Shield, AlertTriangle, X, Flag, Search, ChevronDown, Lock } from "lucide-react";

const warnings = [
  {
    hindi: "रुको! यह Scammer हो सकता है",
    english: "STOP! This could be a scammer",
    sub: "अनजान नंबर से कभी OTP मत दो",
    subEn: "Never share OTP with unknown callers",
  },
  {
    hindi: "पहले जाँचो, फिर बात करो",
    english: "Verify First, Talk Later",
    sub: "TRAI / बैंक कभी फ़ोन नहीं करते",
    subEn: "TRAI & banks never call to ask details",
  },
  {
    hindi: "सावधान! अनजान नंबर = ख़तरा",
    english: "ALERT! Unknown = Danger",
    sub: "कोई भी सरकारी काम फ़ोन पर नहीं होता",
    subEn: "No govt work is done over phone calls",
  },
];

const w = warnings[0];

export function CallAlert() {
  return (
    <div style={{
      fontFamily: "'Inter', sans-serif",
      width: "390px",
      minHeight: "100vh",
      background: "#060b18",
      position: "relative",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    }}>

      {/* Pulsing red danger glow background */}
      <div style={{
        position: "absolute", top: "30%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: 400, height: 400, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(220,38,38,0.18) 0%, rgba(6,11,24,0) 70%)",
        pointerEvents: "none"
      }} />
      <div style={{
        position: "absolute", top: "30%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: 280, height: 280, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(220,38,38,0.12) 0%, rgba(6,11,24,0) 70%)",
        pointerEvents: "none"
      }} />

      {/* Status bar */}
      <div style={{ padding: "12px 20px 0", display: "flex", justifyContent: "space-between", zIndex: 2 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>9:41</span>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>●●●● 5G</span>
      </div>

      {/* KavachAI Badge */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: 16, zIndex: 2 }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 7,
          background: "rgba(255,255,255,0.07)",
          borderRadius: 20, padding: "6px 14px",
          border: "1px solid rgba(255,255,255,0.1)"
        }}>
          <Shield size={13} color="#FF6713" fill="rgba(255,103,19,0.3)" />
          <span style={{ fontSize: 11, fontWeight: 800, color: "#fff", letterSpacing: 0.5 }}>KavachAI</span>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>is watching</span>
        </div>
      </div>

      {/* Danger badge */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: 22, zIndex: 2 }}>
        <div style={{
          background: "linear-gradient(135deg, #7f1d1d, #dc2626)",
          borderRadius: 12, padding: "8px 18px",
          display: "flex", alignItems: "center", gap: 8,
          boxShadow: "0 4px 24px rgba(220,38,38,0.4)"
        }}>
          <AlertTriangle size={15} color="#fff" fill="rgba(255,255,255,0.2)" />
          <span style={{ fontSize: 12, fontWeight: 900, color: "#fff", letterSpacing: 1 }}>UNKNOWN NUMBER — HIGH RISK</span>
        </div>
      </div>

      {/* Caller avatar + number */}
      <div style={{ textAlign: "center", marginTop: 24, zIndex: 2, padding: "0 20px" }}>
        {/* Rings */}
        <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{
            position: "absolute",
            width: 120, height: 120, borderRadius: "50%",
            border: "1.5px solid rgba(220,38,38,0.15)"
          }} />
          <div style={{
            position: "absolute",
            width: 100, height: 100, borderRadius: "50%",
            border: "1.5px solid rgba(220,38,38,0.25)"
          }} />
          <div style={{
            width: 80, height: 80, borderRadius: "50%",
            background: "linear-gradient(135deg, #1a0a0a, #3b0f0f)",
            border: "2px solid rgba(220,38,38,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            position: "relative", zIndex: 1
          }}>
            <Phone size={30} color="#ef4444" />
          </div>
        </div>

        <p style={{ margin: "18px 0 4px", fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: 1.5, textTransform: "uppercase" }}>Incoming Call</p>
        <p style={{ margin: 0, fontSize: 30, fontWeight: 900, color: "#fff", letterSpacing: 1 }}>+91 98765 XXXXX</p>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 6 }}>
          <div style={{ padding: "3px 10px", borderRadius: 20, background: "#1a0a0a", border: "1px solid rgba(220,38,38,0.3)" }}>
            <span style={{ fontSize: 10, color: "#ef4444", fontWeight: 700 }}>Not in Contacts</span>
          </div>
          <div style={{ padding: "3px 10px", borderRadius: 20, background: "#0f0f0a", border: "1px solid rgba(249,115,22,0.3)" }}>
            <span style={{ fontSize: 10, color: "#f97316", fontWeight: 700 }}>3 Community Reports</span>
          </div>
        </div>
      </div>

      {/* WARNING CARD — Bilingual */}
      <div style={{ margin: "22px 20px 0", zIndex: 2 }}>
        <div style={{
          background: "linear-gradient(135deg, #1a0505 0%, #2d0808 100%)",
          borderRadius: 20,
          padding: "20px",
          border: "1.5px solid rgba(220,38,38,0.35)",
          boxShadow: "0 8px 32px rgba(220,38,38,0.15)",
          position: "relative",
          overflow: "hidden"
        }}>
          <div style={{
            position: "absolute", top: -20, right: -20,
            width: 80, height: 80, borderRadius: "50%",
            background: "rgba(220,38,38,0.1)", filter: "blur(20px)"
          }} />

          {/* Hindi — BIG */}
          <p style={{
            margin: 0, fontSize: 20, fontWeight: 900,
            color: "#fff", lineHeight: 1.3,
            textShadow: "0 0 20px rgba(220,38,38,0.5)"
          }}>
            {w.hindi}
          </p>

          {/* English — smaller */}
          <p style={{
            margin: "6px 0 0", fontSize: 14, fontWeight: 700,
            color: "#ef4444", letterSpacing: 0.3
          }}>
            {w.english}
          </p>

          {/* Divider */}
          <div style={{ height: 1, background: "rgba(220,38,38,0.15)", margin: "14px 0" }} />

          {/* Sub-tip bilingual */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <Lock size={13} color="#f97316" style={{ marginTop: 2, flexShrink: 0 }} />
            <div>
              <p style={{ margin: 0, fontSize: 12, color: "#fbbf24", fontWeight: 600 }}>{w.sub}</p>
              <p style={{ margin: "2px 0 0", fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{w.subEn}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Safety checklist */}
      <div style={{ margin: "14px 20px 0", zIndex: 2 }}>
        <div style={{
          background: "#0a0e1a",
          borderRadius: 16, padding: "14px 16px",
          border: "1px solid rgba(255,255,255,0.05)"
        }}>
          <p style={{ margin: "0 0 10px", fontSize: 10, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: 1.2 }}>
            Remember — याद रखो
          </p>
          {[
            { hi: "OTP कभी मत दो", en: "Never share OTP" },
            { hi: "कोई असली बैंक कभी नहीं माँगता", en: "No real bank ever asks for it" },
            { hi: "Collect Request = आपका पैसा जाएगा", en: "Collect request = you LOSE money" },
          ].map((tip, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: i < 2 ? 10 : 0 }}>
              <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#0f172a", border: "1px solid rgba(239,68,68,0.3)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1 }}>
                <X size={8} color="#ef4444" />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 12, color: "#e2e8f0", fontWeight: 600 }}>{tip.hi}</p>
                <p style={{ margin: "1px 0 0", fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{tip.en}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ margin: "20px 20px 0", zIndex: 2 }}>
        {/* Answer with caution */}
        <button style={{
          width: "100%", padding: "16px", borderRadius: 16,
          background: "rgba(255,255,255,0.05)",
          border: "1.5px solid rgba(255,255,255,0.1)",
          color: "#fff", fontSize: 14, fontWeight: 800,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          cursor: "pointer", marginBottom: 10
        }}>
          <Phone size={16} color="rgba(255,255,255,0.6)" />
          <span>Answer with Caution — सावधानी से उठाएं</span>
        </button>

        {/* Decline + Block row */}
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{
            flex: 1, padding: "16px", borderRadius: 16,
            background: "linear-gradient(135deg, #dc2626, #b91c1c)",
            border: "none", color: "#fff", fontSize: 13, fontWeight: 900,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            cursor: "pointer",
            boxShadow: "0 6px 20px rgba(220,38,38,0.35)"
          }}>
            <PhoneOff size={16} color="#fff" />
            Block & Decline
          </button>
          <button style={{
            flex: 1, padding: "16px", borderRadius: 16,
            background: "#0f172a",
            border: "1px solid rgba(249,115,22,0.3)",
            color: "#f97316", fontSize: 13, fontWeight: 900,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            cursor: "pointer"
          }}>
            <Flag size={14} color="#f97316" />
            Report Scam
          </button>
        </div>
      </div>

      {/* Verify number CTA */}
      <div style={{ margin: "12px 20px 30px", zIndex: 2 }}>
        <button style={{
          width: "100%", padding: "12px", borderRadius: 12,
          background: "transparent", border: "none",
          color: "rgba(255,255,255,0.3)", fontSize: 11, fontWeight: 600,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          cursor: "pointer"
        }}>
          <Search size={12} color="rgba(255,255,255,0.3)" />
          Verify this number first — पहले नंबर जाँचें
        </button>
      </div>
    </div>
  );
}
