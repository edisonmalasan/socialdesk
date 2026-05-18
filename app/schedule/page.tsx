"use client";

import { useSearchParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import {
  Search, Filter, Edit2, Trash2,
  FileText, Check, AlertTriangle,
  Calendar as CalendarIcon, Smile, Upload, MapPin,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Platform { id: string; name: string; connected: boolean; account: string; }
interface ScheduledPost { id: string; title: string; account: string; date: string; time: string; platforms: string[]; status: "scheduled" | "draft"; }

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_ACCOUNTS = [
  "eGetinnz PH",
  "eGetinnz USA",
  "FiBei Travel PH",
  "FiBei Travel USA",
  "Digitimmerse E-card USA",
  "Digitimmerse Greeting Card USA",
  "Digitimmerse Artwork USA",
];

const TIMEZONES = [
  { label: "Philippine Standard Time (PST)", offset: "+08:00" },
  { label: "Eastern Time (ET)", offset: "-05:00" },
  { label: "Central Time (CT)", offset: "-06:00" },
  { label: "Mountain Time (MT)", offset: "-07:00" },
  { label: "Pacific Time (PT)", offset: "-08:00" },
];

const INIT_PLATFORMS: Platform[] = [
  { id: "facebook",  name: "Facebook",  connected: true,  account: "" },
  { id: "instagram", name: "Instagram", connected: true,  account: "" },
  { id: "youtube",   name: "YouTube",   connected: false, account: "" },
  { id: "tiktok",    name: "TikTok",    connected: false, account: "" },
  { id: "pinterest", name: "Pinterest", connected: false, account: "" },
  { id: "x",         name: "X",         connected: false, account: "" },
];

function transformToScheduledPost(raw: any): ScheduledPost {
  const timestamp = raw.scheduled_at ?? raw.created_at;
  const d = timestamp ? new Date(timestamp) : null;
  return {
    id: raw.id,
    title: raw.title ?? raw.body_text?.slice(0, 30) ?? 'Untitled',
    account: raw.post_targets?.[0]?.social_accounts?.display_name
      ?? raw.post_targets?.[0]?.social_accounts?.username
      ?? '—',
    date: d ? d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) : '—',
    time: d ? d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—',
    platforms: (raw.post_targets ?? []).map((t: any) => t.social_accounts?.platforms?.code).filter(Boolean),
    status: raw.status as 'scheduled' | 'draft',
  };
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function FacebookIcon({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>;
}
function InstagramIcon({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24"><defs><linearGradient id="ig-g" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stopColor="#f09433"/><stop offset="50%" stopColor="#dc2743"/><stop offset="100%" stopColor="#bc1888"/></linearGradient></defs><path fill="url(#ig-g)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>;
}
function PinterestIcon({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="#E60023"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>;
}
function YouTubeIcon({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="#FF0000"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>;
}
function TikTokIcon({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="#000000"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z"/></svg>;
}
function XIconSvg({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="#000000"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>;
}
function PlatformIcon({ id, size = 16 }: { id: string; size?: number }) {
  if (id === "facebook")  return <FacebookIcon size={size} />;
  if (id === "instagram") return <InstagramIcon size={size} />;
  if (id === "pinterest") return <PinterestIcon size={size} />;
  if (id === "youtube")   return <YouTubeIcon size={size} />;
  if (id === "tiktok")    return <TikTokIcon size={size} />;
  if (id === "x")         return <XIconSvg size={size} />;
  return null;
}

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle}
      style={{ width: 36, minWidth: 36, height: 20, padding: 0, position: "relative", display: "inline-block", flexShrink: 0, border: "none" }}
      className={`rounded-full cursor-pointer transition-colors ${on ? "bg-blue-500" : "bg-gray-300"}`}>
      <span style={{ position: "absolute", top: 2, left: on ? 18 : 2, width: 16, height: 16, background: "white", borderRadius: "50%", boxShadow: "0 1px 3px rgba(0,0,0,0.25)", transition: "left 0.18s" }} />
    </button>
  );
}

// ─── Mini Calendar (inside popup) ────────────────────────────────────────────

function MiniCalendar({ selectedDate, onSelect }: { selectedDate: Date | null; onSelect: (d: Date) => void }) {
  const [view, setView] = useState(new Date());
  const year = view.getFullYear(), month = view.getMonth();
  const monthName = view.toLocaleString("default", { month: "long", year: "numeric" });
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isSel = (d: number) => selectedDate?.getDate() === d && selectedDate?.getMonth() === month && selectedDate?.getFullYear() === year;
  const isToday = (d: number) => today.getDate() === d && today.getMonth() === month && today.getFullYear() === year;
  const isPast = (d: number) => new Date(year, month, d) < today;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <button onClick={() => setView(new Date(year, month - 1, 1))} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 18, color: "#6b7280", padding: "0 4px" }}>‹</button>
        <span className="text-xs font-semibold text-gray-700">{monthName}</span>
        <button onClick={() => setView(new Date(year, month + 1, 1))} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 18, color: "#6b7280", padding: "0 4px" }}>›</button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
          <div key={d} className="text-center text-[9px] font-medium text-gray-400">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, i) => day === null ? <div key={i} /> : (
          <button key={i} onClick={() => !isPast(day) && onSelect(new Date(year, month, day))}
            style={{ cursor: isPast(day) ? "not-allowed" : "pointer", borderRadius: 6, padding: "3px 0", fontSize: 11,
              fontWeight: isToday(day) ? "bold" : 500,
              background: isSel(day) ? "#1e3a5f" : "transparent",
              color: isPast(day) ? "#d1d5db" : isSel(day) ? "white" : isToday(day) ? "#1e3a5f" : "#374151",
              border: isToday(day) && !isSel(day) ? "1.5px solid #1e3a5f" : "none",
              opacity: isPast(day) ? 0.4 : 1 }}>
            {day}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Schedule Post Popup ──────────────────────────────────────────────────────

function SchedulePostPopup({ onClose, onDone }: { onClose: () => void; onDone: (date: string, time: string, title: string) => void }) {
  const [title, setTitle] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [hour, setHour] = useState(new Date().getHours() % 12 || 12);
  const [minute, setMinute] = useState(new Date().getMinutes());
  const [ampm, setAmpm] = useState<"AM" | "PM">(new Date().getHours() >= 12 ? "PM" : "AM");
  const [is24hr, setIs24hr] = useState(false);
  const [timezone, setTimezone] = useState(TIMEZONES[0].label);

  const displayHour = is24hr
    ? String(ampm === "PM" && hour !== 12 ? hour + 12 : ampm === "AM" && hour === 12 ? 0 : hour).padStart(2,"0")
    : String(hour).padStart(2,"0");

  const dateStr = selectedDate
    ? `${String(selectedDate.getMonth()+1).padStart(2,"0")} / ${String(selectedDate.getDate()).padStart(2,"0")} / ${selectedDate.getFullYear()} - ${displayHour}:${String(minute).padStart(2,"0")}${is24hr ? "" : " " + ampm}`
    : "Select Date and Time";

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5">
        <div className="flex items-center gap-2 mb-3">
          <CalendarIcon size={16} className="text-gray-500" />
          <span className="text-sm font-semibold text-gray-700">Select Date and Time</span>
        </div>

        {/* Date display */}
        <div className="flex items-center justify-between px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 mb-3 text-sm text-gray-600">
          <span>{dateStr}</span>
          <CalendarIcon size={14} className="text-gray-400" />
        </div>

        {/* Calendar */}
        <div className="mb-3 p-2 border border-gray-100 rounded-xl bg-gray-50">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">DATE</div>
          <MiniCalendar selectedDate={selectedDate} onSelect={setSelectedDate} />
        </div>

          <div className="mb-3 p-2 border border-gray-100 rounded-xl bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">TIME</div>
            <div className="flex items-center gap-1 bg-gray-200 rounded-full p-0.5">
              <button onClick={() => setIs24hr(false)}
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${!is24hr ? "bg-white text-primary shadow" : "text-gray-400"}`}
                style={{ border: "none", cursor: "pointer" }}>12hr</button>
              <button onClick={() => setIs24hr(true)}
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${is24hr ? "bg-white text-primary shadow" : "text-gray-400"}`}
                style={{ border: "none", cursor: "pointer" }}>24hr</button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number" value={is24hr ? displayHour : hour}
              min={is24hr ? 0 : 1} max={is24hr ? 23 : 12}
              onChange={e => {
                const val = Number(e.target.value);
                if (is24hr) {
                  const clamped = Math.min(23, Math.max(0, val));
                  setHour(clamped > 12 ? clamped - 12 : clamped === 0 ? 12 : clamped);
                  setAmpm(clamped >= 12 ? "PM" : "AM");
                } else {
                  setHour(Math.min(12, Math.max(1, val)));
                }
              }}
              className="w-12 text-center border border-gray-200 rounded-lg p-1.5 text-sm focus:outline-none focus:border-primary bg-white"
              style={{ WebkitAppearance: "none", MozAppearance: "textfield" }} />
            <span className="text-gray-400 font-bold text-lg">:</span>
            <input
              type="number" value={String(minute).padStart(2,"0")} min={0} max={59}
              onChange={e => setMinute(Math.min(59, Math.max(0, Number(e.target.value))))}
              className="w-12 text-center border border-gray-200 rounded-lg p-1.5 text-sm focus:outline-none focus:border-primary bg-white"
              style={{ WebkitAppearance: "none", MozAppearance: "textfield" }} />
            {!is24hr && (
              <select value={ampm} onChange={e => setAmpm(e.target.value as "AM" | "PM")}
                className="border border-gray-200 rounded-lg p-1.5 text-sm focus:outline-none focus:border-primary bg-white cursor-pointer">
                <option>AM</option>
                <option>PM</option>
              </select>
            )}
            <select value={timezone} onChange={e => setTimezone(e.target.value)}
              className="flex-1 border border-gray-200 rounded-lg p-1.5 text-xs focus:outline-none focus:border-primary bg-white min-w-0 cursor-pointer">
              {TIMEZONES.map(tz => <option key={tz.label} value={tz.label}>{tz.label}</option>)}
            </select>
          </div>
        </div>

        {/* Post title */}
        <div className="mb-4 flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50">
          <FileText size={14} className="text-gray-400 flex-shrink-0" />
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Post Title"
            className="flex-1 bg-transparent text-sm border-0 outline-none text-gray-700" />
        </div>

        <div className="flex gap-2">
          <button onClick={onClose}
            className="flex-1 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 cursor-pointer bg-white hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={() => { onDone(selectedDate?.toLocaleDateString("en-US") || "-", `${String(hour).padStart(2,"0")}:${String(minute).padStart(2,"0")} ${ampm}`, title || "Untitled Post"); onClose(); }}
            className="flex-1 py-2 bg-primary text-white rounded-lg text-sm font-semibold border-0 cursor-pointer hover:bg-blue-900 transition-colors">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Choose Account Modal ─────────────────────────────────────────────────────

function ChooseAccountModal({ platform, onClose, onSelect }: { platform: Platform; onClose: () => void; onSelect: (acc: string) => void }) {
  const [selected, setSelected] = useState(platform.account);
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <PlatformIcon id={platform.id} size={20} />
            <div>
              <div className="font-bold text-sm text-gray-800">{platform.name}</div>
              <div className="text-xs text-green-500">● Connected Accounts</div>
            </div>
          </div>
          <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 18, color: "#9ca3af" }}>✕</button>
        </div>
        <div className="px-4 pt-3 pb-2 space-y-1">
          {MOCK_ACCOUNTS.map(acc => (
            <button key={acc} onClick={() => setSelected(acc)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left ${selected === acc ? "bg-blue-50 text-primary font-semibold" : "bg-transparent text-gray-700 hover:bg-gray-50"}`}
              style={{ border: selected === acc ? "1.5px solid #e0ac3a" : "1.5px solid transparent", cursor: "pointer" }}>
              <span className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${selected === acc ? "border-primary bg-primary" : "border-gray-300 bg-white"}`}>
                {selected === acc && <Check size={10} className="text-white" />}
              </span>
              {acc}
            </button>
          ))}
        </div>
        <div className="px-4 pb-4">
          <button onClick={() => { onSelect(selected); onClose(); }}
            className="w-full py-2 bg-primary text-white rounded-lg text-sm font-semibold cursor-pointer hover:bg-blue-900 transition-colors"
            style={{ border: "none" }}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Post Modal ──────────────────────────────────────────────────────────

function EditPostModal({ post, platforms, onClose, onSave }: { post: ScheduledPost; platforms: Platform[]; onClose: () => void; onSave: (p: ScheduledPost) => void }) {
  const [title, setTitle] = useState(post.title);
  const [editAccount, setEditAccount] = useState(post.account);
  const [editCaption, setEditCaption] = useState("");
  const [editPlatformCaptions, setEditPlatformCaptions] = useState<Record<string, string>>({});
  const [activeEditTab, setActiveEditTab] = useState("all");
  const [postPlatforms, setPostPlatforms] = useState(post.platforms);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editDate, setEditDate] = useState(post.date);
  const [editHour, setEditHour] = useState(11);
  const [editMinute, setEditMinute] = useState(0);
  const [editAmpm, setEditAmpm] = useState<"AM" | "PM">("AM");
  const [editIs24hr, setEditIs24hr] = useState(false);
  const [editTimezone, setEditTimezone] = useState(TIMEZONES[0].label);
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 bg-primary rounded-t-2xl sticky top-0">
          <h3 className="text-white font-bold text-base">Edit Post</h3>
          <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer", color: "rgba(255,255,255,0.7)", fontSize: 20 }}>✕</button>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* LEFT: Caption */}
          <div className="space-y-3">
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Edit Post Title here..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-primary" />

            {/* Platform caption tabs */}
            {platforms.filter(p => postPlatforms.includes(p.id)).length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <button onClick={() => setActiveEditTab("all")}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${activeEditTab === "all" ? "bg-primary text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                  style={{ border: "none", cursor: "pointer" }}>All</button>
                {platforms.filter(p => postPlatforms.includes(p.id)).map(p => (
                  <button key={p.id} onClick={() => setActiveEditTab(p.id)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${activeEditTab === p.id ? "bg-primary text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                    style={{ border: "none", cursor: "pointer" }}>
                    <PlatformIcon id={p.id} size={11} />{p.name}
                  </button>
                ))}
              </div>
            )}

            <div className="border border-gray-200 rounded-xl bg-gray-50 flex flex-col">
              <textarea
                value={activeEditTab === "all" ? editCaption : (editPlatformCaptions[activeEditTab] || "")}
                onChange={e => {
                  if (activeEditTab === "all") setEditCaption(e.target.value);
                  else setEditPlatformCaptions(prev => ({ ...prev, [activeEditTab]: e.target.value }));
                }}
                rows={4}
                placeholder={activeEditTab === "all" ? "What would you like to post?" : `Write caption for ${platforms.find(p => p.id === activeEditTab)?.name}...`}
                className="w-full p-3 bg-transparent text-sm resize-none focus:outline-none" />
              <div className="flex items-center justify-between px-3 py-2 border-t border-gray-200">
                <span className="text-xs text-gray-500">Add to your post</span>
                <div className="flex items-center gap-3">
                  <button style={{ border: "none", background: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center" }} className="text-gray-400 hover:text-primary transition-colors"><Smile size={18} /></button>
                  <button onClick={() => fileRef.current?.click()} style={{ border: "none", background: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center" }} className="text-gray-400 hover:text-primary transition-colors"><Upload size={18} /></button>
                  <button style={{ border: "none", background: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center" }} className="text-gray-400 hover:text-primary transition-colors"><MapPin size={18} /></button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = ev => setImagePreview(ev.target?.result as string); r.readAsDataURL(f); }}} />
                </div>
              </div>
            </div>
            <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-100">
                <span className="text-xs text-gray-400">Uploaded Image</span>
                {imagePreview && <button onClick={() => setImagePreview(null)} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 12, color: "#9ca3af" }}>✕</button>}
              </div>
              {imagePreview
                ? <img src={imagePreview} alt="preview" className="w-full h-40 object-cover cursor-pointer" onClick={() => fileRef.current?.click()} />
                : <div className="h-40 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => fileRef.current?.click()}>
                    <div className="w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center text-2xl text-gray-300">🖼</div>
                  </div>
              }
            </div>
          </div>

          {/* RIGHT: Platforms */}
          <div className="space-y-2">
            {/* Single account dropdown */}
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Platforms</span>
              <select value={editAccount} onChange={e => setEditAccount(e.target.value)}
                className="text-xs text-primary border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:border-primary cursor-pointer"
                style={{ maxWidth: 170 }}>
                <option value="">Select Account</option>
                {MOCK_ACCOUNTS.map(acc => <option key={acc} value={acc}>{acc}</option>)}
              </select>
            </div>
            {editAccount && (
              <div className="px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-lg text-xs text-primary font-medium">
                ✓ Using <span className="font-bold">{editAccount}</span> for all platforms
              </div>
            )}
            {platforms.map(p => (
              <div key={p.id} className="flex items-center py-2 border-b border-gray-50">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <PlatformIcon id={p.id} size={18} />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-gray-700 truncate">{p.name}</div>
                    <div className="text-xs">{postPlatforms.includes(p.id) && editAccount ? <span className="text-green-500">{editAccount}</span> : <span className="text-gray-400">Disconnected</span>}</div>
                  </div>
                </div>
                <Toggle on={postPlatforms.includes(p.id)} onToggle={() => setPostPlatforms(prev => prev.includes(p.id) ? prev.filter(x => x !== p.id) : [...prev, p.id])} />
              </div>
            ))}

            {/* Date and Time */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 mt-2 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 font-medium">Change Date and Time</span>
                <div className="flex items-center gap-1 bg-gray-200 rounded-full p-0.5">
                  <button onClick={() => setEditIs24hr(false)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${!editIs24hr ? "bg-white text-primary shadow" : "text-gray-400"}`}
                    style={{ border: "none", cursor: "pointer" }}>12hr</button>
                  <button onClick={() => setEditIs24hr(true)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${editIs24hr ? "bg-white text-primary shadow" : "text-gray-400"}`}
                    style={{ border: "none", cursor: "pointer" }}>24hr</button>
                </div>
              </div>
              <input type="date" value={editDate} onChange={e => setEditDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:border-primary" />
              <div className="flex items-center gap-2 flex-wrap">
                <input type="number"
                  value={editIs24hr ? String(editAmpm === "PM" && editHour !== 12 ? editHour + 12 : editAmpm === "AM" && editHour === 12 ? 0 : editHour).padStart(2,"0") : editHour}
                  min={editIs24hr ? 0 : 1} max={editIs24hr ? 23 : 12}
                  onChange={e => {
                    const val = Number(e.target.value);
                    if (editIs24hr) {
                      const clamped = Math.min(23, Math.max(0, val));
                      setEditHour(clamped > 12 ? clamped - 12 : clamped === 0 ? 12 : clamped);
                      setEditAmpm(clamped >= 12 ? "PM" : "AM");
                    } else {
                      setEditHour(Math.min(12, Math.max(1, val)));
                    }
                  }}
                  className="w-12 text-center border border-gray-200 rounded-lg p-1.5 text-sm focus:outline-none focus:border-primary bg-white"
                  style={{ WebkitAppearance: "none", MozAppearance: "textfield" }} />
                <span className="text-gray-400 font-bold">:</span>
                <input type="number" value={String(editMinute).padStart(2,"0")} min={0} max={59}
                  onChange={e => setEditMinute(Math.min(59, Math.max(0, Number(e.target.value))))}
                  className="w-12 text-center border border-gray-200 rounded-lg p-1.5 text-sm focus:outline-none focus:border-primary bg-white"
                  style={{ WebkitAppearance: "none", MozAppearance: "textfield" }} />
                {!editIs24hr && (
                  <select value={editAmpm} onChange={e => setEditAmpm(e.target.value as "AM" | "PM")}
                    className="border border-gray-200 rounded-lg p-1.5 text-sm focus:outline-none focus:border-primary bg-white cursor-pointer">
                    <option>AM</option><option>PM</option>
                  </select>
                )}
                <select value={editTimezone} onChange={e => setEditTimezone(e.target.value)}
                  className="flex-1 border border-gray-200 rounded-lg p-1.5 text-xs focus:outline-none focus:border-primary bg-white cursor-pointer min-w-0">
                  {TIMEZONES.map(tz => <option key={tz.label} value={tz.label}>{tz.label}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 px-6 pb-5">
          <button onClick={onClose} className="px-5 py-2 bg-gray-400 text-white rounded-lg text-sm font-semibold cursor-pointer hover:bg-gray-500 transition-colors" style={{ border: "none" }}>Discard</button>
          <button onClick={() => { onSave({ ...post, title, account: editAccount, platforms: postPlatforms, date: editDate, time: `${String(editHour).padStart(2,"0")}:${String(editMinute).padStart(2,"0")} ${editAmpm}` }); onClose(); }}
            className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-semibold cursor-pointer hover:bg-blue-900 transition-colors" style={{ border: "none" }}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Modal ─────────────────────────────────────────────────────────────

function DeleteModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs p-6 text-center">
        <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 size={24} className="text-red-500" />
        </div>
        <h3 className="font-bold text-gray-800 text-lg mb-1">Delete Post</h3>
        <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete this post?<br />This action cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 cursor-pointer hover:bg-gray-50 bg-white">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold cursor-pointer hover:bg-red-600" style={{ border: "none" }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SchedulePage() {
  const [caption, setCaption] = useState("");
  const [platformCaptions, setPlatformCaptions] = useState<Record<string, string>>({});
  const [activePlatformTab, setActivePlatformTab] = useState("all");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [platforms, setPlatforms] = useState<Platform[]>(INIT_PLATFORMS);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [activeTab, setActiveTab] = useState<"scheduled" | "draft">("scheduled");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAccount, setFilterAccount] = useState("All Account");
  const [filterPlatform, setFilterPlatform] = useState("All Platform");
  const [showFilter, setShowFilter] = useState(false);
  const [editPost, setEditPost] = useState<ScheduledPost | null>(null);
  const [deletePost, setDeletePost] = useState<ScheduledPost | null>(null);
  const [showSchedulePopup, setShowSchedulePopup] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const searchParams = useSearchParams();
  const [highlightTable, setHighlightTable] = useState(false);
  const scheduledTableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchParams.get("highlight") === "scheduled-posts") {
      scheduledTableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      setHighlightTable(true);
      setTimeout(() => setHighlightTable(false), 2200);
    }
  }, [searchParams]);

  useEffect(() => {
    fetch('/api/posts')
      .then(res => res.json())
      .then(data => {
        const schedulable = (data as any[]).filter(p => p.status === 'scheduled' || p.status === 'draft');
        setPosts(schedulable.map(transformToScheduledPost));
      });
  }, []);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const simulateAI = (type: string) => {
    setAiLoading(type);
    setTimeout(() => {
      const generated =
        type === "caption" ? "🚀 Exciting news! Check out our latest products and grab exclusive deals before they're gone. Limited time offer — shop now and save big! 🛒✨" :
        type === "hashtags" ? "\n\n#SocialDesk #ContentScheduler #DigitalMarketing #SocialMedia #GrowYourBrand" :
        "We're thrilled to share something special with you today! Our team worked incredibly hard to bring you an experience you won't forget. 🌟";
      if (activePlatformTab === "all") {
        setCaption(p => type === "hashtags" ? p + generated : generated);
      } else {
        setPlatformCaptions(prev => ({ ...prev, [activePlatformTab]: type === "hashtags" ? (prev[activePlatformTab] || "") + generated : generated }));
      }
      setAiLoading(null);
    }, 1200);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader(); reader.onload = ev => setImagePreview(ev.target?.result as string); reader.readAsDataURL(file);
  };

  const filteredPosts = posts.filter(p => {
    const matchTab = p.status === activeTab;
    const matchSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.account.toLowerCase().includes(searchQuery.toLowerCase());
    const matchAccount = filterAccount === "All Account" || p.account === filterAccount;
    const matchPlatform = filterPlatform === "All Platform" || p.platforms.includes(filterPlatform.toLowerCase());
    return matchTab && matchSearch && matchAccount && matchPlatform;
  });

  

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-white text-sm font-semibold ${toast.type === "success" ? "bg-green-500" : "bg-red-500"}`}>
          {toast.type === "success" ? <Check size={16} /> : <AlertTriangle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Content Scheduler</h1>
        <p className="text-gray-400 text-sm mt-1">Create and schedule posts with AI assistance</p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* LEFT: Composer */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 flex flex-col">
          <div className="inline-flex bg-primary text-white text-xs font-bold px-4 py-1.5 rounded-full mb-3 w-fit">Content</div>

          {/* Platform Tabs — only connected platforms */}
          {platforms.filter(p => p.connected).length > 0 && (
            <div className="flex items-center gap-1.5 mb-3 flex-wrap">
              <button
                onClick={() => setActivePlatformTab("all")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${activePlatformTab === "all" ? "bg-primary text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                style={{ border: "none", cursor: "pointer" }}>
                All
              </button>
              {platforms.filter(p => p.connected).map(p => (
                <button key={p.id}
                  onClick={() => setActivePlatformTab(p.id)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${activePlatformTab === p.id ? "bg-primary text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                  style={{ border: "none", cursor: "pointer" }}>
                  <PlatformIcon id={p.id} size={11} />
                  {p.name}
                </button>
              ))}
            </div>
          )}

          {/* Textarea + Add to post — all inside one box */}
          <div className="border border-gray-200 rounded-xl bg-gray-50 flex flex-col">
            <textarea
              value={activePlatformTab === "all" ? caption : (platformCaptions[activePlatformTab] || "")}
              onChange={e => {
                if (activePlatformTab === "all") {
                  setCaption(e.target.value);
                } else {
                  setPlatformCaptions(prev => ({ ...prev, [activePlatformTab]: e.target.value }));
                }
              }}
              placeholder={activePlatformTab === "all" ? "What would you like to post?" : `Write caption for ${platforms.find(p => p.id === activePlatformTab)?.name}...`}
              className="w-full flex-1 min-h-[130px] p-3 bg-transparent text-sm resize-none focus:outline-none" />
            <div className="flex items-center justify-between px-3 py-2 border-t border-gray-200">
              <span className="text-xs text-gray-500">Add to your post</span>
              <div className="flex items-center gap-3">
                <button style={{ border: "none", background: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center" }} className="text-gray-400 hover:text-primary transition-colors">
                  <Smile size={18} />
                </button>
                <button onClick={() => fileRef.current?.click()} style={{ border: "none", background: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center" }} className="text-gray-400 hover:text-primary transition-colors">
                  <Upload size={18} />
                </button>
                <button style={{ border: "none", background: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center" }} className="text-gray-400 hover:text-primary transition-colors">
                  <MapPin size={18} />
                </button>
                <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleImageUpload} />
              </div>
            </div>
          </div>

          {/* AI Buttons */}
          <div className="flex flex-wrap gap-2 mt-3">
            {[
              { key: "caption",  label: "Generate Caption", icon: "🪄" },
              { key: "hashtags", label: "Suggest Hashtags",  icon: "#" },
              { key: "tone",     label: "Improve Tone",      icon: "✨" },
            ].map(btn => (
              <button key={btn.key} onClick={() => simulateAI(btn.key)} disabled={!!aiLoading}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-50"
                style={{ border: "none", cursor: "pointer" }}>
                {aiLoading === btn.key ? "⏳" : btn.icon} {btn.label}
              </button>
            ))}
          </div>

          {/* Image area */}
          <div className="mt-3 border border-gray-200 rounded-xl overflow-hidden bg-gray-50 flex-1 flex flex-col min-h-[200px]">
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-100">
              <span className="text-xs text-gray-400">Uploaded Image</span>
              {imagePreview && <button onClick={() => setImagePreview(null)} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 12, color: "#9ca3af" }}>✕</button>}
            </div>
            {imagePreview
              ? <img src={imagePreview} alt="preview" className="w-full h-full object-cover flex-1 cursor-pointer" style={{ minHeight: 180 }} onClick={() => fileRef.current?.click()} />
              : <div className="flex-1 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors" style={{ minHeight: 180 }} onClick={() => fileRef.current?.click()}>
                  <div className="w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center text-2xl text-gray-300">🖼</div>
                </div>
            }
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-gray-100">
            {(() => {
              // Get the active content — either All caption or per-platform captions
              const hasContent = activePlatformTab === "all"
                ? caption.trim()
                : Object.values(platformCaptions).some(c => c.trim()) || caption.trim();

              const getTitle = () => {
                if (activePlatformTab === "all") return caption.slice(0, 30);
                const first = Object.values(platformCaptions).find(c => c.trim());
                return first ? first.slice(0, 30) : caption.slice(0, 30);
              };

              const clearAll = () => {
                setCaption("");
                setPlatformCaptions({});
                setImagePreview(null);
                setActivePlatformTab("all");
              };

              return (
                <>
                  <button
                    onClick={async () => {
                      if (!hasContent) { showToast("Write content first.", "error"); return; }
                      const res = await fetch('/api/posts', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ title: getTitle() || 'Untitled', body_text: caption, status: 'draft' }),
                      });
                      if (res.ok) {
                        const newPost = await res.json();
                        setPosts(prev => [transformToScheduledPost(newPost), ...prev]);
                        clearAll(); showToast("Saved as draft.");
                      } else { showToast("Failed to save draft.", "error"); }
                    }}
                    className="flex items-center gap-1 px-2 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 bg-white hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap">
                    <FileText size={12} /> Save as Draft
                  </button>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={async () => {
                        if (!hasContent) { showToast("Write content first.", "error"); return; }
                        const res = await fetch('/api/posts', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ title: getTitle() || 'Untitled', body_text: caption, status: 'published' }),
                        });
                        if (res.ok) { clearAll(); showToast("Post published! 🚀"); }
                        else { showToast("Failed to publish post.", "error"); }
                      }}
                      className="flex items-center gap-1 px-2 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-blue-900 transition-colors cursor-pointer whitespace-nowrap" style={{ border: "none" }}>
                      Post Now
                    </button>
                    <button
                      onClick={() => { if (!hasContent) { showToast("Write content first.", "error"); return; } setShowSchedulePopup(true); }}
                      className="flex items-center gap-1 px-2 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-blue-900 transition-colors cursor-pointer whitespace-nowrap" style={{ border: "none" }}>
                      Schedule Post
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        {/* RIGHT: Platforms + Table */}
        <div className="lg:col-span-3 flex flex-col gap-5">

          {/* Platforms */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="inline-flex bg-primary text-white text-xs font-bold px-4 py-1.5 rounded-full w-fit">Platforms</div>
              <select
                value={selectedAccount}
                onChange={e => {
                  setSelectedAccount(e.target.value);
                  setPlatforms(prev => prev.map(x => x.connected ? { ...x, account: e.target.value } : x));
                }}
                className="text-xs text-primary border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:border-primary cursor-pointer font-medium"
                style={{ maxWidth: 200 }}>
                <option value="">Select Account</option>
                {MOCK_ACCOUNTS.map(acc => <option key={acc} value={acc}>{acc}</option>)}
              </select>
            </div>
            {selectedAccount && (
              <div className="mb-3 px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg text-xs text-primary font-medium">
                ✓ Using <span className="font-bold">{selectedAccount}</span> for all connected platforms
              </div>
            )}
            <div className="space-y-1">
              {platforms.map(p => (
                <div key={p.id} className="flex items-center py-2 border-b border-gray-50 last:border-0 gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div style={{ flexShrink: 0 }}><PlatformIcon id={p.id} size={18} /></div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-gray-700 truncate">{p.name}</div>
                      <div className={`text-xs ${p.connected ? "text-green-500" : "text-gray-400"}`}>
                        {p.connected ? (p.account ? p.account : "Connected") : "Disconnected"}
                      </div>
                    </div>
                  </div>
                  <Toggle on={p.connected} onToggle={() => {
                    setPlatforms(prev => prev.map(x => {
                      if (x.id !== p.id) return x;
                      const turningOn = !x.connected;
                      return { ...x, connected: turningOn, account: turningOn ? (selectedAccount || x.account) : x.account };
                    }));
                    if (!p.connected) setActivePlatformTab(p.id);
                  }} />
                </div>
              ))}
            </div>
          </div>

          {/* Scheduled Posts Table */}
          <div
            ref={scheduledTableRef}
            className="bg-white rounded-2xl border shadow-sm p-4 sm:p-5 flex-1 overflow-hidden transition-all duration-300"
            style={{
              borderColor: highlightTable ? "#ef4444" : "#f3f4f6",
              boxShadow: highlightTable
                ? "0 0 0 3px rgba(239,68,68,0.35), 0 4px 24px rgba(239,68,68,0.15)"
                : undefined,
            }}
          >
            {/* Tabs + Controls */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-1">
                {(["scheduled", "draft"] as const).map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${activeTab === tab ? "bg-primary text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                    style={{ border: "none", cursor: "pointer" }}>
                    {tab === "scheduled" ? "Scheduled Posts" : "Draft"}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search size={12} className="absolute left-2.5 top-2.5 text-gray-400" />
                  <input type="text" placeholder="Search" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    className="pl-7 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary w-28 sm:w-36" />
                </div>
                <button onClick={() => setShowFilter(!showFilter)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${showFilter ? "bg-primary text-white border-primary" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                  <Filter size={12} /> Filter
                </button>
              <div className="flex items-center gap-1 border border-gray-200 rounded-lg bg-gray-50 px-2 py-1.5">
                  <CalendarIcon size={12} className="text-gray-400 flex-shrink-0" />
                  <input type="date" className="text-xs focus:outline-none bg-transparent w-28" />
                </div>
              </div>
            </div>

            {/* Filter */}
            {showFilter && (
              <div className="flex flex-wrap items-end gap-3 mb-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block mb-1">Account</label>
                  <select value={filterAccount} onChange={e => setFilterAccount(e.target.value)}
                    className="px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none">
                    <option>All Account</option>
                    {MOCK_ACCOUNTS.map(a => <option key={a}>{a}</option>)}                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block mb-1">Platform</label>
                  <select value={filterPlatform} onChange={e => setFilterPlatform(e.target.value)}
                    className="px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none">
                    <option>All Platform</option>
                    <option value="facebook">Facebook</option>
                    <option value="instagram">Instagram</option>
                    <option value="youtube">YouTube</option>
                    <option value="tiktok">TikTok</option>
                    <option value="pinterest">Pinterest</option>
                    <option value="x">X</option>
                  </select>
                </div>
                <button onClick={() => { setFilterAccount("All Account"); setFilterPlatform("All Platform"); }}
                  className="text-xs text-red-500 hover:underline pb-1" style={{ border: "none", background: "none", cursor: "pointer" }}>Reset</button>
              </div>
            )}

            {/* Table — scrollable on mobile */}
            <div className="overflow-x-auto w-full">
              <table className="w-full min-w-[480px]">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Post", "Account", "Date", "Time", "Platform", ""].map((h, i) => (
                      <th key={i} className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wide pb-2 pr-2 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredPosts.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-10 text-gray-400 text-xs">No posts found.</td></tr>
                  ) : filteredPosts.map(post => (
                    <tr key={post.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                      <td className="py-3 pr-2 text-xs font-semibold text-gray-700 whitespace-nowrap">{post.title}</td>
                      <td className="py-3 pr-2 text-xs text-primary font-semibold whitespace-nowrap">{post.account}</td>
                      <td className="py-3 pr-2 text-xs text-gray-500 whitespace-nowrap">{post.date}</td>
                      <td className="py-3 pr-2 text-xs text-gray-500 whitespace-nowrap">{post.time}</td>
                      <td className="py-3 pr-2">
                        <div className="flex items-center gap-1">
                          {post.platforms.map(pid => (
                            <span key={pid} className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                              <PlatformIcon id={pid} size={12} />
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setEditPost(post)} className="p-1 rounded-md bg-blue-50 text-primary hover:bg-blue-100" style={{ border: "none", cursor: "pointer" }}><Edit2 size={12} /></button>
                          <button onClick={() => setDeletePost(post)} className="p-1 rounded-md bg-red-50 text-red-500 hover:bg-red-100" style={{ border: "none", cursor: "pointer" }}><Trash2 size={12} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showSchedulePopup && (
        <SchedulePostPopup onClose={() => setShowSchedulePopup(false)}
          onDone={async (date, time, title) => {
            const dateObj = new Date(`${date} ${time}`);
            const scheduled_at = isNaN(dateObj.getTime()) ? undefined : dateObj.toISOString();
            const res = await fetch('/api/posts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ title, body_text: caption, status: 'scheduled', scheduled_at }),
            });
            if (res.ok) {
              const newPost = await res.json();
              setPosts(prev => [transformToScheduledPost(newPost), ...prev]);
              setCaption(''); setImagePreview(null); showToast("Post scheduled! 🎉");
            } else { showToast("Failed to schedule post.", "error"); }
          }} />
      )}

      {editPost && (
        <EditPostModal post={editPost} platforms={platforms} onClose={() => setEditPost(null)}
          onSave={async updated => {
            const res = await fetch(`/api/posts/${updated.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ title: updated.title }),
            });
            if (res.ok) { setPosts(prev => prev.map(p => p.id === updated.id ? updated : p)); showToast("Post updated!"); }
            else { showToast("Failed to update post.", "error"); }
          }} />
      )}

      {deletePost && (
        <DeleteModal onClose={() => setDeletePost(null)}
          onConfirm={async () => {
            const res = await fetch(`/api/posts/${deletePost.id}`, { method: 'DELETE' });
            if (res.ok) { setPosts(prev => prev.filter(p => p.id !== deletePost.id)); showToast("Post deleted."); }
            else { showToast("Failed to delete post.", "error"); }
            setDeletePost(null);
          }} />
      )}

    </div>
  );
}
