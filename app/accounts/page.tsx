"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Facebook, Instagram, Youtube, Trash2, Plus, X } from "lucide-react";

/* ------------------------- Types ------------------------- */
type Platform = {
  id: string;
  name: string;
  color: string;
  icon: React.ReactNode;
};

type Connected = {
  id: string;
  platformId: string;
  username: string;
  connectedDate: string;
};

const uid = (prefix = "") => `${prefix}${Math.random().toString(36).slice(2, 9)}`;

const platforms: Platform[] = [
  { id: "facebook", name: "Facebook", color: "text-blue-600 bg-blue-50", icon: <Facebook size={20} /> },
  { id: "instagram", name: "Instagram", color: "text-pink-600 bg-pink-50", icon: <Instagram size={20} /> },
  {
    id: "x",
    name: "X",
    color: "text-gray-700 bg-gray-100",
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  { id: "tiktok", name: "TikTok", color: "text-black bg-gray-100", icon: <TikTokIcon /> },
  { id: "pinterest", name: "Pinterest", color: "text-red-600 bg-red-50", icon: <PinterestIcon /> },
  { id: "youtube", name: "YouTube", color: "text-red-600 bg-red-50", icon: <Youtube size={20} /> },
];

const formatLongDate = (d = new Date()) => d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

export default function AccountsPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const role = Cookies.get("user-role");
    if (role !== "admin") router.push("/dashboard");
    else setIsAuthorized(true);
  }, [router]);

  const [connectedAccounts, setConnectedAccounts] = useState<Connected[]>([
    {
      id: uid("conn_"),
      platformId: "facebook",
      username: "@john_doe123",
      connectedDate: "February 14, 2026",
    },
    {
      id: uid("conn_"),
      platformId: "instagram",
      username: "@instagram_user_143",
      connectedDate: "February 16, 2026",
    },
  ]);

  const [connectPlatformId, setConnectPlatformId] = useState<string | null>(null); // null | "selector" | platformId
  const [connectEmail, setConnectEmail] = useState("");
  const [disconnectId, setDisconnectId] = useState<string | null>(null);
  const [confirmChecked, setConfirmChecked] = useState(false);

  const findPlatform = (id: string | undefined) => platforms.find((p) => p.id === id);

  const openAddSelector = () => setConnectPlatformId("selector");
  const openPlatformLogin = (platformId: string) => {
    setConnectEmail("");
    setConnectPlatformId(platformId);
  };

  const handleConnectSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!connectPlatformId || connectPlatformId === "selector") return;

    const platformId = connectPlatformId;
    const username = connectEmail ? `@${connectEmail.split("@")[0]}` : `@${platformId}_user_${Math.floor(Math.random() * 1000)}`;

    const newConn: Connected = {
      id: uid("conn_"),
      platformId,
      username,
      connectedDate: formatLongDate(new Date()),
    };

    setConnectedAccounts((prev) => [newConn, ...prev]);
    setConnectPlatformId(null);
    setConnectEmail("");
  };

  const quickConnect = (platformId: string) => {
    const newConn: Connected = {
      id: uid("conn_"),
      platformId,
      username: `@${platformId}_official`,
      connectedDate: formatLongDate(new Date()),
    };
    setConnectedAccounts((prev) => [newConn, ...prev]);
    setConnectPlatformId(null);
  };

  const openDisconnectModal = (connId: string) => {
    setDisconnectId(connId);
    setConfirmChecked(false);
  };

  const handleConfirmDisconnect = () => {
    if (!disconnectId || !confirmChecked) return;
    setConnectedAccounts((prev) => prev.filter((c) => c.id !== disconnectId));
    setDisconnectId(null);
    setConfirmChecked(false);
  };

  const closeAllModals = () => {
    setConnectPlatformId(null);
    setConnectEmail("");
    setDisconnectId(null);
    setConfirmChecked(false);
  };

  if (!isAuthorized) return null;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* header */}
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Connected Accounts</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your social media accounts</p>
        </div>

        {/* Connected Accounts card */}
        <section className="mt-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-5 flex items-start justify-between gap-4 sm:mb-6">
            <h2 className="text-base font-semibold sm:text-lg">Connected Accounts</h2>
          </div>

          {connectedAccounts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-gray-500 sm:p-8">
              No accounts connected yet. Tap Add Account to connect a platform.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 sm:gap-5 lg:gap-6">
              {connectedAccounts.map((c) => {
                const p = findPlatform(c.platformId)!;
                return (
                  <div key={c.id} className="relative rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
                    <div className="absolute right-4 top-4 text-gray-300">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z"
                          stroke="#CBD5E1"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>

                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className={`inline-flex items-center justify-center rounded-lg p-3 ${p.color}`}>{p.icon}</div>

                      <div className="min-w-0 flex-1">
                        <div className="truncate font-semibold text-gray-900">{p.name}</div>
                        <div className="mt-1 truncate text-xs text-gray-400">{c.username}</div>
                        <div className="mt-3 text-sm text-gray-500">
                          Connected <span className="ml-1 font-medium text-gray-700">{c.connectedDate}</span>
                        </div>

                        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-2">
                          <button className="inline-flex w-full items-center justify-center rounded-md bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 sm:w-auto sm:min-w-[112px]">
                            + Assign User
                          </button>

                          <button
                            onClick={() => openDisconnectModal(c.id)}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100 sm:w-auto sm:min-w-[112px]"
                          >
                            <Trash2 size={14} /> Disconnect
                          </button>
                        </div>
                      </div>

                      <div className="ml-1 sm:ml-3">
                        <span className="inline-block h-3 w-3 rounded-full bg-green-500" title="Connected" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-6 flex justify-center">
            <button
              onClick={openAddSelector}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#2B77E6] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#2469ca] sm:w-auto sm:px-6 sm:py-2"
            >
              <Plus size={14} /> Add Account
            </button>
          </div>
        </section>
      </div>

      {/* ================= MODALS ================= */}

      {/* Centered selector modal */}
      {connectPlatformId === "selector" && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-3 sm:items-center sm:p-4">
          <div className="w-full max-w-4xl rounded-2xl border border-gray-100 bg-white p-4 shadow-xl sm:max-h-[90dvh] sm:overflow-y-auto sm:p-6">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h4 className="text-lg font-semibold">Add account</h4>
              <button onClick={closeAllModals} className="rounded-full p-2 text-gray-500 hover:bg-gray-100" aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <p className="mb-4 text-sm text-gray-500">Choose a platform to connect</p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-4">
              {platforms.map((p) => (
                <div key={p.id} className="flex h-full flex-col items-center gap-3 rounded-xl border border-gray-100 p-4 text-center">
                  <div className={`rounded-lg p-3 ${p.color}`}>{p.icon}</div>
                  <div className="text-sm font-medium text-gray-900">{p.name}</div>

                  <div className="mt-auto flex w-full flex-col gap-2 sm:mx-auto sm:max-w-[220px] sm:flex-row sm:justify-center">
                    <button
                      onClick={() => openPlatformLogin(p.id)}
                      className="inline-flex w-full items-center justify-center rounded-md bg-[#274C77] px-3 py-2.5 text-sm font-medium text-white whitespace-nowrap sm:w-1/2 sm:min-w-0 sm:flex-1"
                    >
                      Connect
                    </button>
                    <button
                      onClick={() => quickConnect(p.id)}
                      className="inline-flex w-full items-center justify-center rounded-md border border-gray-200 px-3 py-2.5 text-sm font-medium whitespace-nowrap sm:w-1/2 sm:min-w-0 sm:flex-1"
                    >
                      Quick
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex justify-end">
              <button onClick={closeAllModals} className="text-sm text-gray-500 hover:text-gray-700">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Platform login modal */}
      {connectPlatformId && connectPlatformId !== "selector" && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 p-3 sm:items-center sm:p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-4 shadow-xl sm:max-h-[90dvh] sm:overflow-y-auto sm:p-6 md:p-8">
            <div className="mb-4 flex items-start gap-4">
              <div className={`rounded-lg p-3 ${findPlatform(connectPlatformId)?.color}`}>{findPlatform(connectPlatformId)?.icon}</div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-bold sm:text-xl">Connect {findPlatform(connectPlatformId)?.name}</h3>
                <p className="mt-1 text-sm text-gray-500">Log in to authorize access and begin tracking your analytics.</p>
              </div>
              <button onClick={closeAllModals} className="rounded-full p-2 text-gray-500 hover:bg-gray-100 sm:hidden" aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleConnectSubmit();
              }}
              className="space-y-4"
            >
              <div>
                <label className="mb-2 block text-xs font-semibold text-gray-700">Email Address</label>
                <input
                  required
                  value={connectEmail}
                  onChange={(e) => setConnectEmail(e.target.value)}
                  type="email"
                  placeholder="name@example.com"
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <button type="submit" className="w-full rounded-lg bg-[#274C77] py-3 text-sm font-bold text-white">
                Log In &amp; Authorize
              </button>

              <button
                type="button"
                onClick={() => quickConnect(connectPlatformId)}
                className="w-full rounded-lg border border-gray-200 py-3 text-sm font-semibold text-gray-700"
              >
                Quick Connect (Mock OAuth)
              </button>

              <div className="flex justify-center pt-1">
                <button type="button" onClick={closeAllModals} className="text-sm text-gray-500 hover:text-gray-700">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Disconnect modal */}
      {disconnectId && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/50 p-3 sm:items-center sm:p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-4 text-center shadow-xl sm:max-h-[90dvh] sm:overflow-y-auto sm:p-6">
            <div className="mb-4 flex items-center justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
                <Trash2 className="text-red-600" />
              </div>
            </div>

            <h3 className="mb-2 text-xl font-bold">Disconnect Account?</h3>

            <p className="mb-4 text-sm text-gray-600">
              You are about to remove{" "}
              <span className="font-semibold">{connectedAccounts.find((c) => c.id === disconnectId)?.username ?? "this account"}</span>. We will
              stop tracking data for this platform immediately.
            </p>

            <div className="mb-4 rounded-lg border bg-gray-50 p-4 text-left">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={confirmChecked}
                  onChange={(e) => setConfirmChecked(e.target.checked)}
                  className="mt-1 h-4 w-4 shrink-0"
                />
                <div className="text-sm text-gray-700">
                  I understand that SocialDesk will no longer have access to this account and historical data may be lost.
                </div>
              </label>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={() => {
                  setDisconnectId(null);
                  setConfirmChecked(false);
                }}
                className="w-full rounded-lg border border-gray-200 py-3 text-sm font-medium sm:w-auto sm:min-w-[120px] sm:px-4 sm:py-2"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDisconnect}
                disabled={!confirmChecked}
                className={`w-full rounded-lg py-3 text-sm font-medium text-white sm:w-auto sm:min-w-[120px] sm:px-4 sm:py-2 ${
                  confirmChecked ? "bg-red-600 hover:bg-red-700" : "cursor-not-allowed bg-red-300"
                }`}
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