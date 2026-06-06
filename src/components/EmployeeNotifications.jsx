import React from 'react';
import { Bell, Download, MapPin } from 'lucide-react';
import { parsePlotNumberList } from '../utils/earnings';
import {
  downloadAvailPlotImage,
  isAvailPlotsNotification,
} from '../utils/availPlotsImages';

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

const isNotificationUnread = (n, currentUserId) => {
  try {
    const readIds = JSON.parse(localStorage.getItem(`vsquare_read_notifs_${currentUserId}`) || '[]');
    if (readIds.includes(n.id)) return false;
  } catch {}
  if (n.readBy) {
    return !n.readBy.includes(currentUserId);
  }
  return n.read === false || (n.read == null && n.status === 'Pending');
};

export default function EmployeeNotifications({
  notifications,
  unreadCount,
  onMarkAllAsRead,
  onMarkAsRead,
  currentUser,
  availablePlotsNote = '',
  availPlotsImages = [],
}) {
  const plotChips = parsePlotNumberList(availablePlotsNote);
  const hasPlots = plotChips.length > 0 || availPlotsImages.length > 0;
  const alertNotifications = notifications.filter((n) => !isAvailPlotsNotification(n));

  return (
    <div>
      <div className="bg-[#0d1528]/80 border border-cyan-500/25 rounded-xl p-3 mb-3 space-y-2">
        <p className="text-[9px] font-bold tracking-widest text-cyan-300 uppercase flex items-center gap-1.5">
          <MapPin size={12} />
          Avail Plots
        </p>
        {!hasPlots ? (
          <p className="text-xs text-slate-500">No avail plots yet. Admin will update your list.</p>
        ) : (
          <>
            {plotChips.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {plotChips.map((plot) => (
                  <span
                    key={plot}
                    className="text-[10px] font-bold px-2 py-1 rounded-md bg-cyan-500/15 border border-cyan-500/30 text-cyan-200"
                  >
                    {plot}
                  </span>
                ))}
              </div>
            )}
            {availPlotsImages.length > 0 && (
              <div className="space-y-3 pt-1">
                {availPlotsImages.map((img) => (
                  <div
                    key={img.id}
                    className="rounded-xl overflow-hidden border border-cyan-500/30 bg-[#0b1120]"
                  >
                    <img
                      src={img.dataUrl}
                      alt={img.name}
                      className="w-full h-auto block"
                      decoding="sync"
                    />
                    <div className="p-2.5 flex items-center justify-between gap-2 border-t border-cyan-500/15">
                      <p className="text-[10px] text-slate-600 truncate flex-1">{img.name}</p>
                      <button
                        type="button"
                        onClick={() => downloadAvailPlotImage(img)}
                        className="shrink-0 flex items-center gap-1 text-[10px] font-bold uppercase text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 px-2.5 py-1.5 rounded-lg hover:bg-cyan-500/25"
                      >
                        <Download size={12} />
                        Download HD
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

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
          <p className="text-xs">No alerts yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {alertNotifications.map((n) => {
            const tag = getNotificationTag(n);
            const unread = isNotificationUnread(n, currentUser.id);
            return (
              <div
                key={n.id}
                onClick={() => unread && onMarkAsRead(n.id)}
                className={`bg-[#0d1528]/80 border border-[#10b981]/20/80 rounded-xl p-3 cursor-pointer ${unread ? 'border-[#10b981]/30 bg-[#10b981]/5' : ''}`}
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
