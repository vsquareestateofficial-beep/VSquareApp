import React, { useEffect } from 'react';
import { Download, MapPin } from 'lucide-react';
import { useRealTimeData } from '../hooks/useRealTimeData';
import { parsePlotNumberList } from '../utils/earnings';
import { downloadAvailPlotImage } from '../utils/availPlotsImages';

export default function EmployeeAvailPlots({
  availablePlotsNote = '',
  availPlotsImages = [],
}) {
  // Enable real-time updates for available plots data
  useRealTimeData('employees');
  
  const plotChips = parsePlotNumberList(availablePlotsNote);
  const hasPlots = plotChips.length > 0 || availPlotsImages.length > 0;

  return (
    <div className="bg-[#0d1528]/80 border border-cyan-500/25 rounded-xl p-3 space-y-2">
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
  );
}
