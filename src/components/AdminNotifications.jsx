import React from 'react';
import { Bell } from 'lucide-react';
import { isAvailPlotsNotification } from '../utils/availPlotsImages';

const getNotificationTag = (n) => {
  if (n.tag) return n.tag;
  if (n.type === 'Sale Approved' || n.status === 'Approved') return 'SALE';
  if (n.type === 'Sales Request') return 'SALE';
  if (n.type?.toLowerCase().includes('lead')) return 'LEAD';
  if (n.tag === 'PLOT' || n.type === 'Avail Plots' || n.type === 'Available Plots') return 'PLOT';
  return 'INFO';
};

const tagStyles = {
  LEAD: 'text-[#10b981] border-[#10b981]/40 bg-[#10b981]/10',
  SALE: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
  PLOT: 'text-cyan-300 border-cyan-500/40 bg-cyan-500/10',
  INFO: 'text-slate-600 border-slate-600/40 bg-[#e2e8f0]',
};

export const isNotificationUnread = (n) => {
  try {
    const readIds = JSON.parse(localStorage.getItem('vsquare_read_notifs_admin') || '[]');
    if (readIds.includes(n.id)) return false;
  } catch {}
  if (n.readBy) {
    return n.readBy.length === 0;
  }
  return n.read === false || (n.read == null && n.status === 'Pending');
};

export default function AdminNotifications({
  notifications,
  unreadCount,
  onMarkAllAsRead,
  onAcceptSale,
}) {
  const alertNotifications = notifications.filter((n) => !isAvailPlotsNotification(n));

  return (
    <div>
      <button
        type="button"
        onClick={onMarkAllAsRead}
        disabled={unreadCount === 0}
        className="w-full py-2 mb-3 rounded-xl border border-slate-300/80 text-[#10b981] text-[9px] font-bold tracking-[0.2em] uppercase transition-colors hover:border-[#10b981]/30 hover:bg-[#10b981]/5 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        MARK ALL AS READ
      </button>

      {alertNotifications.length === 0 ? (
        <div className="bg-[#0d1528]/60 border border-[#10b981]/20/80 p-6 rounded-xl text-center text-slate-500">
          <Bell size={28} className="mx-auto mb-3 opacity-25" />
          <p className="text-xs">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {alertNotifications.map((n) => {
            const tag = getNotificationTag(n);
            const unread = isNotificationUnread(n);
            return (
              <div
                key={n.id}
                className="bg-[#0d1528]/80 border border-[#10b981]/20/80 rounded-xl p-3"
              >
                <div className="flex gap-3">
                  {unread && (
                    <span
                      className="mt-2 w-2 h-2 shrink-0 rounded-full bg-[#34d399] shadow-[0_0_10px_rgba(212,175,55,0.9)]"
                      aria-hidden
                    />
                  )}
                  <div className={`flex-1 min-w-0 ${unread ? '' : 'pl-5'}`}>
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <h3 className="font-bold text-slate-900 text-sm leading-snug">{n.title}</h3>
                      <span
                        className={`shrink-0 text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-md border ${tagStyles[tag] || tagStyles.INFO}`}
                      >
                        {tag === 'PLOT' ? 'AVAIL' : tag}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                    {n.status === 'Pending' && n.type === 'Sales Request' && (
                      <button
                        type="button"
                        onClick={() => onAcceptSale(n.id, n.leadId)}
                        className="mt-2 w-full bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 py-2 rounded-lg text-xs font-bold border border-emerald-500/30 transition-colors"
                      >
                        Accept sale
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
