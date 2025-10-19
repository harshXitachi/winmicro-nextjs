'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function BanNotification() {
  const { user } = useAuth();
  const [showBan, setShowBan] = useState(false);
  const [banInfo, setBanInfo] = useState<{
    reason: string;
    expiresAt: Date | null;
    bannedAt: Date;
  } | null>(null);

  useEffect(() => {
    if (user?.is_banned) {
      // Check if ban has expired
      if (user.ban_expires_at) {
        const expiryDate = new Date(user.ban_expires_at);
        if (expiryDate > new Date()) {
          setShowBan(true);
          setBanInfo({
            reason: user.ban_reason || 'Violation of terms of service',
            expiresAt: expiryDate,
            bannedAt: new Date(user.banned_at),
          });
        }
      } else {
        // Permanent ban
        setShowBan(true);
        setBanInfo({
          reason: user.ban_reason || 'Violation of terms of service',
          expiresAt: null,
          bannedAt: new Date(user.banned_at),
        });
      }
    } else {
      setShowBan(false);
    }
  }, [user]);

  if (!showBan || !banInfo) return null;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in fade-in duration-300">
        <div className="text-center">
          {/* Warning Icon */}
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <svg
              className="w-10 h-10 text-red-600 dark:text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-red-600 dark:text-red-400 mb-6">
            Account Suspended
          </h2>

          {/* Ban Details */}
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 mb-6 text-left space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Reason for Suspension:
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {banInfo.reason}
              </p>
            </div>

            <div className="border-t border-red-200 dark:border-red-800 pt-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Suspended on:
              </p>
              <p className="text-base font-medium text-gray-800 dark:text-gray-200">
                {formatDate(banInfo.bannedAt)}
              </p>
            </div>

            {banInfo.expiresAt ? (
              <div className="border-t border-red-200 dark:border-red-800 pt-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Suspension expires on:
                </p>
                <p className="text-base font-semibold text-orange-600 dark:text-orange-400">
                  {formatDate(banInfo.expiresAt)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  You will regain access after this date.
                </p>
              </div>
            ) : (
              <div className="bg-red-100 dark:bg-red-900/40 rounded-lg p-4 border-t border-red-200 dark:border-red-800 pt-4">
                <p className="text-red-700 dark:text-red-400 font-bold text-center text-lg">
                  ⚠️ This is a permanent suspension
                </p>
              </div>
            )}
          </div>

          {/* Support Message */}
          <div className="text-center space-y-4">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              If you believe this is a mistake or would like to appeal, please contact our support team.
            </p>

            <a
              href="mailto:support@winmicro.com"
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              <span className="flex items-center space-x-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span>Contact Support</span>
              </span>
            </a>
          </div>

          {/* Sign Out Option */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                // Sign out user
                window.location.href = '/api/auth/signout';
              }}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
