export function normalizeUserDisplayName(name?: string | null) {
  const raw = String(name || '').trim();
  if (!raw) return '';
  if (/^BN-[^0-9]/i.test(raw)) {
    return raw.slice(3).trim();
  }
  return raw;
}

export function formatPatientCode(phone?: string | null, id?: string | null) {
  const cleanedPhone = String(phone || '').trim();
  if (/^\+?\d{9,15}$/.test(cleanedPhone)) {
    return `BN-${cleanedPhone.replace(/^\+/, '')}`;
  }
  if (id) {
    return `ID-${id.slice(0, 8)}`;
  }
  return '';
}
