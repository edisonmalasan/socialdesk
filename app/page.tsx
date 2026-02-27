"use client";

import { memo, useEffect, useRef, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts";

// ─── Types ───────────────────────────────────────────────────────────────────
interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  highlighted?: boolean;
  onClick?: () => void;
}

interface AccountRowProps {
  platform: string;
  handle: string;
  icon: React.ReactNode;
  online?: boolean;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const weeklyData = [
  { day: "Mon", Comments: 35, Reacts: 18 },
  { day: "Tue", Comments: 40, Reacts: 22 },
  { day: "Wed", Comments: 28, Reacts: 15 },
  { day: "Thu", Comments: 38, Reacts: 8 },
  { day: "Fri", Comments: 17, Reacts: 19 },
];

const platformData = [
  { name: "Facebook",  value: 43.89, color: "#1e3a5f" },
  { name: "Instagram", value: 18.78, color: "#4a90d9" },
  { name: "Youtube",   value: 11.6,  color: "#6aaee8" },
  { name: "Twitter",   value: 9.59,  color: "#8fc6f0" },
  { name: "Tiktok",    value: 8.93,  color: "#b3d9f7" },
  { name: "Pinterest", value: 10.8,  color: "#d0eaf9" },
];

// ─── Popup Data ───────────────────────────────────────────────────────────────
const followersData = [
  { platform: "Facebook",  value: "6,302 followers" },
  { platform: "Instagram", value: "4,500 followers" },
  { platform: "Pinterest", value: "900 followers" },
  { platform: "Twitter",   value: "150 followers" },
];

const postedData = [
  { platform: "Facebook",  value: "20" },
  { platform: "Instagram", value: "20" },
  { platform: "Pinterest", value: "20" },
  { platform: "Twitter",   value: "20" },
];

const scheduledData = [
  { platform: "Facebook",  count: 5, today: 2, week: 1, later: 2 },
  { platform: "Instagram", count: 3, today: 1, week: 1, later: 1 },
  { platform: "Pinterest", count: 0, today: 0, week: 0, later: 0 },
  { platform: "Twitter",   count: 0, today: 0, week: 0, later: 0 },
];

const engagementData = [
  { platform: "Facebook"  },
  { platform: "Instagram" },
  { platform: "Pinterest" },
  { platform: "Twitter"   },
];

// ─── Icons ────────────────────────────────────────────────────────────────────
function FacebookIcon({ size = 18 }: { size?: number }) {
  return (
    <div className="rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#1877f2", width: size * 2, height: size * 2 }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="white">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    </div>
  );
}

function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <div className="rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg,#f58529,#dd2a7b,#8134af)", width: size * 2, height: size * 2 }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="white">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    </div>
  );
}

function TiktokIcon({ size = 18 }: { size?: number }) {
  return (
    <div className="rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#010101", width: size * 2, height: size * 2 }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="white">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
      </svg>
    </div>
  );
}

function TwitterXIcon({ size = 18 }: { size?: number }) {
  return (
    <div className="rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#000", width: size * 2, height: size * 2 }}>
      <svg width={size - 2} height={size - 2} viewBox="0 0 24 24" fill="white">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    </div>
  );
}

function PinterestIcon({ size = 18 }: { size?: number }) {
  return (
    <div className="rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#e60023", width: size * 2, height: size * 2 }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="white">
        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z" />
      </svg>
    </div>
  );
}

function YoutubeIcon({ size = 18 }: { size?: number }) {
  return (
    <div className="rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#ff0000", width: size * 2, height: size * 2 }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="white">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    </div>
  );
}

function getPlatformIcon(name: string, size = 18) {
  switch (name) {
    case "Facebook":  return <FacebookIcon size={size} />;
    case "Instagram": return <InstagramIcon size={size} />;
    case "Pinterest": return <PinterestIcon size={size} />;
    case "Twitter":   return <TwitterXIcon size={size} />;
    case "Tiktok":    return <TiktokIcon size={size} />;
    case "Youtube":   return <YoutubeIcon size={size} />;
    default:          return null;
  }
}

// ─── Popup Modal ──────────────────────────────────────────────────────────────
function Modal({ title, subtitle, badge, onClose, children }: {
  title: string;
  subtitle: string;
  badge: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={onClose}
    >
      <div
        className="relative rounded-2xl w-full mx-4"
        style={{ background: "#3d5a80", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", maxWidth: "600px" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">{title}</h2>
              <p className="text-sm mt-1" style={{ color: "#a8c4e0" }}>{subtitle}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <button
                onClick={onClose}
                className="text-white hover:text-gray-300 transition-colors"
                style={{ fontSize: 22, lineHeight: 1 }}
              >
                ←
              </button>
              <span className="text-base font-bold text-white">{badge}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-8 space-y-3 max-h-96 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

function PopupRow({ children }: { children: React.ReactNode }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="flex items-center justify-between px-6 py-5 rounded-xl"
      style={{
        background: hovered ? "#f0f6ff" : "#fff",
        boxShadow: hovered ? "0 2px 12px rgba(30,58,95,0.10)" : "none",
        transform: hovered ? "translateY(-1px)" : "translateY(0)",
        transition: "all 0.18s ease",
        cursor: "pointer",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatCard({ title, value, subtitle, highlighted = false, onClick }: StatCardProps) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-1"
      style={{
        background: highlighted ? "#1e3a5f" : "#fff",
        color: highlighted ? "#fff" : "#1a202c",
        border: highlighted ? "none" : "1px solid #e8edf3",
        boxShadow: highlighted ? "0 4px 20px rgba(30,58,95,0.18)" : "0 1px 4px rgba(0,0,0,0.05)",
        cursor: onClick ? "pointer" : "default",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
      }}
      onClick={onClick}
      onMouseEnter={(e) => { if (onClick) { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = highlighted ? "0 8px 28px rgba(30,58,95,0.28)" : "0 4px 16px rgba(0,0,0,0.10)"; }}}
      onMouseLeave={(e) => { if (onClick) { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLDivElement).style.boxShadow = highlighted ? "0 4px 20px rgba(30,58,95,0.18)" : "0 1px 4px rgba(0,0,0,0.05)"; }}}
    >
      <p className="text-sm font-medium" style={{ color: highlighted ? "#a8c4e0" : "#64748b" }}>{title}</p>
      <h3 className="text-4xl font-bold tracking-tight mt-1">{value}</h3>
      {subtitle && (
        <p className="text-xs mt-1 font-bold italic" style={{ color: highlighted ? "#7ba8cc" : "#000000" }}>{subtitle}</p>
      )}
    </div>
  );
}

function AccountRow({ platform, handle, icon, online = true }: AccountRowProps) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="flex items-center justify-between px-4 py-3 rounded-xl"
      style={{
        border: "1px solid #e8edf3",
        background: hovered ? "#f0f6ff" : "#fff",
        boxShadow: hovered ? "0 2px 12px rgba(30,58,95,0.10)" : "none",
        transform: hovered ? "translateY(-1px)" : "translateY(0)",
        transition: "all 0.18s ease",
        cursor: "pointer",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <p className="text-sm font-semibold text-gray-800">{platform}</p>
          <p className="text-xs text-gray-400">{handle}</p>
        </div>
      </div>
      <span className="w-2.5 h-2.5 rounded-full" style={{ background: online ? "#22c55e" : "#cbd5e1", display: "inline-block" }} />
    </div>
  );
}

// ─── Platform Chart ───────────────────────────────────────────────────────────
const PlatformChart = memo(function PlatformChart() {
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const labelRef = useRef<SVGTextElement | null>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const wrapperRef = useRef<SVGGElement | null>(null);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") setAnimKey((k) => k + 1);
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  const total = platformData.reduce((s, d) => s + d.value, 0);
  const cx = 110, cy = 110, r = 90, ri = 62;

  const slices = (() => {
    let angle = -Math.PI / 2;
    return platformData.map((d) => {
      const sweep = (d.value / total) * 2 * Math.PI;
      const gap = 0.025;
      const a0 = angle + gap / 2;
      const a1 = angle + sweep - gap / 2;
      angle += sweep;
      const x1 = cx + r  * Math.cos(a0), y1 = cy + r  * Math.sin(a0);
      const x2 = cx + r  * Math.cos(a1), y2 = cy + r  * Math.sin(a1);
      const x3 = cx + ri * Math.cos(a1), y3 = cy + ri * Math.sin(a1);
      const x4 = cx + ri * Math.cos(a0), y4 = cy + ri * Math.sin(a0);
      const large = sweep > Math.PI ? 1 : 0;
      const path = `M${x1},${y1} A${r},${r},0,${large},1,${x2},${y2} L${x3},${y3} A${ri},${ri},0,${large},0,${x4},${y4} Z`;
      return { ...d, path };
    });
  })();

  const handleEnter = (e: React.MouseEvent, d: typeof platformData[0]) => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    if (labelRef.current) labelRef.current.textContent = d.name;
    pathRefs.current.forEach((p) => { if (p) p.style.opacity = "0.35"; });
    (e.currentTarget as SVGPathElement).style.opacity = "1";
    const tt = tooltipRef.current;
    if (tt) {
      tt.textContent = `${d.name}  ${d.value}`;
      tt.style.display = "block";
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const tt = tooltipRef.current;
    if (!tt) return;
    const rect = (e.currentTarget as SVGElement).closest(".pie-wrapper")!.getBoundingClientRect();
    tt.style.left = `${e.clientX - rect.left + 14}px`;
    tt.style.top  = `${e.clientY - rect.top  - 40}px`;
  };

  const handleLeave = () => {
    leaveTimer.current = setTimeout(() => {
      if (labelRef.current) labelRef.current.textContent = "Connected";
      const tt = tooltipRef.current;
      if (tt) tt.style.display = "none";
      pathRefs.current.forEach((p) => { if (p) p.style.opacity = "1"; });
    }, 80);
  };

  return (
    <div className="rounded-2xl p-5" style={{ background: "#fff", border: "1px solid #e8edf3", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
      <h2 className="text-base font-semibold mb-2" style={{ color: "#1a202c" }}>Platform Performance</h2>

      <style>{`
        @keyframes slice-grow {
          from { clip-path: inset(0 100% 0 0); }
          to   { clip-path: inset(0 0% 0 0); }
        }
        @keyframes donut-draw {
          from { stroke-dashoffset: 565; opacity: 0.3; }
          to   { stroke-dashoffset: 0;   opacity: 1; }
        }
        .donut-slice {
          transform-origin: 110px 110px;
          animation: donut-slice-in 0.7s cubic-bezier(0.4,0,0.2,1) both;
        }
        @keyframes donut-slice-in {
          from { opacity: 0; transform: scale(0.5); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <div className="pie-wrapper" style={{ position: "relative", display: "flex", justifyContent: "center" }}>
        <div ref={tooltipRef} style={{
          display: "none", position: "absolute", background: "#fff",
          border: "1px solid #e2e8f0", borderRadius: 10,
          boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
          fontSize: 16, fontWeight: 700, padding: "10px 20px",
          pointerEvents: "none", whiteSpace: "nowrap", zIndex: 10, color: "#1a202c",
        }} />

        <svg width="100%" height={220} viewBox="0 0 220 220" onMouseMove={handleMouseMove} onMouseLeave={handleLeave}>
          <defs>
            {/* Reveal mask: sweeps counter-clockwise from top-right */}
            <mask id={`reveal-${animKey}`}>
              <circle
                cx={cx} cy={cy} r={(r + ri) / 2}
                fill="none"
                stroke="white"
                strokeWidth={r - ri + 4}
                strokeDasharray="565"
                strokeDashoffset="-565"
                transform={`rotate(-90 ${cx} ${cy})`}
              >
                <animate
                  attributeName="stroke-dashoffset"
                  from="-565" to="0"
                  dur="0.9s"
                  calcMode="spline"
                  keySplines="0.4 0 0.2 1"
                  fill="freeze"
                />
              </circle>
            </mask>
          </defs>

          {/* Slices revealed by the mask */}
          <g key={animKey} mask={`url(#reveal-${animKey})`}>
            {slices.map((s, i) => (
              <path
                key={s.name}
                ref={(el) => { pathRefs.current[i] = el; }}
                d={s.path}
                fill={s.color}
                stroke="none"
                style={{ cursor: "pointer", opacity: 1, transition: "opacity 0.15s ease" }}
                onMouseEnter={(e) => handleEnter(e, s)}
                onMouseLeave={handleLeave}
              />
            ))}
          </g>

          <text x={cx} y={cy - 8} textAnchor="middle" fill="#1a202c" fontSize={15} fontWeight={700}>Platforms</text>
          <text ref={labelRef} x={cx} y={cy + 10} textAnchor="middle" fill="#94a3b8" fontSize={11}>Connected</text>
        </svg>
      </div>

      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-1">
        {platformData.map((entry) => (
          <div key={entry.name} className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: entry.color }} />
            <span style={{ fontSize: 11, color: "#64748b" }}>{entry.name} {entry.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
});

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Home() {
  const [openModal, setOpenModal] = useState<null | "followers" | "posted" | "scheduled" | "engagement">(null);

  return (
    <div className="space-y-6" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Popups ── */}

      {openModal === "followers" && (
        <Modal title="Total Followers" subtitle="Overview for Egarlinx2 total followers performance." badge="Total: 7,852 Followers" onClose={() => setOpenModal(null)}>
          {followersData.map((r) => (
            <PopupRow key={r.platform}>
              <div className="flex items-center gap-3">
                {getPlatformIcon(r.platform)}
                <span className="text-sm font-medium text-gray-700">{r.platform}</span>
              </div>
              <span className="text-lg font-bold text-gray-800">{r.value}</span>
            </PopupRow>
          ))}
        </Modal>
      )}

      {openModal === "posted" && (
        <Modal title="Total Posted Content" subtitle="Overview for Egarlinx2 total posted content performance." badge="Published: 120 Posts" onClose={() => setOpenModal(null)}>
          {postedData.map((r) => (
            <PopupRow key={r.platform}>
              <div className="flex items-center gap-3">
                {getPlatformIcon(r.platform)}
                <span className="text-sm font-medium text-gray-700">{r.platform}</span>
              </div>
              <span className="text-2xl font-bold text-gray-800">{r.value}</span>
            </PopupRow>
          ))}
        </Modal>
      )}

      {openModal === "scheduled" && (
        <Modal title="Total Scheduled Content" subtitle="Overview for Egarlinx2 total scheduled content performance." badge="Scheduled Post: 8" onClose={() => setOpenModal(null)}>
          {scheduledData.map((r) => (
            <PopupRow key={r.platform}>
              <div className="flex items-center gap-3">
                {getPlatformIcon(r.platform)}
                <span className="text-sm font-medium text-gray-700">{r.platform}</span>
              </div>
              <span className="text-2xl font-bold text-gray-800 mr-4">{r.count}</span>
              <div className="text-xs text-gray-400 text-right leading-5">
                <div>Today: {r.today}</div>
                <div>This Week: {r.week}</div>
                <div>Later: {r.later}</div>
              </div>
            </PopupRow>
          ))}
        </Modal>
      )}

      {openModal === "engagement" && (
        <Modal title="Total Engagement" subtitle="Overview for Egarlinx2 total engagement performance." badge="Total Interactions:" onClose={() => setOpenModal(null)}>
          {engagementData.map((r) => (
            <PopupRow key={r.platform}>
              <div className="flex items-center gap-3">
                {getPlatformIcon(r.platform)}
                <span className="text-sm font-medium text-gray-700">{r.platform}</span>
              </div>
              <div className="flex items-center gap-3" style={{ color: "#94a3b8" }}>
                {/* Like */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                {/* Comment */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                {/* Share */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </div>
            </PopupRow>
          ))}
        </Modal>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold" style={{ color: "#1a202c" }}>Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: "#64748b" }}>Welcome back! Here&apos;s your social media overview</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Followers"         value="7,852" subtitle="As of February 11, 2026" highlighted onClick={() => setOpenModal("followers")} />
        <StatCard title="Total Posted Content"    value="120"   subtitle="Published Post"          onClick={() => setOpenModal("posted")} />
        <StatCard title="Total Scheduled Content" value="8"     subtitle="Scheduled Post"          onClick={() => setOpenModal("scheduled")} />
        <StatCard title="Total Engagement"        value="3,420" subtitle="Interactions"            onClick={() => setOpenModal("engagement")} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl p-5" style={{ background: "#fff", border: "1px solid #e8edf3", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
          <h2 className="text-base font-semibold mb-1" style={{ color: "#1a202c" }}>Weekly Engagement</h2>
          <p className="text-xs mb-4" style={{ color: "#64748b" }}>
            Total Value: <span className="font-bold text-gray-800">379</span>
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyData} barGap={4} barCategoryGap="35%">
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", fontSize: 12 }} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Comments" fill="#93c5e8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Reacts"   fill="#1e3a5f" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <PlatformChart />
      </div>

      {/* Connected Accounts */}
      <div className="rounded-2xl p-6" style={{ background: "#fff", border: "1px solid #e8edf3", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
        <h2 className="text-base font-semibold mb-4" style={{ color: "#1a202c" }}>Connected Accounts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <AccountRow platform="Facebook"  handle="Egetinnz Page"      icon={<div className="w-9 h-9 rounded-full flex items-center justify-center" style={{background:"#1877f2"}}><svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></div>} />
          <AccountRow platform="Tiktok"    handle="@egetinnz"           icon={<div className="w-9 h-9 rounded-full flex items-center justify-center" style={{background:"#010101"}}><svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/></svg></div>} />
          <AccountRow platform="Instagram" handle="Egetinnz_Official"   icon={<div className="w-9 h-9 rounded-full flex items-center justify-center" style={{background:"linear-gradient(135deg,#f58529,#dd2a7b,#8134af)"}}><svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg></div>} />
          <AccountRow platform="X"         handle="@egetinnz"           icon={<div className="w-9 h-9 rounded-full flex items-center justify-center" style={{background:"#000"}}><svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></div>} />
          <AccountRow platform="YouTube"   handle="@egetinnz"           icon={<div className="w-9 h-9 rounded-full flex items-center justify-center" style={{background:"#ff0000"}}><svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></div>} />
          <AccountRow platform="Pinterest" handle="@egetinnz"           icon={<div className="w-9 h-9 rounded-full flex items-center justify-center" style={{background:"#e60023"}}><svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/></svg></div>} />
        </div>
      </div>
    </div>
  );
}