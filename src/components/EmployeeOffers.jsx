import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Megaphone, Calendar, ChevronLeft, ChevronRight, MessageSquare, Sparkles, Download } from 'lucide-react';

export default function EmployeeOffers() {
  const { offers, isOfferActive, fetchOffers, employees } = useAppContext();
  const [activeOffers, setActiveOffers] = useState([]);
  
  // Track active slide index for each offer's images
  const [imageIndices, setImageIndices] = useState({});

  useEffect(() => {
    // Fetch latest offers from Supabase when component mounts
    console.log('EmployeeOffers mounted, fetching offers from Supabase...');
    if (fetchOffers) {
      fetchOffers().catch(err => console.error('Error fetching offers:', err));
    }

    // Set up a polling interval to keep offers updated
    const pollInterval = setInterval(() => {
      console.log('EmployeeOffers polling - fetching offers...');
      if (fetchOffers) {
        fetchOffers().catch(err => console.warn('EmployeeOffers poll error:', err));
      }
    }, 5000); // Poll every 5 seconds for real-time updates

    return () => clearInterval(pollInterval);
  }, [fetchOffers]);

  useEffect(() => {
    // Filter offers that are scheduled and active right now, excluding TOP_PERFORMERS
    const filtered = (offers || []).filter(o => isOfferActive(o) && o.id !== 'TOP_PERFORMERS');
    setActiveOffers(filtered);

    // Initialize image index map for each offer
    const initialIndices = {};
    filtered.forEach(o => {
      initialIndices[o.id] = 0;
    });
    setImageIndices(initialIndices);
    
    console.log('EmployeeOffers - Updated active offers count:', filtered.length);
  }, [offers, isOfferActive]);

  const handleNextImage = (offerId, maxImages) => {
    setImageIndices(prev => ({
      ...prev,
      [offerId]: (prev[offerId] + 1) % maxImages
    }));
  };

  const handlePrevImage = (offerId, maxImages) => {
    setImageIndices(prev => ({
      ...prev,
      [offerId]: (prev[offerId] - 1 + maxImages) % maxImages
    }));
  };

  if (activeOffers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 sm:p-8 bg-[#f1f5f9]/50 border border-[#047857]/20 rounded-2xl text-center min-h-[250px] sm:min-h-[300px] font-sans">
        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#e2e8f0] flex items-center justify-center text-slate-500 mb-3 border border-slate-200 animate-pulse">
          <Megaphone size={20} className="sm:size-[24px]" />
        </div>
        <h3 className="text-sm sm:text-base font-serif font-bold text-slate-900 mb-1">No Active Announcements</h3>
        <p className="text-xs sm:text-sm text-slate-600 max-w-[280px] leading-relaxed">Check back later for exciting offers, chat events, and updates from the administration.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4 pb-4 font-sans">
      <div className="flex items-center justify-between mb-2 sm:mb-3 gap-2">
        <h2 className="text-xs sm:text-sm font-serif font-black text-white tracking-wider flex items-center gap-1.5 uppercase">
          <Sparkles size={12} className="sm:size-[14px] animate-spin text-yellow-400" /> Latest Announcements
        </h2>
        <span className="text-[8px] sm:text-[9px] bg-[#f8fafc]/80 border border-slate-300/50 text-slate-600 px-1.5 sm:px-2 py-0.5 rounded-full font-bold whitespace-nowrap">
          {activeOffers.length} {activeOffers.length === 1 ? 'ACTIVE' : 'ACTIVES'}
        </span>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {activeOffers.map(offer => {
          const imgUrls = Array.isArray(offer.imageUrls) ? offer.imageUrls : (offer.imageUrl ? [offer.imageUrl] : []);
          const hasImages = imgUrls.length > 0;
          const currentImgIndex = imageIndices[offer.id] || 0;

          return (
            <div 
              key={offer.id} 
              className="bg-gradient-to-br from-slate-900 to-[#0e172a] border border-[#047857]/20 rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all duration-300 hover:border-slate-300"
            >
              {/* Multi-Image Slider Header */}
              {hasImages && (
                <div className="relative w-full bg-slate-900 border-b border-slate-200 overflow-hidden group">
                  {/* Slides */}
                  <div 
                    className="w-full flex transition-transform duration-500 ease-out"
                    style={{ transform: `translateX(-${currentImgIndex * 100}%)` }}
                  >
                    {imgUrls.map((url, i) => (
                      <div key={i} className="w-full shrink-0 relative flex items-center justify-center bg-slate-900">
                        <img 
                          src={url} 
                          alt="" 
                          className="w-full max-h-[500px] object-contain" 
                          onError={(e) => { e.target.style.display = 'none'; }} 
                        />
                        <a
                          href={url}
                          download={`offer-image-${i + 1}.jpg`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute top-3 right-3 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 backdrop-blur-md transition-colors z-50 shadow-[0_0_15px_rgba(0,0,0,0.5)]"
                          title="Download Image"
                        >
                          <Download size={18} className="sm:size-[22px]" />
                        </a>
                      </div>
                    ))}
                  </div>

                  {/* Navigation Arrows for Multi-Images */}
                  {imgUrls.length > 1 && (
                    <>
                      <button 
                        onClick={() => handlePrevImage(offer.id, imgUrls.length)}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-slate-950/80 border border-slate-200 flex items-center justify-center text-slate-900 hover:bg-slate-900 transition-colors z-10"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button 
                        onClick={() => handleNextImage(offer.id, imgUrls.length)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-slate-950/80 border border-slate-200 flex items-center justify-center text-slate-900 hover:bg-slate-900 transition-colors z-10"
                      >
                        <ChevronRight size={16} />
                      </button>

                      {/* Dots indicator */}
                      <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 bg-slate-950/60 px-2 py-1 rounded-full backdrop-blur-sm">
                        {imgUrls.map((_, i) => (
                          <div 
                            key={i} 
                            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === currentImgIndex ? 'bg-[#047857] w-3' : 'bg-white/40'}`} 
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Offer Body */}
              <div className="p-3 sm:p-4">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="text-sm sm:text-base font-serif font-bold text-slate-900 tracking-wide">{offer.title}</h3>
                  {!hasImages && (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#047857]/10 border border-[#047857]/20 flex items-center justify-center text-[#047857] shrink-0">
                      <Megaphone size={14} className="sm:size-[16px]" />
                    </div>
                  )}
                </div>

                {offer.message && (
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mt-2 sm:mt-3 whitespace-pre-wrap">
                    {offer.message}
                  </p>
                )}

                {/* Footer Info / Schedule */}
                {offer.endDate && (
                  <div className="flex items-center gap-1.5 mt-3 sm:mt-4 text-[8px] sm:text-[9px] text-slate-500 bg-slate-950/40 p-2 rounded-lg border border-slate-200 w-fit">
                    <Calendar size={10} className="sm:size-[11px] text-[#047857] shrink-0" />
                    <span>
                      Offer valid till: <strong className="text-slate-700">{new Date(offer.endDate).toLocaleDateString()}</strong>
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
