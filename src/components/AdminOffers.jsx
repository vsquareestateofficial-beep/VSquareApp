import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Plus, X, Pencil, Trash2, Calendar, Image as ImageIcon, ToggleLeft, ToggleRight, Sparkles, CheckCircle2, Upload } from 'lucide-react';

export default function AdminOffers() {
  const { offers, setOffers, deleteOffer, employees } = useAppContext();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingOfferId, setEditingOfferId] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const [form, setForm] = useState({
    title: '',
    message: '',
    imageUrls: [],
    startDate: '',
    endDate: '',
    isActive: true
  });
  
  const [errors, setErrors] = useState({});
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleImageFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    
    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        alert('Please upload image files only');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target.result;
        setForm(prev => ({
          ...prev,
          imageUrls: [...prev.imageUrls, base64]
        }));
      };
      reader.readAsDataURL(file);
    });
    
    // Reset file input
    e.target.value = '';
  };

  const handleRemoveImage = (index) => {
    setForm(prev => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index)
    }));
  };

  const validate = () => {
    const err = {};
    if (!form.title.trim()) err.title = 'Title is required';
    if (form.startDate && form.endDate && new Date(form.startDate) > new Date(form.endDate)) {
      err.dates = 'Start date must be before end date';
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaveError('');
    setSaving(true);

    const cleanImageUrls = form.imageUrls.filter(Boolean);
    const offerData = {
      id: editingOfferId || `OFFER${Date.now()}`,
      title: form.title.trim(),
      message: form.message,
      imageUrl: cleanImageUrls[0] || null,
      imageUrls: cleanImageUrls,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
      isActive: form.isActive,
      created_at: new Date().toISOString(),
    };

    const nextOffers = editingOfferId
      ? offers.map((o) => (o.id === editingOfferId ? offerData : o))
      : [offerData, ...offers];

    const result = await setOffers(nextOffers);
    setSaving(false);

    if (result?.ok === false) {
      setSaveError(result.error || 'Could not save to Supabase. Try smaller images.');
      return;
    }

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
    resetForm();
  };

  const resetForm = () => {
    setForm({
      title: '',
      message: '',
      imageUrls: [],
      startDate: '',
      endDate: '',
      isActive: true
    });
    setErrors({});
    setEditingOfferId(null);
    setShowAddForm(false);
  };

  const handleEdit = (offer) => {
    setForm({
      title: offer.title || '',
      message: offer.message || '',
      imageUrls: Array.isArray(offer.imageUrls) && offer.imageUrls.length > 0 
        ? offer.imageUrls 
        : (offer.imageUrl ? [offer.imageUrl] : ['']),
      startDate: offer.startDate ? offer.startDate.slice(0, 16) : '',
      endDate: offer.endDate ? offer.endDate.slice(0, 16) : '',
      isActive: offer.isActive !== false
    });
    setEditingOfferId(offer.id);
    setShowAddForm(true);
  };

  const handleDelete = async (offerId, title) => {
    if (!window.confirm(`🗑️ Permanently delete "${title}"?\n\nThis will remove it from employees' views and Supabase.`)) {
      return;
    }
    
    setSaving(true);
    setSaveError('');
    console.log('Deleting offer:', offerId);
    
    try {
      const result = await deleteOffer(offerId);
      console.log('Delete result:', result);
      
      if (result?.ok === false) {
        setSaveError(result.error || 'Failed to delete offer');
        console.error('Delete failed:', result.error);
      } else {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        console.log('✓ Offer deleted successfully');
      }
    } catch (err) {
      setSaveError(err.message || 'Error deleting offer');
      console.error('Delete error:', err);
    } finally {
      setSaving(false);
    }
  };

  const getStatusText = (offer) => {
    const now = new Date();
    if (!offer.isActive) return { text: 'Disabled', color: 'text-red-400 bg-red-400/10 border-red-500/20' };
    if (offer.startDate && new Date(offer.startDate) > now) return { text: 'Scheduled', color: 'text-yellow-400 bg-yellow-400/10 border-yellow-500/20' };
    if (offer.endDate && new Date(offer.endDate) < now) return { text: 'Expired', color: 'text-slate-600 bg-[#e2e8f0] border-slate-300/50' };
    return { text: 'Active', color: 'text-[#047857] bg-[#047857]/10 border-[#047857]/20' };
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Success Notification */}
      {saveError && (
        <div className="bg-red-500/15 border border-red-500/40 text-red-600 px-3 py-2 rounded-xl text-xs font-bold mb-2">
          {saveError}
        </div>
      )}

      {saveSuccess && (
        <div className="fixed top-4 sm:top-6 right-4 sm:right-6 z-50 bg-gradient-to-r from-[#047857]/20 to-[#065f46]/20 border border-[#047857]/50 text-[#047857] px-4 py-3 rounded-xl text-sm font-bold shadow-lg animate-in fade-in slide-in-from-top-2 duration-300 flex items-center gap-2">
          <CheckCircle2 size={16} />
          Offer saved successfully! Employees will see it shortly.
        </div>
      )}
      
      {/* Add New Offer Button */}
      {!showAddForm && (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full bg-gradient-to-r from-[#047857] to-[#065f46] text-white py-3 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 mb-2 sm:mb-3 hover:opacity-95 active:opacity-90 transition-opacity"
        >
          <Plus size={16} className="sm:w-[15px] sm:h-[15px]" /> Create Offer / Announcement
        </button>
      )}

      {/* List of Offers */}
      {!showAddForm && (
        <div className="space-y-2.5 sm:space-y-3">
          {offers.length === 0 ? (
            <div className="bg-gradient-to-br from-[#047857]/5 to-[#065f46]/5 border-2 border-dashed border-[#047857]/30 p-8 sm:p-10 rounded-2xl flex flex-col items-center justify-center text-center min-h-[220px] sm:min-h-[280px]">
              <Sparkles size={32} className="text-[#047857] mb-3 opacity-50 animate-pulse" />
              <p className="text-sm sm:text-base text-slate-700 font-semibold">No offers yet</p>
              <p className="text-xs sm:text-sm text-slate-600 max-w-xs leading-relaxed mt-1">Create your first offer or announcement to engage employees with special promotions and updates.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm sm:text-base font-bold text-slate-900">All Offers & Announcements</h2>
                <span className="text-xs font-semibold bg-[#047857]/10 text-[#047857] px-2.5 py-1 rounded-full">{offers.filter(o => o.id !== 'TOP_PERFORMERS').length}</span>
              </div>
              <div className="space-y-2.5">
                {offers.filter(o => o.id !== 'TOP_PERFORMERS').map(offer => {
                  const status = getStatusText(offer);
                  const imgUrls = Array.isArray(offer.imageUrls) ? offer.imageUrls : (offer.imageUrl ? [offer.imageUrl] : []);
                  return (
                    <div key={offer.id} className={`bg-white border ${!offer.isActive ? 'border-red-900/20 opacity-70' : 'border-[#047857]/30'} p-4 sm:p-4 rounded-2xl relative transition-all duration-300 hover:border-[#047857]/50 shadow-sm hover:shadow-md`}>
                      
                      {/* Status Badge */}
                      <div className="absolute top-3 sm:top-4 right-3 sm:right-4 flex items-center gap-1.5 z-10">
                        <span className={`text-[7px] sm:text-[8px] font-bold px-2.5 py-1 rounded-full border ${status.color}`}>
                          {status.text.toUpperCase()}
                        </span>
                      </div>

                      <div className="flex gap-3 sm:gap-4 mt-1">
                        {imgUrls.length > 0 ? (
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border-2 border-slate-100 bg-slate-50 relative shadow-md">
                            <img src={imgUrls[0]} alt="" className="w-full h-full object-cover" />
                            {imgUrls.length > 1 && (
                              <div className="absolute bottom-0 right-0 bg-slate-950/90 px-1.5 py-0.5 rounded-tl-lg text-[7px] font-bold text-[#047857]">
                                +{imgUrls.length - 1}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-br from-[#047857]/10 to-[#065f46]/10 flex items-center justify-center shrink-0 border-2 border-[#047857]/20">
                            <ImageIcon size={24} className="sm:size-[28px] text-[#047857] opacity-60" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate pr-16">{offer.title}</h3>
                          {offer.id === 'TOP_PERFORMERS' ? (
                            <p className="text-[11px] sm:text-xs text-slate-600 mt-1 leading-relaxed font-medium">
                              {(() => {
                                try {
                                  const ids = JSON.parse(offer.message);
                                  const names = ids.map((id, index) => {
                                    const emp = employees.find(e => e.id === id);
                                    return emp ? `#${index + 1} ${emp.name}` : null;
                                  }).filter(Boolean);
                                  return names.length > 0 ? `🏆 ${names.join(', ')}` : 'No top performers selected yet.';
                                } catch {
                                  return offer.message || 'No text message';
                                }
                              })()}
                            </p>
                          ) : (
                            <p className="text-[11px] sm:text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed font-medium">{offer.message || 'No text message'}</p>
                          )}
                        </div>
                      </div>

                      {/* Scheduled Times */}
                      {(offer.startDate || offer.endDate) && (
                        <div className="flex items-center gap-2 mt-3 sm:mt-4 text-[9px] sm:text-[10px] text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
                          <Calendar size={12} className="text-[#047857] shrink-0" />
                          <span className="truncate font-medium">
                            {offer.startDate ? new Date(offer.startDate).toLocaleDateString() : 'Now'}
                            {' → '}
                            {offer.endDate ? new Date(offer.endDate).toLocaleDateString() : '∞'}
                          </span>
                        </div>
                      )}

                      {/* Controls */}
                      <div className="flex justify-end gap-2 border-t border-slate-100 pt-3 mt-3">
                        <button 
                          onClick={() => handleEdit(offer)} 
                          className="px-3 py-1.5 rounded-lg bg-[#047857]/10 hover:bg-[#047857]/20 text-[#047857] flex items-center justify-center gap-1.5 transition-colors text-xs font-semibold"
                        >
                          <Pencil size={14} /> Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(offer.id, offer.title)} 
                          disabled={saving}
                          className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center gap-1.5 transition-colors text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash2 size={14} /> {saving ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* Add / Edit Form Modal-style View */}
      {showAddForm && (
        <div className="fixed inset-0 bg-[#ffffff] z-50 p-3 sm:p-4 overflow-y-auto pb-32 sm:pb-24 font-sans animate-in fade-in duration-200">
          <div className="flex justify-between items-center mb-4 sm:mb-5">
            <div className="flex-1">
              <h1 className="text-lg sm:text-xl font-serif font-bold text-slate-900 leading-tight">
                {editingOfferId ? 'Edit Offer / Announcement' : 'Create Offer / Announcement'}
              </h1>
              <p className="text-slate-600 text-[11px] sm:text-xs mt-0.5">Broadcast custom events, chats or offers</p>
            </div>
            <button 
              onClick={resetForm} 
              className="w-9 h-9 sm:w-8 sm:h-8 bg-[#e2e8f0] rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-700 active:bg-[#e2e8f0] transition-colors ml-2 shrink-0"
            >
              <X size={18} className="sm:size-[16px]" />
            </button>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {/* Title */}
            <div>
              <label className="text-[10px] font-bold text-slate-600 tracking-widest mb-1.5 block uppercase">
                Title <span className="text-[#047857]">*</span>
              </label>
              <input 
                value={form.title} 
                placeholder="e.g. Special Festival Property Offer!" 
                onChange={e => setForm({ ...form, title: e.target.value })} 
                className={`w-full p-2.5 bg-[#e2e8f0] border ${errors.title ? 'border-red-500/50' : 'border-[#047857]/20'} rounded-xl focus:outline-none focus:border-[#047857] text-sm text-slate-900`}
              />
              {errors.title && <p className="text-red-400 text-[10px] mt-1">{errors.title}</p>}
            </div>

            {/* Message */}
            <div>
              <label className="text-[10px] font-bold text-slate-600 tracking-widest mb-1.5 block uppercase">
                Message / Text Content
              </label>
              <textarea 
                value={form.message} 
                placeholder="Describe your offer, event details or announcement..." 
                rows={4}
                onChange={e => setForm({ ...form, message: e.target.value })} 
                className="w-full p-2.5 bg-[#e2e8f0] border border-[#047857]/20 rounded-xl focus:outline-none focus:border-[#047857] text-sm text-slate-900 resize-none"
              />
            </div>

            {/* Image URLs List */}
            {/* Image Upload */}
            <div>
              <label className="text-[10px] font-bold text-slate-600 tracking-widest mb-2 block uppercase">
                Upload Images
              </label>
              
              <div className="border-2 border-dashed border-[#047857]/30 bg-[#047857]/5 rounded-2xl p-6 text-center cursor-pointer hover:border-[#047857]/50 transition-colors">
                <input 
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageFileUpload}
                  className="hidden"
                  id="offer-image-upload"
                />
                <label htmlFor="offer-image-upload" className="cursor-pointer flex flex-col items-center gap-2">
                  <Upload size={24} className="text-[#047857]" />
                  <p className="text-sm font-semibold text-slate-900">Click to upload images</p>
                  <p className="text-xs text-slate-600">or drag and drop your images</p>
                </label>
              </div>

              {/* Image Preview Grid */}
              {form.imageUrls.length > 0 && (
                <div className="mt-4">
                  <p className="text-[10px] font-bold text-slate-600 tracking-widest mb-2 uppercase">
                    Uploaded Images ({form.imageUrls.length})
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {form.imageUrls.map((imgUrl, index) => (
                      <div key={index} className="relative group">
                        <div className="w-full aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                          <img 
                            src={imgUrl} 
                            alt={`Upload preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Date Pickers */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-600 tracking-widest mb-1.5 block uppercase">
                  Start Date & Time
                </label>
                <input 
                  type="datetime-local" 
                  value={form.startDate} 
                  onChange={e => setForm({ ...form, startDate: e.target.value })} 
                  className="w-full p-2.5 bg-[#e2e8f0] border border-[#047857]/20 rounded-xl focus:outline-none focus:border-[#047857] text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-600 tracking-widest mb-1.5 block uppercase">
                  End Date & Time
                </label>
                <input 
                  type="datetime-local" 
                  value={form.endDate} 
                  onChange={e => setForm({ ...form, endDate: e.target.value })} 
                  className="w-full p-2.5 bg-[#e2e8f0] border border-[#047857]/20 rounded-xl focus:outline-none focus:border-[#047857] text-xs text-slate-900"
                />
              </div>
            </div>
            {errors.dates && <p className="text-red-400 text-[10px]">{errors.dates}</p>}

            {/* Active Toggle Switch */}
            <div className="bg-[#f1f5f9]/60 border border-[#047857]/20 rounded-xl p-3 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-slate-900">Enable Visibility</span>
                <p className="text-[10px] text-slate-500 mt-0.5">Control if this announcement is active</p>
              </div>
              <button 
                type="button" 
                onClick={() => setForm(prev => ({ ...prev, isActive: !prev.isActive }))}
                className="text-slate-600 hover:text-[#047857] transition-colors"
              >
                {form.isActive ? (
                  <ToggleRight size={28} className="text-[#047857]" />
                ) : (
                  <ToggleLeft size={28} />
                )}
              </button>
            </div>

            {/* Image Preview Area */}
            {form.imageUrls.filter(Boolean).length > 0 && (
              <div className="border border-[#047857]/20 bg-[#047857]/5 p-3 rounded-2xl">
                <p className="text-[9px] font-bold text-slate-600 tracking-wider mb-2 uppercase">Image Preview ({form.imageUrls.filter(Boolean).length})</p>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                  {form.imageUrls.filter(Boolean).map((url, i) => (
                    <div key={i} className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-[#047857]/20 bg-slate-100 relative group">
                      <img src={url} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex gap-3">
              <button 
                onClick={resetForm}
                className="flex-1 bg-[#e2e8f0] hover:bg-slate-300 text-slate-700 py-2.5 rounded-xl font-bold text-xs transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-[#047857] to-[#065f46] disabled:opacity-50 text-white py-2.5 rounded-xl font-bold text-xs shadow-lg hover:opacity-95 transition-all"
              >
                {saving ? 'Saving…' : 'Save Announcement'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
