import React from 'react';
import { Trophy, Medal, Award, X } from 'lucide-react';

export default function TopPerformers({ topPerformers, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="relative max-w-md w-full">
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 z-10 w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-all shadow-lg"
        >
          <X size={20} />
        </button>

        <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(217,119,6,0.3)] border border-amber-200/50">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-full mb-4 shadow-lg">
              <Trophy size={20} />
              <span className="font-bold text-sm tracking-wider uppercase">Top Performers of the Month</span>
            </div>
            <p className="text-amber-800 font-medium">Recognizing excellence and dedication</p>
          </div>

          <div className="space-y-4">
            {topPerformers.map((performer, index) => {
              const rankConfig = [
                {
                  icon: <Trophy className="w-6 h-6 text-yellow-500" />,
                  bg: 'from-yellow-400 to-amber-500',
                  ring: 'ring-yellow-400',
                  shadow: 'shadow-[0_0_20px_rgba(250,204,21,0.4)]'
                },
                {
                  icon: <Medal className="w-6 h-6 text-slate-400" />,
                  bg: 'from-slate-300 to-slate-400',
                  ring: 'ring-slate-300',
                  shadow: 'shadow-[0_0_20px_rgba(148,163,184,0.4)]'
                },
                {
                  icon: <Award className="w-6 h-6 text-amber-600" />,
                  bg: 'from-amber-500 to-orange-600',
                  ring: 'ring-amber-500',
                  shadow: 'shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                }
              ];
              const config = rankConfig[index];

              return (
                <div key={performer.id} className="relative">
                  <div className={`bg-white rounded-2xl p-4 sm:p-5 border border-amber-100 shadow-sm hover:shadow-md transition-all flex items-center gap-4`}>
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br ${config.bg} ${config.shadow} flex items-center justify-center shrink-0 ring-4 ${config.ring}`}>
                      {config.icon}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black tracking-widest text-amber-700 mb-1 uppercase">{performer.role}</p>
                      <h3 className="text-lg sm:text-xl font-bold text-slate-800 truncate">{performer.name}</h3>
                      <p className="text-[11px] text-slate-500 mt-1">{performer.branchOffice?.split(',')[0] || 'Corporate Office'}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-[9px] font-bold tracking-widest text-amber-600 mb-1 uppercase">Rank</p>
                      <div className={`text-2xl font-black ${index === 0 ? 'text-yellow-600' : index === 1 ? 'text-slate-500' : 'text-amber-700'}`}>
                        #{index + 1}
                      </div>
                    </div>
                  </div>

                  {index < topPerformers.length - 1 && (
                    <div className="absolute left-10 right-10 h-4 border-l-2 border-r-2 border-amber-200" style={{top: '100%'}}></div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-8 pt-4 border-t border-amber-200">
            <p className="text-center text-[11px] text-amber-700">
              Congratulations to all top performers! Keep up the amazing work!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
