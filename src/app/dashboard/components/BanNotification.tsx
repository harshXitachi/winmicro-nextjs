'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function BanNotification() {
  const { user } = useAuth();
  const [banInfo, setBanInfo] = useState<{
    is_banned: boolean;
    ban_reason: string;
    ban_expires_at: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkBanStatus = async () => {
      if (!user) return;
      
      try {
        const response = await fetch(`/api/users/${user.id}/ban-status`);
        if (response.ok) {
          const data = await response.json();
          setBanInfo(data);
        }
      } catch (error) {
        console.error('Error checking ban status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkBanStatus();
    // Check every 5 minutes
    const interval = setInterval(checkBanStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user]);

  if (loading || !banInfo?.is_banned) return null;

  const isTemporary = banInfo.ban_expires_at && new Date(banInfo.ban_expires_at) > new Date();
  const expiresAt = banInfo.ban_expires_at ? new Date(banInfo.ban_expires_at) : null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-4">
      <div className="max-w-4xl mx-auto bg-red-600 text-white rounded-2xl shadow-2xl p-6 border-4 border-red-700">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-red-800 rounded-full flex items-center justify-center animate-pulse">
              <i className="ri-alert-line text-3xl"></i>
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">
              {isTemporary ? '⏰ Account Temporarily Suspended' : '🚫 Account Permanently Banned'}
            </h2>
            <p className="text-red-100 mb-4 text-lg">
              Your account has been {isTemporary ? 'temporarily suspended' : 'permanently banned'} from the platform.
            </p>
            
            <div className="bg-red-700/50 rounded-xl p-4 mb-4">
              <p className="font-semibold mb-2">Reason:</p>
              <p className="text-red-100">{banInfo.ban_reason || 'Violation of terms of service'}</p>
            </div>

            {isTemporary && expiresAt && (
              <div className="bg-red-700/50 rounded-xl p-4 mb-4">
                <p className="font-semibold mb-2">Ban Expires:</p>
                <p className="text-red-100">
                  {expiresAt.toLocaleString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            )}

            <div className="flex items-center space-x-4">
              <div className="flex-1 bg-red-700/50 rounded-xl p-3">
                <p className="text-sm font-semibold mb-1">🔒 Restricted Actions</p>
                <ul className="text-xs text-red-100 space-y-1">
                  <li>• Creating new tasks</li>
                  <li>• Applying to tasks</li>
                  <li>• Wallet transactions</li>
                  <li>• Messaging other users</li>
                </ul>
              </div>
              
              <div className="flex-1 bg-red-700/50 rounded-xl p-3">
                <p className="text-sm font-semibold mb-1">📧 Need Help?</p>
                <p className="text-xs text-red-100">
                  Contact support at <strong>support@microwin.com</strong> to appeal this decision.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
