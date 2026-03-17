"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  Facebook,
  Instagram,
  Youtube,
  Trash2,
  Plus,
  AlertCircle,
} from "lucide-react";

/* ------------------------- Types ------------------------- */
type Account = {
  id: string;
  name: string;
  username?: string;
  connectedDate?: string;
  isConnected: boolean;
  color: string; // e.g. "text-blue-600 bg-blue-50"
  icon: React.ReactNode;
};

/* ---------------------- Component ------------------------ */
export default function AccountsPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const role = Cookies.get("user-role");
    if (role !== "admin") {
      router.push("/dashboard");
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  // Mock data (some connected, some available)
  const [accounts, setAccounts] = useState<Account[]>([
    {
      id: "facebook",
      name: "Facebook",
      username: "@john_doe123",
      connectedDate: "February 14, 2026",
      isConnected: true,
      color: "text-blue-600 bg-blue-50",
      icon: <Facebook size={20} />,
    },
    {
      id: "instagram",
      name: "Instagram",
      username: "@instagram_user_143",
      connectedDate: "February 16, 2026",
      isConnected: true,
      color: "text-pink-600 bg-pink-50",
      icon: <Instagram size={20} />,
    },
    {
      id: "x",
      name: "X",
      username: "@twitter_user_0121",
      connectedDate: "February 16, 2026",
      isConnected: true,
      color: "text-gray-700 bg-gray-100",
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      id: "tiktok",
      name: "TikTok",
      username: undefined,
      connectedDate: undefined,
      isConnected: false,
      color: "text-black bg-gray-100",
      icon: <TikTokIcon />,
    },
    {
      id: "pinterest",
      name: "Pinterest",
      username: undefined,
      connectedDate: undefined,
      isConnected: false,
      color: "text-red-600 bg-red-50",
      icon: <PinterestIcon />,
    },
    {
      id: "youtube",
      name: "YouTube",
      username: undefined,
      connectedDate: undefined,
      isConnected: false,
      color: "text-red-600 bg-red-50",
      icon: <Youtube size={20} />,
    },
  ]);

  const connectedAccounts = accounts.filter((a) => a.isConnected);
  const availableAccounts = accounts.filter((a) => !a.isConnected);

  // Modal state:
  // - connectPlatformId: "selector" -> shows platform selector (optional)
  // - otherwise platform id -> shows the login modal for that platform
  const [connectPlatformId, setConnectPlatformId] = useState<string | null>(null);
  const [connectEmail, setConnectEmail] = useState("");
  const [disconnectTarget, setDisconnectTarget] = useState<Account | null>(null);
  const [disconnectConfirmChecked, setDisconnectConfirmChecked] = useState(false);

  // Helpers
  const formatLongDate = (d = new Date()) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const openAddSelector = () => setConnectPlatformId("selector");

  const openPlatformLogin = (id: string) => {
    setConnectEmail("");
    setConnectPlatformId(id);
  };

  const handleLoginConnect = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!connectPlatformId || connectPlatformId === "selector") return;

    // connect mock: set username from email or default
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === connectPlatformId
          ? {
              ...acc,
              isConnected: true,
              username: connectEmail ? `@${connectEmail.split("@")[0]}` : `@${acc.id}_official`,
              connectedDate: formatLongDate(new Date()),
            }
          : acc
      )
    );
    setConnectPlatformId(null);
    setConnectEmail("");
  };

  const quickConnect = (id: string) => {
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === id
          ? {
              ...acc,
              isConnected: true,
              username: `@${id}_official`,
              connectedDate: formatLongDate(new Date()),
            }
          : acc
      )
    );
    setConnectPlatformId(null);
    setConnectEmail("");
  };

  // disconnect
  const openDisconnect = (acc: Account) => {
    setDisconnectTarget(acc);
    setDisconnectConfirmChecked(false);
  };

  const confirmDisconnect = () => {
    if (!disconnectTarget || !disconnectConfirmChecked) return;
    setAccounts((prev) =>
      prev.map((a) =>
        a.id === disconnectTarget.id
          ? { ...a, isConnected: false, username: undefined, connectedDate: undefined }
          : a
      )
    );
    setDisconnectTarget(null);
    setDisconnectConfirmChecked(false);
  };

  const closeAllModals = () => {
    setConnectPlatformId(null);
    setConnectEmail("");
    setDisconnectTarget(null);
    setDisconnectConfirmChecked(false);
  };

  // guard
  if (!isAuthorized) return null;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        {/* Page header */}
        <div>
          <h1 className="text-3xl font-extrabold">Connected Accounts</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your social accounts</p>
        </div>

        {/* Connected Accounts container */}
        <div className="mt-6 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Connected Accounts</h2>

            <div className="flex items-center gap-3">
              <button
                onClick={openAddSelector}
                className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-100 hover:bg-blue-100"
              >
                <span className="inline-flex items-center gap-2">
                  <Plus size={14} />
                  Add Account
                </span>
              </button>
            </div>
          </div>

          {connectedAccounts.length === 0 ? (
            <div className="p-8 border border-dashed border-gray-200 rounded-xl text-center text-gray-500">
              No accounts connected yet. Click Add Account to connect one.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {connectedAccounts.map((acc) => (
                <div
                  key={acc.id}
                  className="relative bg-white rounded-xl border border-gray-200 p-5 shadow-sm"
                >
                  {/* gear icon top-right */}
                  <div className="absolute right-4 top-4 text-gray-300">
                    {/* small gear placeholder */}
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                      <path d="M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M19.4 15a1.6 1.6 0 00.3 1.6l.6.6a1 1 0 01-.7 1.7h-.8a1.6 1.6 0 00-1.4.9l-.2.6a1 1 0 01-1.9 0l-.2-.6a1.6 1.6 0 00-1.4-.9h-.8a1 1 0 01-.7-1.7l.6-.6a1.6 1.6 0 000-2.2l-.6-.6A1 1 0 019.6 9H10.4a1.6 1.6 0 001.4-.9l.2-.6a1 1 0 011.9 0l.2.6a1.6 1.6 0 001.4.9h.8a1 1 0 01.7 1.7l-.6.6a1.6 1.6 0 000 2.2z" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${acc.color} inline-flex items-center justify-center`}>
                      {acc.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900">{acc.name}</div>
                      <div className="text-xs text-gray-400 mt-1">{acc.username}</div>
                      <div className="text-xs text-gray-500 mt-3">Connected <span className="font-medium text-gray-700">{acc.connectedDate}</span></div>

                      <div className="flex gap-3 mt-5">
                        <button className="px-3 py-2 rounded-md bg-blue-50 text-blue-700 text-sm hover:bg-blue-100">+ Assign User</button>

                        <button
                          onClick={() => openDisconnect(acc)}
                          className="px-3 py-2 rounded-md bg-red-50 text-red-600 text-sm flex items-center gap-2 hover:bg-red-100"
                        >
                          <Trash2 size={14} />
                          Disconnect
                        </button>
                      </div>
                    </div>

                    <div className="ml-3">
                      <span className="inline-block w-3 h-3 rounded-full bg-green-500" title="Connected" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Available Integrations */}
        <div className="mt-8 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle size={18} className="text-gray-500" />
            <h3 className="text-lg font-semibold">Available Integrations</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {availableAccounts.map((a) => (
              <div key={a.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-200 bg-white">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-md ${a.color}`}>
                    {a.icon}
                  </div>
                  <div>
                    <div className="font-medium">{a.name}</div>
                    <div className="text-xs text-gray-400">Connect</div>
                  </div>
                </div>

                <button
                  onClick={() => openPlatformLogin(a.id)}
                  className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center"
                  aria-label={`Connect ${a.name}`}
                >
                  <Plus size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================= MODALS ================= */}

      {/* Platform selector (optional small grid) */}
      {connectPlatformId === "selector" && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add account</h3>
              <button onClick={closeAllModals} className="text-gray-400">✕</button>
            </div>

            <p className="text-sm text-gray-500 mb-5">Choose a platform to connect</p>

            <div className="grid grid-cols-3 gap-4">
              {availableAccounts.map((a) => (
                <div key={a.id} className="flex flex-col items-center gap-3 p-4 border rounded-lg">
                  <div className={`p-3 rounded-lg ${a.color}`}>{a.icon}</div>
                  <div className="font-medium">{a.name}</div>
                  <button onClick={() => quickConnect(a.id)} className="mt-1 px-3 py-1 rounded-md bg-blue-600 text-white text-sm">Connect</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Platform login modal */}
      {connectPlatformId && connectPlatformId !== "selector" && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 md:p-8 shadow-xl">
            <div className="flex items-start gap-4 mb-4">
              <div className={`p-3 rounded-lg ${accounts.find((a) => a.id === connectPlatformId)?.color}`}>
                {accounts.find((a) => a.id === connectPlatformId)?.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold">Connect {accounts.find((a) => a.id === connectPlatformId)?.name}</h3>
                <p className="text-sm text-gray-500 mt-1">Log in to authorize access and begin tracking your analytics.</p>
              </div>
            </div>

            <form onSubmit={handleLoginConnect} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-2">Email Address</label>
                <input
                  required
                  value={connectEmail}
                  onChange={(e) => setConnectEmail(e.target.value)}
                  type="email"
                  placeholder="name@example.com"
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <button type="submit" className="w-full bg-[#274C77] text-white py-3 rounded-lg font-bold">Log In &amp; Authorize</button>

              <button
                type="button"
                onClick={() => quickConnect(connectPlatformId)}
                className="w-full border border-gray-200 py-3 rounded-lg font-semibold text-gray-700"
              >
                Quick Connect (Mock OAuth)
              </button>

              <div className="text-center mt-2">
                <button type="button" onClick={closeAllModals} className="text-sm text-gray-500">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Disconnect modal */}
      {disconnectTarget && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
                <Trash2 className="text-red-600" />
              </div>
            </div>

            <h3 className="text-xl font-bold mb-2">Disconnect Account?</h3>
            <p className="text-sm text-gray-600 mb-4">
              You are about to remove <span className="font-semibold">{disconnectTarget.username ?? disconnectTarget.name}</span>. We will stop tracking data for this platform immediately.
            </p>

            <div className="mb-4 p-4 border rounded-lg bg-gray-50 text-left">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={disconnectConfirmChecked}
                  onChange={(e) => setDisconnectConfirmChecked(e.target.checked)}
                  className="mt-1 w-4 h-4"
                />
                <div className="text-sm text-gray-700">
                  I understand that SocialDesk will no longer have access to this account and historical data may be lost.
                </div>
              </label>
            </div>

            <div className="flex gap-3">
              <button onClick={() => { setDisconnectTarget(null); setDisconnectConfirmChecked(false); }} className="flex-1 py-2 rounded-lg border border-gray-200">Cancel</button>
              <button
                onClick={confirmDisconnect}
                disabled={!disconnectConfirmChecked}
                className={`flex-1 py-2 rounded-lg text-white ${disconnectConfirmChecked ? "bg-red-600 hover:bg-red-700" : "bg-red-300 cursor-not-allowed"}`}
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------- Small custom icons ------------------- */
function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" className="text-black">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

function PinterestIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" className="text-red-600">
      <path d="M9.04 21.54c.96.29 1.93.46 2.96.46a10 10 0 0 0 10-10A10 10 0 0 0 12 2 10 10 0 0 0 2 12c0 4.25 2.67 7.9 6.44 9.34-.09-.8-.16-2.02.03-2.88l1.10-4.63s-.27-.54-.27-1.33c0-1.25.72-2.18 1.62-2.18.76 0 1.13.57 1.13 1.26 0 .76-.49 1.91-.74 2.96-.21.89.44 1.61 1.31 1.61 1.57 0 2.78-1.66 2.78-4.05 0-2.12-1.52-3.59-3.70-3.59-2.70 0-4.27 2.02-4.27 4.10 0 .81.31 1.68.70 2.15.08.09.09.17.07.26l-.26 1.07c-.04.17-.14.21-.32.13-1.17-.54-1.90-2.24-1.90-3.60 0-2.93 2.13-5.63 6.14-5.63 3.22 0 5.73 2.30 5.73 5.38 0 3.21-2.02 5.79-4.83 5.79-.94 0-1.82-.49-2.12-.93l-.58 2.20c-.21.80-.77 1.80-1.14 2.41z" />
    </svg>
  );
}