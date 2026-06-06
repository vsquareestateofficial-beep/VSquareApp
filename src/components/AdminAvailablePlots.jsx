import React, { useEffect, useState } from 'react';
import { Download, ImagePlus, MapPin, Save, X } from 'lucide-react';
import { parsePlotNumberList } from '../utils/earnings';
import {
  getAvailPlotsImages,
  readImageFile,
  saveAvailPlotsImages,
  downloadAvailPlotImage,
} from '../utils/availPlotsImages';

export default function AdminAvailablePlots({ employees, setEmployees }) {
  const [empId, setEmpId] = useState('');
  const [plotsText, setPlotsText] = useState('');
  const [images, setImages] = useState([]);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    if (!empId) {
      setPlotsText('');
      setImages([]);
      return;
    }
    if (empId === 'ALL') {
      setPlotsText('');
      setImages([]);
      setUploadError('');
      return;
    }
    const emp = employees.find((e) => e.id === empId);
    setPlotsText(emp?.availablePlotsNote ?? '');
    setImages(getAvailPlotsImages(empId));
    setUploadError('');
  }, [empId, employees]);

  const preview = parsePlotNumberList(plotsText);

  const handleImagePick = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length || !empId) return;

    setUploadError('');
    const added = [];
    for (const file of files) {
      try {
        const img = await readImageFile(file);
        added.push(img);
      } catch (err) {
        setUploadError(err.message || 'Upload failed.');
      }
    }
    if (added.length) setImages((prev) => [...prev, ...added]);
  };

  const removeImage = (id) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleSave = () => {
    if (!empId) return;
    if (!plotsText.trim() && images.length === 0) return;

    const note = plotsText.trim();
    
    if (empId === 'ALL') {
      const updated = employees.map((e) =>
        e.role !== 'Admin' ? { ...e, availablePlotsNote: note } : e
      );
      setEmployees(updated);
      
      const nonAdmins = employees.filter((e) => e.role !== 'Admin');
      const nonAdminIds = nonAdmins.map((emp) => emp.id);
      saveAvailPlotsImages(nonAdminIds, images);
      
      setPlotsText('');
      setImages([]);
      setEmpId('');
      return;
    }

    const updated = employees.map((e) =>
      e.id === empId ? { ...e, availablePlotsNote: note } : e,
    );
    setEmployees(updated);
    saveAvailPlotsImages(empId, images);
  };

  const canSave = empId && (plotsText.trim() || images.length > 0);

  return (
    <div className="bg-white border border-slate-300 rounded-xl p-3 mb-3 space-y-2 shadow-sm">
      <p className="text-[10px] font-bold tracking-widest text-emerald-800 uppercase flex items-center gap-1.5">
        <MapPin size={12} />
        Avail Plots
      </p>
      <div>
        <label className="text-[10px] text-emerald-700 uppercase font-bold block mb-1">Employee</label>
        <select
          value={empId}
          onChange={(e) => setEmpId(e.target.value)}
          className="w-full bg-[#f1f5f9] border border-slate-300 text-slate-900 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Select employee</option>
          <option value="ALL">All employees</option>
          {employees
            .filter((e) => e.role !== 'Admin')
            .map((e) => (
              <option key={e.id} value={e.id}>
                {e.name} ({e.id})
              </option>
            ))}
        </select>
      </div>
      <div>
        <label className="text-[10px] text-emerald-700 uppercase font-bold block mb-1">
          Plot numbers (comma separated)
        </label>
        <input
          type="text"
          value={plotsText}
          onChange={(e) => setPlotsText(e.target.value)}
          disabled={!empId}
          placeholder="14, 15, 154"
          className="w-full bg-[#f1f5f9] border border-slate-300 text-slate-900 rounded-lg px-3 py-2 text-sm disabled:opacity-50"
        />
      </div>

      <div>
        <label className="text-[10px] text-emerald-700 uppercase font-bold block mb-1">
          Upload images
        </label>
        <label
          className={`flex items-center justify-center gap-2 w-full py-3 rounded-lg border border-dashed border-emerald-500/40 text-emerald-700 text-xs font-bold cursor-pointer hover:bg-emerald-500/5 transition-colors ${!empId ? 'opacity-40 pointer-events-none' : ''}`}
        >
          <ImagePlus size={16} />
          Choose image(s)
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={!empId}
            onChange={handleImagePick}
            className="sr-only"
          />
        </label>
        {uploadError && <p className="text-[10px] text-red-400 mt-1 font-bold">{uploadError}</p>}
      </div>

      {preview.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {preview.map((plot) => (
            <span
              key={plot}
              className="text-[10px] font-bold px-2 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800"
            >
              {plot}
            </span>
          ))}
        </div>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {images.map((img) => (
            <div
              key={img.id}
              className="relative rounded-lg overflow-hidden border border-slate-300 bg-slate-100"
            >
              <img
                src={img.dataUrl}
                alt={img.name}
                className="w-full h-auto max-h-48 object-contain bg-slate-50"
              />
              <div className="absolute top-1 right-1 flex gap-1">
                <button
                  type="button"
                  onClick={() => downloadAvailPlotImage(img)}
                  className="w-7 h-7 rounded-md bg-white shadow-sm text-slate-700 flex items-center justify-center"
                  title="Download"
                >
                  <Download size={12} />
                </button>
                <button
                  type="button"
                  onClick={() => removeImage(img.id)}
                  className="w-7 h-7 rounded-md bg-[#f1f5f9]/90 text-red-400 flex items-center justify-center"
                  title="Remove"
                >
                  <X size={12} />
                </button>
              </div>
              <p className="text-[8px] text-slate-600 px-1.5 py-1 truncate">{img.name}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={!canSave}
          className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white py-2 rounded-lg text-sm font-bold shadow-sm"
        >
          <Save size={14} /> Save Avail Plots
        </button>
        {empId && empId !== 'ALL' && (plotsText || images.length > 0) && (
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Are you sure you want to delete available plots for this employee?')) {
                setPlotsText('');
                setImages([]);
                const updated = employees.map((e) =>
                  e.id === empId ? { ...e, availablePlotsNote: '' } : e
                );
                setEmployees(updated);
                saveAvailPlotsImages(empId, []);
              }
            }}
            className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors"
            title="Delete/Clear Available Plots"
          >
            <X size={14} /> Delete
          </button>
        )}
      </div>
    </div>
  );
}
