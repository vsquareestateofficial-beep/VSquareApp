import { get, set } from 'idb-keyval';

const STORAGE_KEY = 'vsquare_avail_plots_images';
const MAX_FILE_BYTES = 4 * 1024 * 1024;

export const AVAIL_PLOTS_MAX_IMAGE_MB = 4;

export function isAvailPlotsNotification(n) {
  return (
    n?.tag === 'PLOT' ||
    n?.type === 'Avail Plots' ||
    n?.type === 'Available Plots'
  );
}

export async function getAvailPlotsImages(empId) {
  if (!empId) return [];
  try {
    const all = (await get(STORAGE_KEY)) || {};
    return Array.isArray(all[empId]) ? all[empId] : [];
  } catch {
    return [];
  }
}

export async function saveAvailPlotsImages(empIdOrIds, images) {
  if (!empIdOrIds) return;
  try {
    const all = (await get(STORAGE_KEY)) || {};
    
    if (Array.isArray(empIdOrIds)) {
      empIdOrIds.forEach(id => {
        all[id] = images;
      });
    } else {
      all[empIdOrIds] = images;
    }
    
    await set(STORAGE_KEY, all);
  } catch (e) {
    console.warn('Could not save avail plot images:', e);
  }
}

export function readImageFile(file) {
  if (!file?.type?.startsWith('image/')) {
    return Promise.reject(new Error('Please choose an image file (JPG, PNG, etc.).'));
  }
  if (file.size > MAX_FILE_BYTES) {
    return Promise.reject(
      new Error(`Image must be under ${AVAIL_PLOTS_MAX_IMAGE_MB} MB.`),
    );
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve({
        id: `IMG_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        name: file.name || 'avail-plots.jpg',
        dataUrl: reader.result,
        uploadedAt: new Date().toISOString(),
      });
    reader.onerror = () => reject(new Error('Could not read image.'));
    reader.readAsDataURL(file);
  });
}

export function downloadAvailPlotImage(image) {
  if (!image?.dataUrl) return;
  const link = document.createElement('a');
  link.href = image.dataUrl;
  link.download = image.name || 'avail-plots.jpg';
  document.body.appendChild(link);
  link.click();
  link.remove();
}
