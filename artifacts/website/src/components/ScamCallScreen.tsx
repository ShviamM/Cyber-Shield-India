import { PhoneIncoming, AlertOctagon, Users, MapPin, ShieldOff, Flag, Phone } from "lucide-react";

/**
 * Faithful web recreation of the Netraksh mobile app's
 * "Demo: Incoming Call" scam-alert screen (app/call-alert.tsx).
 * Renders as a flat screen designed to sit inside a phone frame.
 */
export function ScamCallScreen() {
  return (
    <div
      className="w-full h-full flex flex-col px-4 pt-5 pb-4 text-white select-none"
      style={{ background: "linear-gradient(180deg, #2a0505 0%, #1a0000 55%, #100000 100%)" }}
    >
      {/* Incoming tag */}
      <div className="flex items-center justify-center gap-1.5 mb-4">
        <span className="h-1.5 w-1.5 rounded-full bg-[#dc2626] animate-pulse" />
        <span className="text-[9px] font-bold tracking-[0.18em] text-[#f87171]">
          INCOMING CALL
        </span>
      </div>

      {/* Caller */}
      <div className="flex flex-col items-center gap-1.5 mb-4">
        <div className="relative flex items-center justify-center h-[72px] w-[72px] rounded-full bg-[#dc2626]/20">
          <span className="absolute inset-0 rounded-full bg-[#dc2626]/20 animate-ping" />
          <div className="relative flex items-center justify-center h-[52px] w-[52px] rounded-full bg-[#dc2626]">
            <PhoneIncoming className="h-6 w-6" />
          </div>
        </div>
        <p className="text-lg font-bold tracking-wide">+91 87654-32100</p>
        <p className="text-[10px] text-white/50">Unknown Caller · No Contact Match</p>
      </div>

      {/* Stats */}
      <div className="flex rounded-2xl border border-[#dc2626]/25 bg-[#dc2626]/10 py-2.5 mb-3">
        <div className="flex-1 flex flex-col items-center gap-0.5">
          <AlertOctagon className="h-3.5 w-3.5 text-[#f87171]" />
          <span className="text-[13px] font-bold leading-none">2,341</span>
          <span className="text-[8px] text-white/50">Scam Reports</span>
        </div>
        <div className="w-px bg-white/10 my-1" />
        <div className="flex-1 flex flex-col items-center gap-0.5">
          <Users className="h-3.5 w-3.5 text-[#fb923c]" />
          <span className="text-[13px] font-bold leading-none">892</span>
          <span className="text-[8px] text-white/50">Victims Reported</span>
        </div>
        <div className="w-px bg-white/10 my-1" />
        <div className="flex-1 flex flex-col items-center gap-0.5">
          <MapPin className="h-3.5 w-3.5 text-[#fbbf24]" />
          <span className="text-[13px] font-bold leading-none">Mumbai</span>
          <span className="text-[8px] text-white/50">Top City</span>
        </div>
      </div>

      {/* Warning */}
      <p className="text-center text-[15px] font-extrabold text-accent leading-tight mb-3 px-1">
        STOP! This could be a scammer
      </p>

      {/* Scam type badge */}
      <div className="flex justify-center mb-auto">
        <span className="rounded-full border border-[#dc2626]/35 bg-[#dc2626]/20 px-3 py-1 text-[8px] font-bold tracking-wider text-[#f87171]">
          FAKE FEDEX / COURIER SCAM
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-3">
        <div className="flex-1 flex flex-col items-center gap-1 rounded-2xl bg-[#dc2626] py-3">
          <ShieldOff className="h-5 w-5" />
          <span className="text-[11px] font-bold">Block</span>
        </div>
        <div className="flex-1 flex flex-col items-center gap-1 rounded-2xl border border-[#f97316]/40 bg-[#f97316]/20 py-3">
          <Flag className="h-5 w-5 text-[#f97316]" />
          <span className="text-[11px] font-bold text-[#f97316]">Report</span>
        </div>
        <div className="flex-1 flex flex-col items-center gap-0.5 rounded-2xl border border-white/10 bg-white/5 py-3">
          <Phone className="h-5 w-5 text-white/50" />
          <span className="text-[11px] font-semibold text-white/50">Answer</span>
          <span className="text-[8px] font-bold text-[#dc2626]">High Risk</span>
        </div>
      </div>
    </div>
  );
}
