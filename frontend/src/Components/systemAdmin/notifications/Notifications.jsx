import React, { useState, useEffect } from "react";
import { Bell, Check, RefreshCw, CheckCheck, Clock } from "lucide-react";
import { notificationApi } from "../../../api/notificationApi";

export default function SystemAdminNotifications({ toast, onUnreadCountChange }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationApi.list();
      setNotifications(data || []);

      const unreadCount = (data || []).filter((n) => !(n.isRead ?? n.read)).length;
      onUnreadCountChange?.(unreadCount);
    } catch (err) {
      toast?.(err.message || "Failed to load notifications.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await notificationApi.markRead(id);
      setNotifications((prev) =>
        prev.map((n) =>
          (n.notificationId || n.id) === id ? { ...n, isRead: true, read: true } : n
        )
      );

      const unreadCount = notifications.filter(
        (n) => (n.notificationId || n.id) !== id && !(n.isRead ?? n.read)
      ).length;
      onUnreadCountChange?.(unreadCount);
    } catch (err) {
      toast?.(err.message || "Failed to mark notification as read.", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw size={24} className="animate-spin text-blue-600" />
        <span className="ml-2 text-sm text-slate-500 font-medium">Loading notifications...</span>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !(n.isRead ?? n.read)).length;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Platform Notifications</h1>
          <p className="text-sm text-slate-600">System admin alerts, application updates, and platform messages.</p>
        </div>
        <button
          onClick={fetchNotifications}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Notifications Card */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell size={16} className="text-blue-600" />
            <span className="font-bold text-slate-900 text-sm">Notifications ({notifications.length})</span>
          </div>
          {unreadCount > 0 && (
            <span className="rounded-full bg-red-100 text-red-800 text-xs font-bold px-2.5 py-0.5">
              {unreadCount} Unread
            </span>
          )}
        </div>

        <div className="divide-y divide-slate-100">
          {notifications.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-2">
              <Bell size={32} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-700">No Notifications</p>
              <p className="text-xs text-slate-400">You have no system notifications at this time.</p>
            </div>
          ) : (
            notifications.map((n) => {
              const id = n.notificationId || n.id;
              const isRead = n.isRead ?? n.read;

              return (
                <div
                  key={id}
                  className={`p-4 flex items-start justify-between gap-4 transition-colors ${
                    isRead ? "bg-white" : "bg-blue-50/30"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-1 flex h-2 w-2 shrink-0 rounded-full ${
                        isRead ? "bg-slate-300" : "bg-blue-600"
                      }`}
                    />
                    <div>
                      <h4 className={`text-sm ${isRead ? "font-semibold text-slate-800" : "font-extrabold text-slate-900"}`}>
                        {n.title || "Notification"}
                      </h4>
                      <p className="text-xs text-slate-600 mt-0.5">{n.message}</p>
                      <p className="text-[10px] text-slate-400 mt-1 font-mono flex items-center gap-1">
                        <Clock size={10} />
                        {n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}
                      </p>
                    </div>
                  </div>

                  {!isRead && (
                    <button
                      onClick={() => handleMarkRead(id)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors shrink-0"
                    >
                      <Check size={14} /> Mark Read
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
