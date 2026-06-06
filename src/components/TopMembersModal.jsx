import React, { useState, useEffect } from 'react';
import { Trophy, X, Medal, Zap } from 'lucide-react';

export default function TopMembersModal({ isOpen, onClose, topMembers = [] }) {
  const [isVisible, setIsVisible] = useState(isOpen);

  useEffect(() => {
    setIsVisible(isOpen);
  }, [isOpen]);

  if (!isVisible || !topMembers || topMembers.length === 0) {
    return null;
  }

  const handleClose = () => {
    setIsVisible(false);
    onClose();
  };

  const getMedalColor = (position) => {
    switch (position) {
      case 0: return 'from-yellow-400 to-yellow-600'; // Gold
      case 1: return 'from-slate-300 to-slate-500'; // Silver
      case 2: return 'from-orange-400 to-orange-600'; // Bronze
      default: return 'from-slate-400 to-slate-600';
    }
  };

  const getMedalIcon = (position) => {
    switch (position) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return '⭐';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4 font-sans animate-in fade-in duration-300">
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-yellow-500/20 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
        
        {/* Header with Close Button */}
        <div className="relative bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-b border-yellow-500/20 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full blur-lg opacity-50 animate-pulse"></div>
                <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
                  <Trophy size={20} className="sm:size-[22px] text-slate-900" />
                </div>
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-serif font-bold text-white leading-tight">Top 3 Members</h2>
                <p className="text-[10px] sm:text-xs text-yellow-300">Month's Achievement</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-700/50 hover:bg-red-500/30 flex items-center justify-center text-slate-300 hover:text-red-400 transition-all duration-200 shrink-0 hover:scale-110 active:scale-95"
            >
              <X size={18} className="sm:size-[20px]" />
            </button>
          </div>
        </div>

        {/* Members List */}
        <div className="p-4 sm:p-5 space-y-3">
          {topMembers.slice(0, 3).map((member, index) => (
            <div
              key={member.id || index}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${getMedalColor(index)} p-[1px]`}
            >
              <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl p-3 sm:p-4 relative z-10">
                {/* Rank Badge */}
                <div className="absolute top-2 right-2 sm:top-3 sm:right-3 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg border-2 border-slate-900 z-20">
                  <span className="text-lg sm:text-xl font-black">{getMedalIcon(index)}</span>
                </div>

                {/* Member Info */}
                <div className="pr-12 sm:pr-14">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs sm:text-sm font-bold px-2 py-0.5 rounded-lg bg-gradient-to-r ${getMedalColor(index)} bg-clip-text text-transparent`}>
                      #{index + 1}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-white mb-0.5">{member.name || 'Unknown'}</h3>
                  <div className="flex items-center gap-1.5">
                    <Zap size={12} className="sm:size-[13px] text-yellow-400 flex-shrink-0" />
                    <p className="text-[10px] sm:text-xs text-slate-300">{member.role || 'Sales Executive'}</p>
                  </div>
                </div>

                {/* Achievement Glow */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r ${getMedalColor(index)} blur-xl -z-10`}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Message */}
        <div className="border-t border-slate-700/50 px-4 sm:px-5 py-3 sm:py-4 bg-slate-800/50 text-center">
          <p className="text-[10px] sm:text-xs text-slate-300">
            <span className="text-yellow-400 font-bold">Congratulations!</span> to our top performers this month. Keep up the amazing work! 🚀
          </p>
        </div>

        {/* Dismiss Button */}
        <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-2">
          <button
            onClick={handleClose}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs sm:text-sm py-2.5 sm:py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-emerald-500/50 active:scale-95"
          >
            Got It! 🎉
          </button>
        </div>
      </div>
    </div>
  );
}
