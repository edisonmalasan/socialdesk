"use client";

import { useState } from "react";
import {
  Facebook,
  Instagram,
  Youtube,
  Trash2,
  Plus,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

// Define the shape of an Account
type Account = {
  id: string;
  name: string;
  username?: string;
  connectedDate?: string;
  isConnected: boolean;
  color: string; // For the icon background/color
  icon: React.ReactNode;
};

export default function AccountsPage() {
  // Initial Mock Data - Facebook is connected, others are available
  const [accounts, setAccounts] = useState<Account[]>([
    {
      id: "facebook",
      name: "Facebook",
      username: "@facebook_user_741",
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
  const [connectPlatformId, setConnectPlatformId] = useState<string | null>(
    null
  );
  const [disconnectTarget, setDisconnectTarget] = useState<Account | null>(
    null
  );

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
    date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  // Open connect modal for a platform
  const openConnectModal = (id: string) => {
    setConnectPlatformId(id);
    setConnectEmail("");
    setConnectPassword("");
  };

  // Submit connect form (simulates OAuth / login)
  const handleConnectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!connectPlatformId) return;

    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === connectPlatformId
          ? {
              ...acc,
              isConnected: true,
              // prefer local-part of email if provided, otherwise create a generic username
              username: connectEmail
                ? `@${connectEmail.split("@")[0]}`
                : `@${acc.id}_official`,
              connectedDate: formatLongDate(),
            }
          : acc
      )
    );

    setConnectPlatformId(null);
  };

  // Open disconnect modal
  const openDisconnectModal = (account: Account) => {
    setDisconnectTarget(account);
    setConfirmChecked(false);
  };

  // Confirm disconnect action
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

  // Close any modal
  const closeModals = () => {
    setConnectPlatformId(null);
    setDisconnectTarget(null);
    setConfirmChecked(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-primary">Connected Accounts</h1>
        <p className="text-muted">Manage your social media accounts</p>
      </div>

      {/* SECTION 1: CONNECTED ACCOUNTS */}
      <div>
        <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <CheckCircle2 size={20} className="text-green-600" />
          Active Connections
        </h2>

        {connectedAccounts.length === 0 ? (
          <div className="p-8 border border-dashed border-gray-200 rounded-xl text-center text-muted bg-gray-50/50">
            No accounts connected yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {connectedAccounts.map((account) => (
              <div
                key={account.id}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative group"
              >
                {/* Header: Icon + Name + Status Dot */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${account.color}`}>
                      {account.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">{account.name}</h3>
                      <span className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-green-600 tracking-wider bg-green-50 px-2 py-0.5 rounded-full w-fit">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                        Active
                      </span>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3 mb-6">
                  <div>
                    <p className="text-xs text-muted uppercase font-medium">
                      Username
                    </p>
                    <p className="text-sm font-semibold text-gray-700">
                      {account.username ?? "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted uppercase font-medium">
                      Connected Since
                    </p>
                    <p className="text-sm text-gray-700">
                      {account.connectedDate ?? "—"}
                    </p>
                  </div>
                </div>

                {/* Disconnect Button */}
                <button
                  onClick={() => openDisconnectModal(account)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-red-100 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={16} />
                  Disconnect
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: AVAILABLE SOCIAL (Matches Bottom of Wireframe) */}
      <div className="bg-gray-50/50 rounded-2xl p-8 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-700 mb-6 flex items-center gap-2">
          <AlertCircle size={20} className="text-primary" />
          Available Integrations
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {availableAccounts.map((account) => (
            <div
              key={account.id}
              className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${account.color}`}>
                  {/* Smaller icon for the list view */}
                  <div className="scale-75 origin-center">{account.icon}</div>
                </div>
                <span className="font-semibold text-gray-700">
                  {account.name}
                </span>
              </div>

              <button
                onClick={() => openConnectModal(account.id)}
                className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-primary hover:text-white transition-colors"
                aria-label={`Connect ${account.name}`}
              >
                <Plus size={20} />
              </button>
            </div>
          ))}

          {availableAccounts.length === 0 && (
            <p className="col-span-full text-center text-muted text-sm py-4">
              All supported platforms are connected! 🎉
            </p>
          )}
        </div>
      </div>

      {/* Connect Modal */}
      {connectPlatformId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md bg-white rounded-xl p-6 relative shadow-lg">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg bg-gray-100">
                {
                  accounts.find((a) => a.id === connectPlatformId)?.icon ?? null
                }
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  Add {accounts.find((a) => a.id === connectPlatformId)?.name}
                </h3>
                <p className="text-sm text-muted">
                  Already have an account? Log in to easily switch between them.
                </p>
              </div>
            </div>

            <form onSubmit={handleConnectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-muted mb-1">E-mail</label>
                <input
                  type="email"
                  value={connectEmail}
                  onChange={(e) => setConnectEmail(e.target.value)}
                  required
                  className="w-full border border-gray-200 rounded-lg p-2 text-sm"
                  placeholder="E-mail"
                />
              </div>

              <div>
                <label className="block text-xs text-muted mb-1">Password</label>
                <input
                  type="password"
                  value={connectPassword}
                  onChange={(e) => setConnectPassword(e.target.value)}
                  required
                  className="w-full border border-gray-200 rounded-lg p-2 text-sm"
                  placeholder="Password"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 btn btn-primary py-2.5 rounded-lg bg-primary text-white"
                >
                  Log in
                </button>
                <button
                  type="button"
                  onClick={() => {
                    // Quick-connect (simulate Google / oauth) - auto fill and submit
                    setConnectEmail(`${connectPlatformId}@example.com`);
                    setConnectPassword("oauth");
                    // small delay to let state update then submit
                    setTimeout(() => {
                      // directly perform the connection without requiring an explicit form submit
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
                  className="py-2.5 px-3 rounded-lg border border-gray-200 text-sm"
                >
                  Continue with Google
                </button>
              </div>

              <div className="text-right">
                <button
                  type="button"
                  onClick={closeModals}
                  className="text-sm text-muted underline"
                >
                  Cancel
                </button>
              </div>
            </form>

            <button
              onClick={closeModals}
              className="absolute top-3 right-3 text-xl leading-none"
              aria-label="Close"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* Disconnect Modal */}
      {disconnectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md bg-white rounded-xl p-6 relative shadow-lg">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg bg-red-50 text-red-600">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Delete account</h3>
                <p className="text-sm text-muted">
                  Are you sure you want to delete the account linked to{" "}
                  <span className="font-semibold">
                    {disconnectTarget.username ?? disconnectTarget.name}
                  </span>
                  ?
                </p>
              </div>
            </div>

            <div className="mb-4">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={confirmChecked}
                  onChange={(e) => setConfirmChecked(e.target.checked)}
                  className="form-checkbox"
                />
                <span className="text-sm text-muted">
                  I understand that I won't be able to recover my account.
                </span>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleConfirmDisconnect}
                disabled={!confirmChecked}
                className={`flex-1 py-2.5 rounded-lg text-white text-sm font-medium ${
                  confirmChecked
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-red-200 opacity-60 cursor-not-allowed"
                }`}
              >
                Delete
              </button>
              <button
                onClick={closeModals}
                className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm"
              >
                Cancel
              </button>
            </div>

            <button
              onClick={closeModals}
              className="absolute top-3 right-3 text-xl leading-none"
              aria-label="Close"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Custom Icons for brands missing from standard libraries ---

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