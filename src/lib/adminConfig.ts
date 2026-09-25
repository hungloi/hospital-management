// ── ADMIN ──────────────────────────────────────────────────────────
export const ADMIN_NAV = [
  // Tổng quan
  { href: '/admin', icon: '◈', label: 'Tổng quan' },
  // Nhân sự & Người dùng
  { href: '/admin/users', icon: '⊞', label: 'Tài khoản hệ thống' },
  { href: '/admin/doctors', icon: '⚕', label: 'Bác sĩ' },
  { href: '/admin/nurses', icon: '⊕', label: 'Điều dưỡng' },
  { href: '/admin/departments', icon: '⊟', label: 'Khoa' },
  { href: '/admin/schedules', icon: '⊞', label: 'Ca làm việc' },
  // Quản lý BN & KCB
  { href: '/admin/patients', icon: '⊚', label: 'Bệnh nhân' },
  { href: '/admin/appointments', icon: '⊡', label: 'Lịch hẹn' },
  { href: '/admin/records', icon: '⊟', label: 'Hồ sơ bệnh án' },
  { href: '/admin/inpatient', icon: '⊠', label: 'Nội trú' },
  { href: '/admin/rooms', icon: '⊟', label: 'Phòng bệnh' },
  // Tài chính & Kho
  { href: '/admin/payments', icon: '⊕', label: 'Thanh toán' },
  { href: '/admin/inventory', icon: '⊡', label: 'Tồn kho & Vật tư' },
  { href: '/admin/medicines', icon: '⊞', label: 'Danh mục thuốc' },
  // Nội dung & Báo cáo
  { href: '/admin/articles', icon: '⊟', label: 'Tin tức' },
  { href: '/admin/stats', icon: '⊠', label: 'Báo cáo & Thống kê' },
];

export const ADMIN_THEME = {
  bg: '#f0f4f8',
  sidebar: '#0a1628',
  border: '#e2e8f0',
  activeText: '#60a5fa',   // Blue-400 — Admin
  activeBg: 'rgba(96,165,250,0.12)',
  textMuted: '#64748b',
  text: '#0f172a',
  accentColor: '#60a5fa', // Sky blue accent
};

// ── DOCTOR ─────────────────────────────────────────────────────────
export const DOCTOR_NAV = [
  { href: '/doctor', icon: '◈', label: 'Tổng quan' },
  { href: '/doctor/schedule', icon: '⊡', label: 'Lịch khám hôm nay' },
  { href: '/doctor/patients', icon: '⊚', label: 'Bệnh nhân của tôi' },
  { href: '/doctor/prescriptions', icon: '⊕', label: 'Đơn thuốc đã kê' },
  { href: '/doctor/lab-orders', icon: '⊟', label: 'Chỉ định xét nghiệm' },
  { href: '/doctor/records', icon: '⊠', label: 'Hồ sơ bệnh án' },
  { href: '/doctor/inpatient', icon: '⊞', label: 'Bệnh nhân nội trú' },
];

export const DOCTOR_THEME = {
  bg: '#f0f9f5',
  sidebar: '#0a1628',
  border: '#d1fae5',
  activeText: '#34d399',   // Emerald — Doctor
  activeBg: 'rgba(52,211,153,0.12)',
  textMuted: '#64748b',
  text: '#0f172a',
  accentColor: '#34d399', // Teal/emerald accent
};

// ── PATIENT ────────────────────────────────────────────────────────
export const PATIENT_NAV = [
  { href: '/patient', icon: '◈', label: 'Trang chủ' },
  { href: '/patient/booking', icon: '⊡', label: 'Đăng ký khám bệnh' },
  { href: '/patient/appointments', icon: '⊞', label: 'Lịch sử khám bệnh' },
  { href: '/patient/records', icon: '⊟', label: 'Hồ sơ bệnh án' },
  { href: '/patient/payments', icon: '⊚', label: 'Thanh toán' },
  { href: '/patient/lab-results', icon: '⊞', label: 'Kết quả xét nghiệm' },
  { href: '/patient/prescriptions', icon: '⊕', label: 'Đơn thuốc' },
  { href: '/patient/profile', icon: '⊠', label: 'Thông tin cá nhân' },
];

export const PATIENT_THEME = {
  bg: '#f8faff',
  sidebar: '#0a1628',
  border: '#e2e8f0',
  activeText: '#818cf8',   // Indigo — Patient
  activeBg: 'rgba(129,140,248,0.12)',
  textMuted: '#64748b',
  text: '#0f172a',
  accentColor: '#818cf8', // Indigo accent
};

// ── RECEPTIONIST ───────────────────────────────────────────────────
export const RECEPTION_THEME = {
  bg: '#f8faff',
  sidebar: '#0a1628',
  border: '#e2e8f0',
  activeText: '#38bdf8',   // Sky — Reception
  activeBg: 'rgba(56,189,248,0.12)',
  textMuted: '#64748b',
  text: '#0f172a',
  accentColor: '#38bdf8',
};

// ── PHARMACY ───────────────────────────────────────────────────────
export const PHARMACY_THEME = {
  bg: '#f8fff8',
  sidebar: '#0a1628',
  border: '#e2e8f0',
  activeText: '#4ade80',   // Green — Pharmacy
  activeBg: 'rgba(74,222,128,0.12)',
  textMuted: '#64748b',
  text: '#0f172a',
  accentColor: '#4ade80',
};

// ── LAB TECH ───────────────────────────────────────────────────────
export const LAB_THEME = {
  bg: '#f5f8ff',
  sidebar: '#0a1628',
  border: '#e2e8f0',
  activeText: '#a78bfa',   // Violet — Lab
  activeBg: 'rgba(167,139,250,0.12)',
  textMuted: '#64748b',
  text: '#0f172a',
  accentColor: '#a78bfa',
};

// ── NURSE ──────────────────────────────────────────────────────────
export const NURSE_THEME = {
  bg: '#fff8f5',
  sidebar: '#0a1628',
  border: '#e2e8f0',
  activeText: '#fb923c',   // Orange — Nurse
  activeBg: 'rgba(251,146,60,0.12)',
  textMuted: '#64748b',
  text: '#0f172a',
  accentColor: '#fb923c',
};

// ── ACCOUNTANT ─────────────────────────────────────────────────────
export const ACCOUNTANT_THEME = {
  bg: '#f5fff8',
  sidebar: '#0a1628',
  border: '#e2e8f0',
  activeText: '#2dd4bf',   // Teal — Accountant
  activeBg: 'rgba(45,212,191,0.12)',
  textMuted: '#64748b',
  text: '#0f172a',
  accentColor: '#2dd4bf',
};

// ── DIRECTOR ───────────────────────────────────────────────────────
export const DIRECTOR_THEME = {
  bg: '#fdf8ff',
  sidebar: '#0a1628',
  border: '#e2e8f0',
  activeText: '#f0abfc',   // Purple — Director
  activeBg: 'rgba(240,171,252,0.12)',
  textMuted: '#64748b',
  text: '#0f172a',
  accentColor: '#f0abfc',
};
