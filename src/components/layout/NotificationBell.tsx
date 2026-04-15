'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Package, X, CheckCheck } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import {
  subscribeToUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '@/lib/services/notificationService';
import type { Notification } from '@/types';
import Link from 'next/link';

const TYPE_ICONS: Record<string, string> = {
  order: '📦',
  promo: '🎉',
  restock: '🔔',
  flash_sale: '⚡',
  loyalty: '🏆',
  abandoned_cart: '🛒',
};

export function NotificationBell() {
  const { user } = useAuthStore();
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToUserNotifications(user.uid, setNotifs);
    return () => unsub();
  }, [user]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!user) return null;

  const unread = notifs.filter((n) => !n.isRead).length;

  const handleOpen = () => {
    setOpen((o) => !o);
  };

  const handleMarkRead = async (id: string) => {
    await markNotificationRead(id);
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead(user.uid);
    setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const formatTime = (d: any) => {
    try {
      const date = d instanceof Date ? d : new Date(d);
      const diff = Date.now() - date.getTime();
      if (diff < 60000) return 'just now';
      if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
      return date.toLocaleDateString();
    } catch { return ''; }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="w-10 h-10 flex items-center justify-center text-black hover:bg-gray-100 transition-colors relative"
        aria-label="Notifications"
      >
        <Bell size={20} strokeWidth={1} />
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 min-w-[16px] h-[16px] bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1 tabular-nums">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white shadow-xl border border-gray-100 rounded-xl overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div>
              <p className="text-[14px] font-bold text-gray-900">Notifications</p>
              {unread > 0 && (
                <p className="text-[11px] text-gray-400">{unread} unread</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1 text-[11px] text-blue-600 font-semibold hover:text-blue-800 transition-colors"
                >
                  <CheckCheck size={13} />
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="text-gray-300 hover:text-gray-600 transition-colors"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-gray-50">
            {notifs.length === 0 ? (
              <div className="py-10 text-center">
                <Bell size={28} className="text-gray-200 mx-auto mb-2" />
                <p className="text-[12px] text-gray-400">No notifications yet</p>
              </div>
            ) : (
              notifs.map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-colors hover:bg-gray-50 ${
                    !n.isRead ? 'bg-blue-50/40' : ''
                  }`}
                  onClick={() => handleMarkRead(n.id)}
                >
                  <div className="text-xl flex-shrink-0 mt-0.5">
                    {TYPE_ICONS[n.type] || '🔔'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[13px] leading-snug ${!n.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                      {n.title}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5 leading-snug line-clamp-2">{n.body}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{formatTime(n.createdAt)}</p>
                  </div>
                  {!n.isRead && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifs.length > 0 && (
            <div className="border-t border-gray-100 px-4 py-2.5 text-center">
              <Link
                href="/account/orders"
                onClick={() => setOpen(false)}
                className="text-[12px] font-bold text-gray-500 hover:text-black transition-colors flex items-center justify-center gap-1"
              >
                <Package size={13} /> View My Orders
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
