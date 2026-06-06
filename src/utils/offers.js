/** Map Supabase row (lowercase columns) → app offer shape */
export function mapOfferFromDb(row) {
  if (!row) return null;
  const rawImg = row.imageurl ?? row.imageUrl ?? '';
  const imageUrls = rawImg ? String(rawImg).split('|||').filter(Boolean) : [];
  const isActive =
    row.isactive !== undefined && row.isactive !== null
      ? row.isactive
      : row.isActive !== false;

  return {
    id: row.id,
    title: row.title,
    message: row.message ?? '',
    imageUrl: imageUrls[0] || null,
    imageUrls,
    startDate: row.startdate ?? row.startDate ?? null,
    endDate: row.enddate ?? row.endDate ?? null,
    isActive,
    created_at: row.created_at,
  };
}

/** Map app offer → Supabase insert/upsert (lowercase columns) */
export function mapOfferToDb(offer) {
  const cleanUrls = Array.isArray(offer.imageUrls)
    ? offer.imageUrls.filter(Boolean)
    : offer.imageUrl
      ? [offer.imageUrl]
      : [];

  return {
    id: offer.id,
    title: offer.title,
    message: offer.message || null,
    imageurl: cleanUrls.join('|||') || null,
    startdate: offer.startDate || null,
    enddate: offer.endDate || null,
    isactive: offer.isActive !== undefined ? offer.isActive : true,
    created_at: offer.created_at || new Date().toISOString(),
  };
}
