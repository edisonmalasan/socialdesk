"use client";

import { useEffect, useState } from "react";
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

// Define the shape of an Account
type Account = {
  id: string;
  name: string;
  username?: string;
  connectedDate?: string;
  isConnected: boolean;
  color: string; 
  icon: React.ReactNode;
};

export default function AccountsPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  // --- ADMIN ROUTE GUARD ---
  useEffect(() => {
    const role = Cookies.get("user-role");
    if (role !== "admin") {
      router.push("/dashboard");
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  // Initial Mock Data - Facebook is connected, others are available
  const [accounts, setAccounts] = useState<Account[]>([
    {
      id: "facebook",
      name: "Facebook",
      username: "@john_doe123",
      connectedDate: "Feb 11, 2026",
      isConnected: true,
      color: "text-blue-600 bg-blue-50",
      icon: <Facebook size={24} />,
    },
    {
      id: "instagram",
      name: "Instagram",
      isConnected: false,
      color: "text-pink-600 bg-pink-50",
      icon: <Instagram size={24} />,
    },
    {
      id: "tiktok",
      name: "TikTok",
      isConnected: false,
      color: "text-black bg-gray-100",
      icon: <TikTokIcon />,
    },
    {
      id: "pinterest",
      name: "Pinterest",
      isConnected: false,
      color: "text-red-600 bg-red-50",
      icon: <PinterestIcon />,
    },
    {
      id: "youtube",
      name: "YouTube",
      isConnected: false,
      color: "text-red-600 bg-red-50",
      icon: <Youtube size={24} />,
    },
  ]);

  // Modal state
  const [connectPlatformId, setConnectPlatformId] = useState<string | null>(null);
  const [disconnectTarget, setDisconnectTarget] = useState<Account | null>(null);

  // Form state for connect modal
  const [connectEmail, setConnectEmail] = useState("");
  const [connectPassword, setConnectPassword] = useState("");

  // Confirm checkbox state for disconnect modal
  const [confirmChecked, setConfirmChecked] = useState(false);

  // Derived lists
  const connectedAccounts = accounts.filter((a) => a.isConnected);
  const availableAccounts = accounts.filter((a) => !a.isConnected);

  // Helpers
  const formatLongDate = (date = new Date()) =>
    date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  const openConnectModal = (id: string) => {
    setConnectPlatformId(id);
    setConnectEmail("");
    setConnectPassword("");
  };

  const handleConnectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!connectPlatformId) return;

    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === connectPlatformId
          ? {
              ...acc,
              isConnected: true,
              username: connectEmail ? `@${connectEmail.split("@")[0]}` : `@${acc.id}_official`,
              connectedDate: formatLongDate(),
            }
          : acc
      )
    );
    setConnectPlatformId(null);
  };

  const openDisconnectModal = (account: Account) => {
    setDisconnectTarget(account);
    setConfirmChecked(false);
  };

  const handleConfirmDisconnect = () => {
    if (!disconnectTarget || !confirmChecked) return;

    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === disconnectTarget.id
          ? { ...acc, isConnected: false, username: undefined, connectedDate: undefined }
          : acc
      )
    );
    setDisconnectTarget(null);
    setConfirmChecked(false);
  };

  const closeModals = () => {
    setConnectPlatformId(null);
    setDisconnectTarget(null);
    setConfirmChecked(false);
  };

  // Prevent rendering until admin check is complete
  if (!isAuthorized) return null;

  return (
    <div className="flex flex-col gap-6 overflow-x-hidden pb-10">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Connected Accounts</h1>
        <p className="text-gray-500 mt-1">Manage your platform connections</p>
      </div>

      {/* SECTION 1: CONNECTED ACCOUNTS (Updated to match Wireframe) */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Connected Accounts</h2>

        {connectedAccounts.length === 0 ? (
          <div className="p-8 border border-dashed border-gray-200 rounded-xl text-center text-muted bg-gray-50/50">
            No accounts connected yet. Connect a platform below to get started.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {connectedAccounts.map((account) => (
              <button
                key={account.id}
                onClick={() => openDisconnectModal(account)}
                // Hovering changes the border to red and prepares the disconnect action
                className="w-full flex items-center justify-between p-4 rounded-full border border-gray-200 hover:border-red-200 hover:bg-red-50 transition-all group focus:outline-none"
                title={`Disconnect ${account.name}`}
              >
                <div className="flex items-center gap-3 text-left min-w-0">
                  {/* We extract just the text-color from the co-intern's string and use CSS to shrink the icon slightly */}
                  <div className={`flex items-center justify-center shrink-0 w-6 h-6 ${account.color.split(' ')[0]} [&>svg]:w-5 [&>svg]:h-5`}>
                    {account.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 leading-none truncate">{account.name}</p>
                    <p className="text-xs text-gray-500 mt-1.5 truncate">{account.username}</p>
                  </div>
                </div>
                
                {/* Status Indicator: Green dot by default, Red Trash on hover */}
                <div className="relative w-6 h-6 flex items-center justify-center shrink-0 mr-1">
                   <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm transition-opacity duration-200 group-hover:opacity-0 absolute"></div>
                   <Trash2 size={16} className="text-red-500 opacity-0 transition-opacity duration-200 group-hover:opacity-100 absolute" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: AVAILABLE INTEGRATIONS */}
      <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <AlertCircle size={20} className="text-primary" />
          Available Integrations
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {availableAccounts.map((account) => (
            <div
              key={account.id}
              className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${account.color}`}>
                  <div className="scale-75 origin-center">{account.icon}</div>
                </div>
                <span className="font-bold text-gray-800 text-sm">
                  {account.name}
                </span>
              </div>

              <button
                onClick={() => openConnectModal(account.id)}
                className="p-2 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-primary hover:text-white hover:border-primary transition-colors shadow-sm"
                title={`Connect ${account.name}`}
              >
                <Plus size={18} />
              </button>
            </div>
          ))}

          {availableAccounts.length === 0 && (
            <p className="col-span-full text-center text-gray-500 text-sm py-8 font-medium">
              All supported platforms are currently connected! 🎉
            </p>
          )}
        </div>
      </div>

      {/* ========================================= */}
      {/* MODALS                                    */}
      {/* ========================================= */}
      
      {/* Connect Modal */}
      {connectPlatformId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 md:p-8 relative shadow-xl overflow-hidden">
            <div className="flex items-center gap-4 mb-6">
              <div className={`p-3 rounded-xl ${accounts.find((a) => a.id === connectPlatformId)?.color}`}>
                {accounts.find((a) => a.id === connectPlatformId)?.icon ?? null}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Connect {accounts.find((a) => a.id === connectPlatformId)?.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Log in to authorize access and begin tracking your analytics.
                </p>
              </div>
            </div>

            <form onSubmit={handleConnectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Email Address</label>
                <input
                  type="email"
                  value={connectEmail}
                  onChange={(e) => setConnectEmail(e.target.value)}
                  required
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-gray-900"
                  placeholder="name@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Password</label>
                <input
                  type="password"
                  value={connectPassword}
                  onChange={(e) => setConnectPassword(e.target.value)}
                  required
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-gray-900"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <button
                  type="submit"
                  className="w-full bg-[#274C77] text-white font-bold py-3 rounded-lg hover:bg-[#1a385b] transition-colors shadow-sm"
                >
                  Log In & Authorize
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConnectEmail(`${connectPlatformId}@company.com`);
                    setConnectPassword("oauth-token-pass");
                    setTimeout(() => {
                      setAccounts((prev) =>
                        prev.map((acc) =>
                          acc.id === connectPlatformId
                            ? {
                                ...acc,
                                isConnected: true,
                                username: `@${connectPlatformId}_official`,
                                connectedDate: formatLongDate(),
                              }
                            : acc
                        )
                      );
                      setConnectPlatformId(null);
                    }, 150);
                  }}
                  className="w-full border border-gray-200 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-50 transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  Quick Connect (Mock OAuth)
                </button>
              </div>

              <div className="text-center mt-4">
                <button type="button" onClick={closeModals} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Disconnect Modal */}
      {disconnectTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 md:p-8 relative shadow-xl">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                <Trash2 size={32} />
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Disconnect Account?</h3>
            <p className="text-sm text-center text-gray-500 mb-6">
              You are about to remove <span className="font-bold text-gray-900">{disconnectTarget.username ?? disconnectTarget.name}</span>. We will stop tracking data for this platform immediately.
            </p>

            <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-200">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmChecked}
                  onChange={(e) => setConfirmChecked(e.target.checked)}
                  className="mt-1 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <span className="text-sm text-gray-700 font-medium leading-tight">
                  I understand that SocialDesk will no longer have access to this account and historical data may be lost.
                </span>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={closeModals}
                className="flex-1 py-2.5 rounded-lg border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDisconnect}
                disabled={!confirmChecked}
                className={`flex-1 py-2.5 rounded-lg text-white font-bold transition-colors shadow-sm ${
                  confirmChecked
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-red-300 cursor-not-allowed"
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

// --- Custom Icons ---
function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

function PinterestIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path d="M9.04 21.54c.96.29 1.93.46 2.96.46a10 10 0 0 0 10-10A10 10 0 0 0 12 2 10 10 0 0 0 2 12c0 4.25 2.67 7.9 6.44 9.34-.09-.8-.16-2.02.03-2.88l1.10-4.63s-.27-.54-.27-1.33c0-1.25.72-2.18 1.62-2.18.76 0 1.13.57 1.13 1.26 0 .76-.49 1.91-.74 2.96-.21.89.44 1.61 1.31 1.61 1.57 0 2.78-1.66 2.78-4.05 0-2.12-1.52-3.59-3.70-3.59-2.70 0-4.27 2.02-4.27 4.10 0 .81.31 1.68.70 2.15.08.09.09.17.07.26l-.26 1.07c-.04.17-.14.21-.32.13-1.17-.54-1.90-2.24-1.90-3.60 0-2.93 2.13-5.63 6.14-5.63 3.22 0 5.73 2.30 5.73 5.38 0 3.21-2.02 5.79-4.83 5.79-.94 0-1.82-.49-2.12-.93l-.58 2.20c-.21.80-.77 1.80-1.14 2.41z" />
    </svg>
  );
}