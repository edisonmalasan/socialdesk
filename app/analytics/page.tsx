"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { 
  FileText, 
  FileSpreadsheet, 
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ExternalLink,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Download,
  MoreHorizontal,
  CalendarDays,
  Scan,
  Star,
  ImageIcon
} from "lucide-react";

import { FaTiktok, FaPinterest } from "react-icons/fa";

import { 
  LineChart, 
  Line, 
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  ReferenceDot
} from "recharts";

export default function AnalyticsPage() {
  const [selectedPage, setSelectedPage] = useState("All Pages");
  const [selectedPlatform, setSelectedPlatform] = useState("All Platforms");
  const [activeTab, setActiveTab] = useState("All");
  const [exportOpen, setExportOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [saveModal, setSaveModal] = useState<null | "csv" | "pdf" | "chart">(null);
  const [saveModalDateRange, setSaveModalDateRange] = useState({ from: "", to: "" });
  const [confirmModal, setConfirmModal] = useState(false);
  const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({ from: null, to: null });
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [activeDateField, setActiveDateField] = useState<'from' | 'to'>('from');
  const [calViewDate, setCalViewDate] = useState(new Date(2026, 1, 1));
  const [calMode, setCalMode] = useState<'day' | 'month' | 'year'>('day');
  const exportRef = useRef<HTMLDivElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);

  // --- DATE PICKER HELPERS ---
  const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const MONTH_SHORT  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const formatCompact = (d: Date | null, mode: 'day' | 'month' | 'year') => {
    if (!d) return '';
    if (mode === 'year')  return d.getFullYear().toString();
    if (mode === 'month') return `${MONTH_SHORT[d.getMonth()]} ${d.getFullYear()}`;
    return `${MONTH_SHORT[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  };

  const calYear = calViewDate.getFullYear();
  const calMonth = calViewDate.getMonth();
  const daysInMonth   = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(calYear, calMonth, 1).getDay();
  const daysInPrevMonth = new Date(calYear, calMonth, 0).getDate();
  const decadeStart = Math.floor(calYear / 10) * 10;

  const commitRange = (clicked: Date, isFrom: boolean) => {
    if (isFrom) {
      setDateRange(r => ({ from: clicked, to: r.to && clicked > r.to ? null : r.to }));
      setActiveDateField('to');
    } else {
      if (dateRange.from && clicked < dateRange.from) {
        setDateRange(r => ({ from: clicked, to: r.from }));
      } else {
        setDateRange(r => ({ ...r, to: clicked }));
      }
      setDatePickerOpen(false);
    }
  };

  const handleDayClick = (day: number, type: 'prev' | 'cur' | 'next') => {
    let clicked: Date;
    if (type === 'prev') clicked = new Date(calYear, calMonth - 1, day);
    else if (type === 'next') clicked = new Date(calYear, calMonth + 1, day);
    else clicked = new Date(calYear, calMonth, day);
    commitRange(clicked, activeDateField === 'from');
  };

  const handleMonthClick = (mIdx: number) => {
    const clicked = activeDateField === 'from'
      ? new Date(calYear, mIdx, 1)
      : new Date(calYear, mIdx + 1, 0);
    commitRange(clicked, activeDateField === 'from');
  };

  const handleYearClick = (year: number) => {
    const clicked = activeDateField === 'from'
      ? new Date(year, 0, 1)
      : new Date(year, 11, 31);
    commitRange(clicked, activeDateField === 'from');
  };

  const isInRange = (d: Date) =>
    !!(dateRange.from && dateRange.to && d >= dateRange.from && d <= dateRange.to);
  const isSameDay = (a: Date, b: Date | null) =>
    b !== null && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const isMonthSelected = (mIdx: number) => {
    const first = new Date(calYear, mIdx, 1);
    const last  = new Date(calYear, mIdx + 1, 0);
    return !!(  (dateRange.from && isSameDay(first, dateRange.from))
             || (dateRange.to   && isSameDay(last,  dateRange.to)));
  };
  const isMonthInRange = (mIdx: number) => {
    if (!dateRange.from || !dateRange.to) return false;
    const first = new Date(calYear, mIdx, 1);
    return first > dateRange.from && first < dateRange.to;
  };
  const isYearSelected = (year: number) =>
    !!(  (dateRange.from && dateRange.from.getFullYear() === year)
       || (dateRange.to   && dateRange.to.getFullYear()   === year));
  const isYearInRange = (year: number) => {
    if (!dateRange.from || !dateRange.to) return false;
    return year > dateRange.from.getFullYear() && year < dateRange.to.getFullYear();
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setExportOpen(false);
      }
      if (datePickerRef.current && !datePickerRef.current.contains(e.target as Node)) {
        setDatePickerOpen(false);
      }
      // Close any open component dropdown when clicking outside a [data-dropdown] container
      if (!(e.target as Element).closest('[data-dropdown]')) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // BACKEND NOTE: These arrays should eventually be fetched from the database
  const pages = ["All Pages", "eGetinnz PH", "eGetinnz USA", "Fibei PH", "Fibei USA", "Digitimmerse PH", "Digitimmerse USA"];
  const platforms = ["All Platforms", "Facebook", "YouTube", "Instagram", "X", "Pinterest", "Tiktok"];
  const tabs = ["All", "Completed", "Missing"];

  // --- MOCK DATA FOR "ALL PAGES" VIEW ---
  const topPosts = [
    { id: 1, title: "FibeiTravel.com | Post-Valentine's Bohol Dive 🤿", platform: "Instagram", caption: "Celebrate the post-Valentine's vibes underwater! Explore Bohol's reefs...", date: "February 20, 2026", views: "3k", reacts: "1.5k", comments: "157", shares: "25", engagement: "12%", status: "Completed" },
    { id: 2, title: "eGetinnz.com | Celebrate CNY in Cebu 🧧", platform: "Facebook", caption: "Ring in the Year of the Snake with stunning Cebu getaways!", date: "February 15, 2026", views: "19k", reacts: "4k", comments: "290", shares: "30", engagement: "27%", status: "Completed" },
    { id: 3, title: "FibeiTravel.com | Last-Minute Romantic Vienna 🎻", platform: "Twitter", caption: "Still looking for the perfect Valentine's escape? Vienna awaits...", date: "February 12, 2026", views: "2.1k", reacts: "800", comments: "95", shares: "18", engagement: "15%", status: "Completed" },
    { id: 4, title: "eGetinnz.com | Valentine's Day Memories 💖", platform: "Tiktok", caption: "Make your Valentine's Day unforgettable with these dreamy stays...", date: "February 14, 2026", views: "5k", reacts: "2.3k", comments: "210", shares: "45", engagement: "11%", status: "Completed" },
    { id: 5, title: "FibeiTravel.com | Extend the Romance — 11-Day Luzon Tour 💗", platform: "Pinterest", caption: "Valentine's may be over, but love and adventure continue! Explore Luzon's...", date: "February 18, 2026", views: "23k", reacts: "6k", comments: "450", shares: "120", engagement: "23%", status: "Completed" },
  ];

  type PageStatsPoint = {
    month: string;
    followers: number;
    likes: number;
    views: number;
    shares: number;
    comments: number;
  };

  type PageStatsSeriesKey = "followers" | "likes" | "views" | "shares" | "comments";

  const pageStatsData: PageStatsPoint[] = [
    { month: "Jan", followers: 15000, likes: 8000, views: 12000, shares: 3000, comments: 5000 },
    { month: "Feb", followers: 20000, likes: 12000, views: 18000, shares: 5200, comments: 13000 },
    { month: "Mar", followers: 35000, likes: 21000, views: 26000, shares: 7600, comments: 11000 },
    { month: "Apr", followers: 28000, likes: 27000, views: 24000, shares: 6800, comments: 9000 },
    { month: "May", followers: 22000, likes: 16000, views: 20500, shares: 9000, comments: 7800 },
    { month: "Jun", followers: 30000, likes: 19000, views: 32000, shares: 7000, comments: 10000 },
  ];

  const pageStatsSeries: Array<{ key: PageStatsSeriesKey; color: string }> = [
    { key: "followers", color: "#4e9a6e" },
    { key: "likes", color: "#c4882a" },
    { key: "views", color: "#5278c0" },
    { key: "shares", color: "#7565b8" },
    { key: "comments", color: "#c46080" },
  ];

  const pageStatsPeaks = pageStatsSeries.map((series) => {
    const peakPoint = pageStatsData.reduce((maxPoint, point) =>
      point[series.key] > maxPoint[series.key] ? point : maxPoint,
      pageStatsData[0]
    );

    return {
      ...series,
      month: peakPoint.month,
      value: peakPoint[series.key],
    };
  });

  const engagementTrendBarData = [
    { month: "Jan", rate: 20 }, { month: "Feb", rate: 14 }, { month: "Mar", rate: 25 },
    { month: "Apr", rate: 40 }, { month: "May", rate: 27 }, { month: "Jun", rate: 30 },
    { month: "Jul", rate: 10 }, { month: "Sep", rate: 4 },  { month: "Oct", rate: 18 },
    { month: "Nov", rate: 30 }, { month: "Dec", rate: 50 },
  ];
  const barColors = ['#A3CEF1', '#D6E6F2', '#8B8C89', '#FDE68A', '#FBCFE8', '#E9D5FF', '#FECDD3', '#E5E7EB', '#A7F3D0', '#BAE6FD', '#FED7AA'];

  // BACKEND NOTE: Replace with real hourly visitor/engagement data per page/platform via API (e.g. GET /analytics/best-time?page=...&platform=...)
  // The `totalVisitors` value should be the sum across all time slots for the selected period.
  const bestTimeData = [
    { time: "12am", visitors: 500 },
    { time: "2am",  visitors: 300 },
    { time: "4am",  visitors: 800 },
    { time: "6am",  visitors: 2500 },
    { time: "8am",  visitors: 5500 },
    { time: "10am", visitors: 9000 },
    { time: "12pm", visitors: 14000 },
    { time: "2pm",  visitors: 16500 },
    { time: "4pm",  visitors: 15800 },
    { time: "6pm",  visitors: 11500 },
    { time: "8pm",  visitors: 10000 },
    { time: "10pm", visitors: 11000 },
    { time: "12am", visitors: 8000 },
  ];
  const bestTimeVisitors = "22,658"; // BACKEND NOTE: Replace with the actual total visitors count from the API

  // --- MOCK DATA FOR "SPECIFIC PAGE" VIEW ---
  // BACKEND NOTE: Fetch this table data based on the selectedPage, selectedPlatform, and activeTab filters
  const specificPagePosts = [
    { id: 1, title: "FibeiTravel.com | Post-Valentine's...", caption: "Celebrate the post-Valentine's vibes underwater! Explore Bohol's reefs...", date: "February 20, 2026", views: "3k", reacts: "1.5k", comments: "157", shares: "25", engagement: "12%", status: "Completed" },
    { id: 2, title: "FibeiTravel.com | Coron Island Adventure", caption: "Valentine's may be over, but adventure is just getting started! Explore...", date: "February 28, 2026", views: "2k", reacts: "4k", comments: "290", shares: "30", engagement: "13%", status: "Missing" },
    { id: 3, title: "FibeiTravel.com | Makati Street Food Tour", caption: "Valentine's may be over, but flavor adventures continue! Explore Makati's...", date: "February 24, 2026", views: "5k", reacts: "3k", comments: "300", shares: "15", engagement: "23%", status: "Completed" },
    { id: 4, title: "FibeiTravel.com | Extend the Romance...", caption: "Valentine's may be over, but romance isn't! Explore Bohol's scenic...", date: "February 28, 2026", views: "0k", reacts: "0k", comments: "0", shares: "0", engagement: "0%", status: "Pending" },
    { id: 5, title: "FibeiTravel.com | Extend the Romance...", caption: "Valentine's may be over, but love and adventure continue! Explore Luzon's...", date: "March 01, 2026", views: "0k", reacts: "0k", comments: "0", shares: "0", engagement: "0%", status: "Scheduled" },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed": return "bg-green-100 text-green-700";
      case "Missing": return "bg-red-100 text-red-700";
      case "Pending": return "bg-yellow-100 text-yellow-700";
      case "Scheduled": return "bg-blue-100 text-blue-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const formatPeakValue = (value: number) =>
    value >= 1000 ? `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k` : value.toString();

  const renderPeakTag = (color: string, value: number, xOffset = 0) =>
    ({ viewBox }: { viewBox?: { x?: number; y?: number } }) => {
      const x = (viewBox?.x ?? 0) + xOffset;
      const y = viewBox?.y ?? 0;
      const text = formatPeakValue(value);
      const width = text.length > 3 ? 32 : 28;

      return (
        <g>
          <rect x={x - width / 2} y={y - 20} width={width} height={14} rx={3} fill={color} />
          <text x={x} y={y - 10} textAnchor="middle" fontSize={8} fontWeight={600} fill="#ffffff">
            {text}
          </text>
        </g>
      );
    };

  const openSaveModal = (type: "csv" | "pdf" | "chart") => {
    setSaveModal(type);
    setOpenDropdown(null);
    setExportOpen(false);
  };

  return (
    <div className="flex flex-col gap-3 sm:gap-4 lg:gap-6 overflow-x-hidden overflow-y-visible w-full max-w-full min-w-0 box-border">
      
      {/* Header & Filters */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-2 sm:gap-3 pb-1">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-xs sm:text-sm lg:text-base text-gray-500 mt-0.5">Track your social media performance</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
          {/* BACKEND NOTE: Dropdowns update state. Use useEffect to refetch data on change. */}
          <div className="relative flex-1 min-w-0">
            <label htmlFor="analytics-page-select" className="sr-only">Select Page</label>
            <select 
              id="analytics-page-select"
              name="analytics-page"
              value={selectedPage}
              onChange={(e) => setSelectedPage(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-200 text-gray-700 py-1.5 sm:py-2 pl-3 pr-7 sm:pr-9 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-sm font-medium text-xs sm:text-sm"
            >
              {pages.map((page) => <option key={page} value={page}>{page}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>

          <div className="relative flex-1 min-w-0">
            <label htmlFor="analytics-platform-select" className="sr-only">Select Platform</label>
            <select 
              id="analytics-platform-select"
              name="analytics-platform"
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-200 text-gray-700 py-1.5 sm:py-2 pl-3 pr-7 sm:pr-9 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-sm font-medium text-xs sm:text-sm"
            >
              {platforms.map((platform) => <option key={platform} value={platform}>{platform}</option>)}
            </select>
            <ChevronDown size={16} className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>

          {/* Date Range Picker */}
          {/* BACKEND NOTE: Use dateRange.from / dateRange.to (and calMode for granularity) to filter all analytics API calls */}
          <div className="relative" ref={datePickerRef}>
            <button
              onClick={() => { setDatePickerOpen(p => !p); setActiveDateField('from'); }}
              className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-700 shadow-sm hover:border-gray-300 transition-colors cursor-pointer font-medium whitespace-nowrap"
              aria-label="Filter by date range"
            >
              <CalendarDays size={14} className="text-gray-500 shrink-0" />
              {dateRange.from || dateRange.to ? (
                <span className="text-gray-800">
                  {formatCompact(dateRange.from, calMode) || 'Start'}
                  <span className="text-gray-400 mx-1">→</span>
                  {formatCompact(dateRange.to, calMode) || 'End'}
                </span>
              ) : (
                <span className="text-gray-600">Date Range</span>
              )}
              {(dateRange.from || dateRange.to) && (
                <span
                  role="button" tabIndex={0}
                  onClick={(e) => { e.stopPropagation(); setDateRange({ from: null, to: null }); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); setDateRange({ from: null, to: null }); } }}
                  className="ml-0.5 text-gray-400 hover:text-gray-600 leading-none cursor-pointer text-[10px]"
                  aria-label="Clear date range"
                >✕</span>
              )}
            </button>

            {datePickerOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden">

                {/* From / To pills */}
                <div className="flex border-b border-gray-100">
                  <button onClick={() => setActiveDateField('from')}
                    className={`flex-1 flex items-center gap-2 px-4 py-2.5 text-xs transition-colors cursor-pointer ${ activeDateField === 'from' ? 'bg-gray-50 font-semibold text-gray-800' : 'text-gray-500 hover:bg-gray-50' }`}>
                    <CalendarDays size={12} className="text-gray-400 shrink-0" />
                    <div>
                      <div className="text-[9px] uppercase tracking-wide text-gray-400 leading-none mb-0.5">From</div>
                      <div className="text-gray-700">{formatCompact(dateRange.from, calMode) || <span className="text-gray-300 font-normal">not set</span>}</div>
                    </div>
                  </button>
                  <div className="w-px bg-gray-100" />
                  <button onClick={() => setActiveDateField('to')}
                    className={`flex-1 flex items-center gap-2 px-4 py-2.5 text-xs transition-colors cursor-pointer ${ activeDateField === 'to' ? 'bg-gray-50 font-semibold text-gray-800' : 'text-gray-500 hover:bg-gray-50' }`}>
                    <CalendarDays size={12} className="text-gray-400 shrink-0" />
                    <div>
                      <div className="text-[9px] uppercase tracking-wide text-gray-400 leading-none mb-0.5">To</div>
                      <div className="text-gray-700">{formatCompact(dateRange.to, calMode) || <span className="text-gray-300 font-normal">not set</span>}</div>
                    </div>
                  </button>
                </div>

                {/* Mode tabs: Day / Month / Year */}
                <div className="flex items-center gap-1 px-4 pt-3 pb-1">
                  {(['day','month','year'] as const).map(m => (
                    <button key={m} onClick={() => setCalMode(m)}
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-colors cursor-pointer capitalize ${
                        calMode === m ? 'bg-gray-800 text-white' : 'text-gray-500 hover:bg-gray-100'
                      }`}>{m}</button>
                  ))}
                </div>

                {/* ── DAY VIEW ── */}
                {calMode === 'day' && (
                  <div className="px-4 pt-2 pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-800">{MONTH_NAMES[calMonth]} {calYear}</span>
                      <div className="flex items-center gap-0.5">
                        <button onClick={() => setCalViewDate(new Date(calYear, calMonth - 1, 1))} className="p-1 rounded-md hover:bg-gray-100 text-gray-500 cursor-pointer"><ChevronLeft size={13} /></button>
                        <button onClick={() => setCalViewDate(new Date(calYear, calMonth + 1, 1))} className="p-1 rounded-md hover:bg-gray-100 text-gray-500 cursor-pointer"><ChevronRight size={13} /></button>
                      </div>
                    </div>
                    <div className="grid grid-cols-7 mb-1">
                      {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
                        <div key={d} className="text-center text-[10px] text-gray-400 font-medium">{d}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-y-0.5">
                      {Array.from({ length: firstDayOfWeek }).map((_, i) => {
                        const day = daysInPrevMonth - firstDayOfWeek + 1 + i;
                        const d = new Date(calYear, calMonth - 1, day);
                        return <button key={`p${i}`} onClick={() => handleDayClick(day, 'prev')}
                          className={`text-center text-[11px] py-1 rounded-full cursor-pointer ${ isInRange(d) ? 'bg-gray-100 text-gray-400' : 'text-gray-300 hover:text-gray-500' }`}>{day}</button>;
                      })}
                      {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const d = new Date(calYear, calMonth, day);
                        const sel = isSameDay(d, dateRange.from) || isSameDay(d, dateRange.to);
                        const inR = isInRange(d);
                        return <button key={`c${day}`} onClick={() => handleDayClick(day, 'cur')}
                          className={`text-center text-[11px] py-1 rounded-full cursor-pointer font-medium ${ sel ? 'bg-gray-800 text-white' : inR ? 'bg-gray-100 text-gray-700' : 'text-gray-700 hover:bg-gray-100' }`}>{day}</button>;
                      })}
                      {Array.from({ length: (7 - (firstDayOfWeek + daysInMonth) % 7) % 7 }).map((_, i) => {
                        const day = i + 1;
                        const d = new Date(calYear, calMonth + 1, day);
                        return <button key={`n${i}`} onClick={() => handleDayClick(day, 'next')}
                          className={`text-center text-[11px] py-1 rounded-full cursor-pointer ${ isInRange(d) ? 'bg-gray-100 text-gray-400' : 'text-gray-300 hover:text-gray-500' }`}>{day}</button>;
                      })}
                    </div>
                  </div>
                )}

                {/* ── MONTH VIEW ── */}
                {calMode === 'month' && (
                  <div className="px-4 pt-2 pb-3">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-gray-800">{calYear}</span>
                      <div className="flex items-center gap-0.5">
                        <button onClick={() => setCalViewDate(new Date(calYear - 1, calMonth, 1))} className="p-1 rounded-md hover:bg-gray-100 text-gray-500 cursor-pointer"><ChevronLeft size={13} /></button>
                        <button onClick={() => setCalViewDate(new Date(calYear + 1, calMonth, 1))} className="p-1 rounded-md hover:bg-gray-100 text-gray-500 cursor-pointer"><ChevronRight size={13} /></button>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {MONTH_SHORT.map((m, idx) => {
                        const sel = isMonthSelected(idx);
                        const inR = isMonthInRange(idx);
                        return (
                          <button key={m} onClick={() => handleMonthClick(idx)}
                            className={`py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${ sel ? 'bg-gray-800 text-white' : inR ? 'bg-gray-100 text-gray-700' : 'text-gray-700 hover:bg-gray-100' }`}>{m}</button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── YEAR VIEW ── */}
                {calMode === 'year' && (
                  <div className="px-4 pt-2 pb-3">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-gray-800">{decadeStart}–{decadeStart + 11}</span>
                      <div className="flex items-center gap-0.5">
                        <button onClick={() => setCalViewDate(new Date(calYear - 10, calMonth, 1))} className="p-1 rounded-md hover:bg-gray-100 text-gray-500 cursor-pointer"><ChevronLeft size={13} /></button>
                        <button onClick={() => setCalViewDate(new Date(calYear + 10, calMonth, 1))} className="p-1 rounded-md hover:bg-gray-100 text-gray-500 cursor-pointer"><ChevronRight size={13} /></button>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {Array.from({ length: 12 }).map((_, i) => {
                        const year = decadeStart + i;
                        const sel = isYearSelected(year);
                        const inR = isYearInRange(year);
                        return (
                          <button key={year} onClick={() => handleYearClick(year)}
                            className={`py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${ sel ? 'bg-gray-800 text-white' : inR ? 'bg-gray-100 text-gray-700' : 'text-gray-700 hover:bg-gray-100' }`}>{year}</button>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>

          {/* Export Dropdown */}
          <div className="relative" ref={exportRef}>
            <button
              id="analytics-export-btn"
              name="analytics-export"
              onClick={() => setExportOpen(!exportOpen)}
              className="cursor-pointer transition-opacity hover:opacity-70"
              title="Export"
              aria-label="Export data"
              aria-expanded={exportOpen}
              aria-haspopup="true"
            >
              <Download size={20} className="text-primary" />
            </button>
            {exportOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1.5 overflow-hidden">
                <button
                  onClick={() => openSaveModal("csv")}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <FileSpreadsheet size={16} className="text-green-500 shrink-0" /> Export as CSV
                </button>
                <button
                  onClick={() => openSaveModal("pdf")}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <FileText size={16} className="text-red-500 shrink-0" /> Export as PDF
                </button>
                <div className="border-t border-gray-100 my-1" />
                <button
                  onClick={() => openSaveModal("chart")}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="url(#jpgGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                    <defs>
                      <linearGradient id="jpgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg> Export Page Stats (JPG)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================= */}
      {/* Page Stats & Engagement Overview           */}
      {/* Always visible regardless of page filter   */}
      {/* ========================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 min-w-0 max-w-full overflow-hidden">
        <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 flex flex-col min-w-0 overflow-hidden">
          <div className="flex flex-col gap-1.5 sm:gap-3 mb-2 sm:mb-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-sm sm:text-base lg:text-lg text-gray-900">Page Stats</h3>
                <p className="text-[10px] sm:text-[11px] text-gray-500">February 11 - February 24, 2026</p>
              </div>
              {/* Component options dropdown */}
              <div className="relative shrink-0" data-dropdown>
                <button
                  onClick={() => setOpenDropdown(openDropdown === "pageStats" ? null : "pageStats")}
                  className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-1 rounded-lg hover:bg-gray-100"
                  aria-label="More options"
                >
                  <MoreHorizontal size={16} />
                </button>
                {openDropdown === "pageStats" && (
                  <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1.5 overflow-hidden">
                    <button onClick={() => openSaveModal("csv")} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
                      <FileSpreadsheet size={16} className="text-green-500 shrink-0" /> Save as CSV
                    </button>
                    <button onClick={() => openSaveModal("pdf")} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
                      <FileText size={16} className="text-red-500 shrink-0" /> Save as PDF
                    </button>
                    <button onClick={() => openSaveModal("chart")} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="url(#jpgGrad1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                        <defs><linearGradient id="jpgGrad1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#ef4444" /><stop offset="100%" stopColor="#3b82f6" /></linearGradient></defs>
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                      </svg> Save as Image (JPG)
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-3 gap-y-1 text-[10px] sm:text-xs font-medium text-gray-600">
              <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full" style={{backgroundColor:'#4e9a6e'}}></span> Follower</div>
              <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full" style={{backgroundColor:'#c4882a'}}></span> Like</div>
              <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full" style={{backgroundColor:'#5278c0'}}></span> Views</div>
              <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full" style={{backgroundColor:'#7565b8'}}></span> Shares</div>
              <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full" style={{backgroundColor:'#c46080'}}></span> Comments</div>
            </div>
          </div>
          <div className="w-full h-45 sm:h-55 lg:h-62.5 min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <LineChart data={pageStatsData} margin={{ top: 24, right: 5, left: -5, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9ca3af' }} width={35} tickFormatter={(value: number) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value.toString()} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value: number | undefined) => [value !== undefined ? value.toLocaleString() : '', '']} />
                {/* Peak highlight bars and badges generated from the current data points */}
                {pageStatsPeaks.map((peak, index) => (
                  <ReferenceLine
                    key={`peak-line-${peak.key}`}
                    x={peak.month}
                    stroke={peak.color}
                    strokeOpacity={0.14}
                    strokeWidth={22 - index * 3}
                    ifOverflow="extendDomain"
                  />
                ))}
                {pageStatsPeaks.map((peak) => {
                  const sameMonthPeaks = pageStatsPeaks.filter((item) => item.month === peak.month);
                  const monthIndex = sameMonthPeaks.findIndex((item) => item.key === peak.key);
                  const xOffset = (monthIndex - (sameMonthPeaks.length - 1) / 2) * 14;

                  return (
                    <ReferenceDot
                      key={`peak-dot-${peak.key}`}
                      x={peak.month}
                      y={peak.value}
                      r={0}
                      ifOverflow="extendDomain"
                      label={renderPeakTag(peak.color, peak.value, xOffset)}
                    />
                  );
                })}
                <Line type="monotone" dataKey="followers" stroke="#4e9a6e" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#4e9a6e' }} />
                <Line type="monotone" dataKey="likes" stroke="#c4882a" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#c4882a' }} />
                <Line type="monotone" dataKey="views" stroke="#5278c0" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#5278c0' }} />
                <Line type="monotone" dataKey="shares" stroke="#7565b8" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#7565b8' }} />
                <Line type="monotone" dataKey="comments" stroke="#c46080" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#c46080' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 min-w-0 overflow-hidden">
          <div className="flex items-center justify-between mb-2 sm:mb-4">
            <h3 className="font-bold text-sm sm:text-base lg:text-lg text-gray-900">Engagement Overview</h3>
            {/* Component options dropdown */}
            <div className="relative shrink-0" data-dropdown>
              <button
                onClick={() => setOpenDropdown(openDropdown === "engagementOverview" ? null : "engagementOverview")}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-1 rounded-lg hover:bg-gray-100"
                aria-label="More options"
              >
                <MoreHorizontal size={16} />
              </button>
              {openDropdown === "engagementOverview" && (
                <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1.5 overflow-hidden">
                  <button onClick={() => openSaveModal("csv")} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
                    <FileSpreadsheet size={16} className="text-green-500 shrink-0" /> Save as CSV
                  </button>
                  <button onClick={() => openSaveModal("pdf")} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
                    <FileText size={16} className="text-red-500 shrink-0" /> Save as PDF
                  </button>
                  <button onClick={() => openSaveModal("chart")} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="url(#jpgGrad2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                      <defs><linearGradient id="jpgGrad2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#ef4444" /><stop offset="100%" stopColor="#3b82f6" /></linearGradient></defs>
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                    </svg> Save as Image (JPG)
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 lg:gap-4">
            <div className="bg-[#9ABDD3]/40 p-1.5 sm:p-2 lg:p-5 rounded-lg sm:rounded-xl lg:rounded-2xl flex flex-col items-start justify-between min-h-25 sm:min-h-32.5 lg:min-h-40">
              <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-10 lg:h-10 bg-white rounded-md lg:rounded-lg flex items-center justify-center text-primary shadow-sm shrink-0">
                <Scan size={12} className="sm:hidden" />
                <Scan size={14} className="hidden sm:block lg:hidden" />
                <Scan size={20} className="hidden lg:block" />
              </div>
              <div className="w-full">
                <h4 className="text-sm sm:text-lg lg:text-2xl xl:text-3xl font-bold text-gray-900">24.6k</h4>
                <p className="text-[7px] sm:text-[9px] lg:text-xs text-gray-600 font-medium leading-tight mt-0.5">Engagement Rate Trend</p>
                <div className="mt-1 sm:mt-1.5 lg:mt-3 inline-flex items-center gap-0.5 bg-white/60 px-1 sm:px-1.5 py-0.5 rounded text-[6px] sm:text-[7px] lg:text-[10px] font-bold text-gray-700">
                  <ArrowUp size={6} className="text-gray-500" /> 0.8% <span className="text-gray-400 font-normal ml-0.5">Weekly</span>
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 p-1.5 sm:p-2 lg:p-5 rounded-lg sm:rounded-xl lg:rounded-2xl flex flex-col items-start justify-between min-h-25 sm:min-h-32.5 lg:min-h-40">
              <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-10 lg:h-10 bg-white rounded-md lg:rounded-lg flex items-center justify-center text-yellow-400 shadow-sm shrink-0">
                <Star size={12} className="fill-yellow-400 sm:hidden" />
                <Star size={14} className="fill-yellow-400 hidden sm:block lg:hidden" />
                <Star size={20} className="fill-yellow-400 hidden lg:block" />
              </div>
              <div className="w-full">
                <h4 className="text-sm sm:text-lg lg:text-2xl xl:text-3xl font-bold text-gray-900">16.2k</h4>
                <p className="text-[7px] sm:text-[9px] lg:text-xs text-gray-600 font-medium leading-tight mt-0.5">Account Likes</p>
                <div className="mt-1 sm:mt-1.5 lg:mt-3 inline-flex items-center gap-0.5 bg-white/60 px-1 sm:px-1.5 py-0.5 rounded text-[6px] sm:text-[7px] lg:text-[10px] font-bold text-gray-700">
                  <ArrowUp size={6} className="text-yellow-500" /> 0.3% <span className="text-gray-400 font-normal ml-0.5">Monthly</span>
                </div>
              </div>
            </div>
            <div className="bg-pink-50 p-1.5 sm:p-2 lg:p-5 rounded-lg sm:rounded-xl lg:rounded-2xl flex flex-col items-start justify-between min-h-25 sm:min-h-32.5 lg:min-h-40">
              <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-10 lg:h-10 bg-white rounded-md lg:rounded-lg flex items-center justify-center text-pink-400 shadow-sm shrink-0">
                <MessageCircle size={12} className="fill-pink-400 text-pink-400 sm:hidden" />
                <MessageCircle size={14} className="fill-pink-400 text-pink-400 hidden sm:block lg:hidden" />
                <MessageCircle size={20} className="fill-pink-400 text-pink-400 hidden lg:block" />
              </div>
              <div className="w-full">
                <h4 className="text-sm sm:text-lg lg:text-2xl xl:text-3xl font-bold text-gray-900">27.8k</h4>
                <p className="text-[7px] sm:text-[9px] lg:text-xs text-gray-600 font-medium leading-tight mt-0.5">User Comments</p>
                <div className="mt-1 sm:mt-1.5 lg:mt-3 inline-flex items-center gap-0.5 bg-white/60 px-1 sm:px-1.5 py-0.5 rounded text-[6px] sm:text-[7px] lg:text-[10px] font-bold text-gray-700">
                  <ArrowUp size={6} className="text-pink-500" /> 5.36% <span className="text-gray-400 font-normal ml-0.5">Weekly</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================= */}
      {/* VIEW 1: "ALL PAGES" SELECTED              */}
      {/* ========================================= */}
      {selectedPage === "All Pages" ? (
        <>
          {/* ========================================================================= */}
          {/* Best Time for Posting & Engagement Rate Trend                             */}
          {/* Only visible on "All Pages" view — hidden when a specific page is chosen  */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 min-w-0 max-w-full overflow-hidden">

            {/* Best Time for Posting */}
            <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 min-w-0 overflow-hidden">
              <div className="flex items-start justify-between mb-2 sm:mb-4">
                <h3 className="font-bold text-sm sm:text-base lg:text-lg text-gray-900">Best Time for Posting</h3>
                <div className="flex flex-col items-end">
                  {/* Component options dropdown */}
                  <div className="relative shrink-0" data-dropdown>
                    <button
                      onClick={() => setOpenDropdown(openDropdown === "bestTime" ? null : "bestTime")}
                      className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-1 rounded-lg hover:bg-gray-100"
                      aria-label="More options"
                    >
                      <MoreHorizontal size={16} />
                    </button>
                    {openDropdown === "bestTime" && (
                      <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1.5 overflow-hidden">
                        <button onClick={() => openSaveModal("csv")} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
                          <FileSpreadsheet size={16} className="text-green-500 shrink-0" /> Save as CSV
                        </button>
                        <button onClick={() => openSaveModal("pdf")} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
                          <FileText size={16} className="text-red-500 shrink-0" /> Save as PDF
                        </button>
                        <button onClick={() => openSaveModal("chart")} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="url(#jpgGrad3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                            <defs><linearGradient id="jpgGrad3" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#ef4444" /><stop offset="100%" stopColor="#3b82f6" /></linearGradient></defs>
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                          </svg> Save as Image (JPG)
                        </button>
                      </div>
                    )}
                  </div>
                  {/* BACKEND NOTE: Replace bestTimeVisitors with the API-returned total visitor count */}
                  <div className="text-right mt-0.5">
                    <p className="text-[9px] sm:text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Visitors</p>
                    <p className="text-2xl sm:text-3xl lg:text-4xl font-normal text-gray-900 leading-tight">{bestTimeVisitors}</p>
                  </div>
                </div>
              </div>
              <div className="w-full h-40 sm:h-50 lg:h-55 min-w-0">
                {/* BACKEND NOTE: bestTimeData drives this chart — replace with real hourly data from the API */}
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <AreaChart data={bestTimeData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="bestTimeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis
                      dataKey="time"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: '#9ca3af' }}
                      dy={8}
                      interval={3}
                    />
                    <YAxis
                      axisLine={{ stroke: '#e5e7eb', strokeWidth: 1 }}
                      tickLine={false}
                      tick={{ fontSize: 9, fill: '#9ca3af' }}
                      width={45}
                      tickFormatter={(value: number) => value >= 1000 ? `${(value / 1000).toFixed(0)},000` : value.toString()}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: number | undefined) => [value !== undefined ? value.toLocaleString() : '', 'Visitors']}
                    />
                    <Area
                      type="monotone"
                      dataKey="visitors"
                      stroke="#3b82f6"
                      strokeWidth={2.5}
                      fill="url(#bestTimeGradient)"
                      dot={false}
                      activeDot={{ r: 4, fill: '#3b82f6' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Engagement Rate Trend */}
            <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 min-w-0 overflow-hidden self-start">
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <h3 className="font-bold text-sm sm:text-base lg:text-lg text-gray-900">Engagement Rate Trend</h3>
                {/* Component options dropdown */}
                <div className="relative shrink-0" data-dropdown>
                  <button
                    onClick={() => setOpenDropdown(openDropdown === "engagementTrend" ? null : "engagementTrend")}
                    className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-1 rounded-lg hover:bg-gray-100"
                    aria-label="More options"
                  >
                    <MoreHorizontal size={16} />
                  </button>
                  {openDropdown === "engagementTrend" && (
                    <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1.5 overflow-hidden">
                      <button onClick={() => openSaveModal("csv")} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
                        <FileSpreadsheet size={16} className="text-green-500 shrink-0" /> Save as CSV
                      </button>
                      <button onClick={() => openSaveModal("pdf")} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
                        <FileText size={16} className="text-red-500 shrink-0" /> Save as PDF
                      </button>
                      <button onClick={() => openSaveModal("chart")} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="url(#jpgGrad4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                          <defs><linearGradient id="jpgGrad4" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#ef4444" /><stop offset="100%" stopColor="#3b82f6" /></linearGradient></defs>
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                        </svg> Save as Image (JPG)
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="w-full h-40 sm:h-50 lg:h-55 min-w-0">
                {/* BACKEND NOTE: Replace engagementTrendBarData with real monthly engagement rates from the API */}
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <BarChart data={engagementTrendBarData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="month" axisLine={{ stroke: '#e5e7eb', strokeWidth: 1 }} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="rate" radius={[4, 4, 0, 0]} barSize={20}>
                      {engagementTrendBarData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Top Posts this Week — full width in All Pages view */}
          <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 min-w-0 overflow-hidden">
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <h3 className="font-bold text-sm sm:text-base lg:text-lg text-gray-900">Top Posts this Week</h3>
                {/* Export dropdown for Top Posts */}
                <div className="relative shrink-0" data-dropdown>
                  <button
                    onClick={() => setOpenDropdown(openDropdown === "topPosts" ? null : "topPosts")}
                    className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-1 rounded-lg hover:bg-gray-100"
                    aria-label="Export Top Posts"
                  >
                    <Download size={16} className="text-primary" />
                  </button>
                  {openDropdown === "topPosts" && (
                    <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1.5 overflow-hidden">
                      <button onClick={() => openSaveModal("csv")} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
                        <FileSpreadsheet size={16} className="text-green-500 shrink-0" /> Save as CSV
                      </button>
                      <button onClick={() => openSaveModal("pdf")} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
                        <FileText size={16} className="text-red-500 shrink-0" /> Save as PDF
                      </button>
                      <button onClick={() => openSaveModal("chart")} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="url(#jpgGrad5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                          <defs><linearGradient id="jpgGrad5" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#ef4444" /><stop offset="100%" stopColor="#3b82f6" /></linearGradient></defs>
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                        </svg> Save as Image (JPG)
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col divide-y divide-gray-50">
                {topPosts.map((post) => (
                  <div key={post.id} className="py-3 sm:py-4 space-y-2">
                    <div className="flex items-start gap-2 sm:gap-3 min-w-0">
                      <div className="w-10 h-7 sm:w-12 sm:h-8 relative rounded-md overflow-hidden shrink-0 bg-gray-200">
                        <Image src="/greece.png" alt="Thumbnail" fill sizes="48px" className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1.5">
                          <p className="text-[11px] sm:text-xs font-bold text-gray-900 truncate flex-1 min-w-0">{post.title}</p>
                          <span className={`inline-block px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-bold tracking-wide shrink-0 ${getStatusBadge(post.status)}`}>
                            {post.status}
                          </span>
                        </div>
                        <p className="text-[9px] sm:text-[10px] text-gray-500 truncate mt-0.5">{post.caption}</p>
                        <p className="text-[9px] sm:text-[10px] text-gray-400 mt-0.5">{post.date}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-5 gap-2 text-center">
                      <div className="flex flex-col items-center gap-0.5">
                        <Eye size={12} className="text-gray-400 lg:hidden" />
                        <p className="hidden lg:block text-[9px] text-gray-400 font-medium">Views</p>
                        <p className="text-[10px] sm:text-[11px] font-bold text-gray-700">{post.views}</p>
                      </div>
                      <div className="flex flex-col items-center gap-0.5">
                        <Heart size={12} className="text-gray-400 lg:hidden" />
                        <p className="hidden lg:block text-[9px] text-gray-400 font-medium">Reacts</p>
                        <p className="text-[10px] sm:text-[11px] font-bold text-gray-700">{post.reacts}</p>
                      </div>
                      <div className="flex flex-col items-center gap-0.5">
                        <MessageCircle size={12} className="text-gray-400 lg:hidden" />
                        <p className="hidden lg:block text-[9px] text-gray-400 font-medium">Comments</p>
                        <p className="text-[10px] sm:text-[11px] font-bold text-gray-700">{post.comments}</p>
                      </div>
                      <div className="flex flex-col items-center gap-0.5">
                        <Share2 size={12} className="text-gray-400 lg:hidden" />
                        <p className="hidden lg:block text-[9px] text-gray-400 font-medium">Shares</p>
                        <p className="text-[10px] sm:text-[11px] font-bold text-gray-700">{post.shares}</p>
                      </div>
                      <div className="flex flex-col items-center gap-0.5">
                        <ArrowUp size={12} className="text-gray-400 lg:hidden" />
                        <p className="hidden lg:block text-[9px] text-gray-400 font-medium">Engagement</p>
                        <p className="text-[10px] sm:text-[11px] font-bold text-gray-700">{post.engagement}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
          </div>
        </>
      ) : (
        /* ========================================= */
        /* VIEW 2: "SPECIFIC PAGE" SELECTED          */
        /* ========================================= */
        <div className="flex flex-col gap-2 sm:gap-3 lg:gap-6 mt-1 min-w-0 overflow-hidden">
          
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-2.5 min-w-0">
            <div className="bg-white p-2 sm:p-2.5 lg:p-4 rounded-lg sm:rounded-xl border border-gray-200 shadow-sm">
              <p className="text-[8px] sm:text-[10px] lg:text-xs text-gray-500 font-medium mb-0.5">Total Posts</p>
              <h2 className="text-sm sm:text-base lg:text-xl xl:text-2xl font-bold text-gray-900">15,685</h2>
            </div>
            <div className="bg-white p-2 sm:p-2.5 lg:p-4 rounded-lg sm:rounded-xl border border-gray-200 shadow-sm">
              <p className="text-[8px] sm:text-[10px] lg:text-xs text-gray-500 font-medium mb-0.5">Total Followers</p>
              <h2 className="text-sm sm:text-base lg:text-xl xl:text-2xl font-bold text-gray-900">29,451</h2>
            </div>
            <div className="bg-white p-2 sm:p-2.5 lg:p-4 rounded-lg sm:rounded-xl border border-gray-200 shadow-sm">
              <p className="text-[8px] sm:text-[10px] lg:text-xs text-gray-500 font-medium mb-0.5">Total Likes</p>
              <h2 className="text-sm sm:text-base lg:text-xl xl:text-2xl font-bold text-gray-900">521,998</h2>
            </div>
            <div className="bg-white p-2 sm:p-2.5 lg:p-4 rounded-lg sm:rounded-xl border border-gray-200 shadow-sm">
              <p className="text-[8px] sm:text-[10px] lg:text-xs text-gray-500 font-medium mb-0.5">Total Comments</p>
              <h2 className="text-sm sm:text-base lg:text-xl xl:text-2xl font-bold text-gray-900">21,052</h2>
            </div>
            <div className="bg-white p-2 sm:p-2.5 lg:p-4 rounded-lg sm:rounded-xl border border-gray-200 shadow-sm col-span-2 lg:col-span-1">
              <p className="text-[8px] sm:text-[10px] lg:text-xs text-gray-500 font-medium mb-0.5">Total Shares</p>
              <h2 className="text-sm sm:text-base lg:text-xl xl:text-2xl font-bold text-gray-900">24,679</h2>
            </div>
          </div>

          {/* Tabbed Data Table */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-w-0 max-w-full">
            
            {/* Tabs */}
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-6 px-3 sm:px-4 lg:px-6 pt-2.5 sm:pt-3 border-b border-gray-100 overflow-x-auto hide-scrollbar">
              {tabs.map((tab) => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-2.5 sm:pb-3 text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${activeTab === tab ? "border-primary text-gray-900" : "border-transparent text-gray-400 hover:text-gray-600"}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Mobile Card View (visible below lg) */}
            <div className="block lg:hidden divide-y divide-gray-50">
              {specificPagePosts.map((post) => (
                <div key={post.id} className="p-3 sm:p-4 space-y-2 sm:space-y-3 overflow-hidden">
                  <div className="flex items-start gap-2 sm:gap-3 min-w-0">
                    <div className="w-10 h-7 sm:w-12 sm:h-8 relative rounded overflow-hidden bg-gray-200 shrink-0">
                      <Image src="/greece.png" alt="Thumbnail" fill sizes="48px" className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <p className="text-[11px] sm:text-xs font-bold text-gray-900 truncate flex-1 min-w-0">{post.title}</p>
                        <span className={`inline-block px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-bold tracking-wide shrink-0 max-w-18 truncate ${getStatusBadge(post.status)}`}>
                          {post.status}
                        </span>
                      </div>
                      <p className="text-[9px] sm:text-[10px] text-gray-500 truncate mt-0.5">{post.caption}</p>
                      <p className="text-[9px] sm:text-[10px] text-gray-400 mt-0.5">{post.date}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-x-2 gap-y-1.5 sm:grid-cols-5 sm:gap-2 text-center pl-0">
                    <div>
                      <p className="text-[8px] sm:text-[9px] text-gray-400 font-medium">Views</p>
                      <p className="text-[10px] sm:text-[11px] font-bold text-gray-700">{post.views}</p>
                    </div>
                    <div>
                      <p className="text-[8px] sm:text-[9px] text-gray-400 font-medium">Reacts</p>
                      <p className="text-[10px] sm:text-[11px] font-bold text-gray-700">{post.reacts}</p>
                    </div>
                    <div>
                      <p className="text-[8px] sm:text-[9px] text-gray-400 font-medium">Comments</p>
                      <p className="text-[10px] sm:text-[11px] font-bold text-gray-700">{post.comments}</p>
                    </div>
                    <div>
                      <p className="text-[8px] sm:text-[9px] text-gray-400 font-medium">Shares</p>
                      <p className="text-[10px] sm:text-[11px] font-bold text-gray-700">{post.shares}</p>
                    </div>
                    <div>
                      <p className="text-[8px] sm:text-[9px] text-gray-400 font-medium">Engage</p>
                      <p className="text-[10px] sm:text-[11px] font-bold text-gray-700">{post.engagement}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table (visible at lg+) */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-250">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="py-4 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Photo <ChevronDown size={12} className="inline ml-1"/></th>
                    <th className="py-4 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Post Title <ChevronDown size={12} className="inline ml-1"/></th>
                    <th className="py-4 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Caption <ChevronDown size={12} className="inline ml-1"/></th>
                    <th className="py-4 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Date <ChevronDown size={12} className="inline ml-1"/></th>
                    <th className="py-4 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center">Views <ChevronDown size={12} className="inline ml-1"/></th>
                    <th className="py-4 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center">Reacts <ChevronDown size={12} className="inline ml-1"/></th>
                    <th className="py-4 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center">Comments <ChevronDown size={12} className="inline ml-1"/></th>
                    <th className="py-4 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center">Shares <ChevronDown size={12} className="inline ml-1"/></th>
                    <th className="py-4 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center">Engagement <ChevronDown size={12} className="inline ml-1"/></th>
                    <th className="py-4 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center">Status <ChevronDown size={12} className="inline ml-1"/></th>
                    <th className="py-4 px-6"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {/* BACKEND NOTE: Map through filtered posts here */}
                  {specificPagePosts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="w-12 h-8 relative rounded overflow-hidden bg-gray-200">
                          <Image src="/greece.png" alt="Thumbnail" fill sizes="48px" className="object-cover" />
                        </div>
                      </td>
                      <td className="py-4 px-6 text-xs font-bold text-gray-900 max-w-50 truncate" title={post.title}>{post.title}</td>
                      <td className="py-4 px-6 text-xs text-gray-500 max-w-62.5 truncate" title={post.caption}>{post.caption}</td>
                      <td className="py-4 px-6 text-xs font-medium text-gray-700 whitespace-nowrap">{post.date}</td>
                      <td className="py-4 px-4 text-xs font-bold text-gray-700 text-center"><Eye size={12} className="inline mr-1 text-gray-400"/> {post.views}</td>
                      <td className="py-4 px-4 text-xs font-bold text-gray-700 text-center"><Heart size={12} className="inline mr-1 text-gray-400"/> {post.reacts}</td>
                      <td className="py-4 px-4 text-xs font-bold text-gray-700 text-center"><MessageCircle size={12} className="inline mr-1 text-gray-400"/> {post.comments}</td>
                      <td className="py-4 px-4 text-xs font-bold text-gray-700 text-center"><Share2 size={12} className="inline mr-1 text-gray-400"/> {post.shares}</td>
                      <td className="py-4 px-4 text-xs font-bold text-gray-700 text-center"><ArrowUp size={10} className="inline mr-0.5"/> {post.engagement}</td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-wide ${getStatusBadge(post.status)}`}>
                          {post.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button className="text-gray-400 hover:text-primary transition-colors p-1">
                          <ExternalLink size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination / Footer */}
            <div className="px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 border-t border-gray-100 text-[10px] sm:text-xs text-gray-500 font-medium">
              Showing <span className="font-bold text-gray-900">1-12</span> of <span className="font-bold text-gray-900">12</span> Entries
            </div>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* SAVE AS CSV / PDF MODAL                   */}
      {/* ========================================= */}
      {saveModal && saveModal !== "chart" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSaveModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 sm:p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              {saveModal === "csv" ? "Save as CSV" : "Save as PDF"}
            </h2>
            <p className="text-sm text-gray-500 mb-5">Select Data Range</p>
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="flex-1 min-w-0">
                <label className="text-xs text-gray-500 font-medium mb-1.5 block">From</label>
                <input
                  type="date"
                  value={saveModalDateRange.from}
                  onChange={(e) => setSaveModalDateRange(r => ({ ...r, from: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                />
              </div>
              <div className="flex-1 min-w-0">
                <label className="text-xs text-gray-500 font-medium mb-1.5 block">To</label>
                <input
                  type="date"
                  value={saveModalDateRange.to}
                  onChange={(e) => setSaveModalDateRange(r => ({ ...r, to: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setSaveModal(null)}
                className="px-5 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => { setSaveModal(null); setConfirmModal(true); }}
                className="px-5 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* SAVE AS CHART MODAL                       */}
      {/* ========================================= */}
      {saveModal === "chart" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSaveModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 sm:p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Save as Chart</h2>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">Preview</p>
            <div className="w-full h-40 rounded-xl border border-gray-100 bg-gray-50 flex flex-col items-center justify-center gap-2 text-gray-300 mb-5">
              <ImageIcon size={40} strokeWidth={1} />
              <span className="text-xs text-gray-400">Chart Preview</span>
            </div>
            <p className="text-sm text-gray-500 mb-3">Select Data Range</p>
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="flex-1 min-w-0">
                <label className="text-xs text-gray-500 font-medium mb-1.5 block">From</label>
                <input
                  type="date"
                  value={saveModalDateRange.from}
                  onChange={(e) => setSaveModalDateRange(r => ({ ...r, from: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                />
              </div>
              <div className="flex-1 min-w-0">
                <label className="text-xs text-gray-500 font-medium mb-1.5 block">To</label>
                <input
                  type="date"
                  value={saveModalDateRange.to}
                  onChange={(e) => setSaveModalDateRange(r => ({ ...r, to: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setSaveModal(null)}
                className="px-5 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => { setSaveModal(null); setConfirmModal(true); }}
                className="px-5 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* CONFIRMATION MODAL                        */}
      {/* ========================================= */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xs p-6 sm:p-8 text-center">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Confirmation</h2>
            <p className="text-sm text-gray-500 mb-6">Are you sure you want to download this file?</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setConfirmModal(false)}
                className="px-5 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setConfirmModal(false);
                  // BACKEND NOTE: Trigger actual file download (CSV/PDF/JPG) here
                }}
                className="px-5 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}