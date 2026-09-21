'use client';

import { useEffect, useMemo, useState, type CSSProperties, type FormEvent } from 'react';

interface PatientRecord {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  role: string;
}

export default function PatientsClient() {
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', dob: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/patients');
      if (!res.ok) throw new Error('Không thể tải danh sách bệnh nhân');
      setPatients(await res.json());
    } catch (error: any) {
      setMessage(error.message || 'Có lỗi khi tải bệnh nhân');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const stats = useMemo(() => ({
    total: patients.length,
    withPhone: patients.filter((p) => p.phone).length,
    withAddress: patients.filter((p) => p.address).length,
  }), [patients]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);
    setTemporaryPassword(null);
    try {
      const res = await fetch('/api/admin/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Không thể lưu bệnh nhân');
      setMessage(`✓ Đã tạo hồ sơ cho ${data.user?.name || form.name}`);
      setTemporaryPassword(data.temporaryPassword || null);
      setForm({ name: '', email: '', phone: '', address: '', dob: '' });
      await fetchData();
    } catch (error: any) {
      setMessage(error.message || 'Đã có lỗi xảy ra');
    } finally { setSubmitting(false); }
  };

  return (
    <div style={{ color: '#0f172a', padding: '2rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ color: '#60a5fa', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
          Quản lý bệnh nhân
        </div>
        <h1 style={{ margin: 0, fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>
          Bệnh nhân nội trú &amp; ngoại trú
        </h1>
        <p style={{ margin: '0.35rem 0 0', color: '#64748b', fontSize: '0.9rem' }}>
          Theo dõi hồ sơ bệnh nhân, thông tin liên hệ theo mô hình bệnh viện chuyên nghiệp.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.25rem', marginBottom: '1.75rem' }}>
        {[
          { label: 'Tổng bệnh nhân', value: stats.total, color: '#2563eb', bg: '#dbeafe' },
          { label: 'Có số điện thoại', value: stats.withPhone, color: '#16a34a', bg: '#dcfce7' },
          { label: 'Có địa chỉ', value: stats.withAddress, color: '#7c3aed', bg: '#ede9fe' },
        ].map(card => (
          <div key={card.label} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem 1.5rem', borderTop: `3px solid ${card.color}`, boxShadow: '0 1px 8px rgba(15,23,42,0.06)' }}>
            <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 500 }}>{card.label}</div>
            <div style={{ color: card.color, fontSize: '2rem', fontWeight: 900, marginTop: '0.25rem', lineHeight: 1 }}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: '1fr 1.1fr' }}>
        {/* Form */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 1px 8px rgba(15,23,42,0.06)' }}>
          <h2 style={{ margin: '0 0 0.35rem', fontSize: '1.05rem', color: '#0f172a', fontWeight: 700 }}>Tạo hồ sơ bệnh nhân mới</h2>
          <p style={{ margin: '0 0 1.25rem', color: '#64748b', fontSize: '0.88rem' }}>Điền thông tin để mở hồ sơ cho bệnh nhân mới trong hệ thống.</p>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.9rem' }}>
            <div>
              <label style={labelStyle}>Họ tên</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required style={inputStyle} placeholder="Nguyễn Văn A" />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required style={inputStyle} placeholder="example@email.com" />
            </div>
            <div style={{ display: 'grid', gap: '0.9rem', gridTemplateColumns: '1fr 1fr' }}>
              <div>
                <label style={labelStyle}>Số điện thoại</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={inputStyle} placeholder="0901234567" />
              </div>
              <div>
                <label style={labelStyle}>Ngày sinh</label>
                <input type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} style={inputStyle} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Địa chỉ</label>
              <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} style={inputStyle} placeholder="123 Đường ABC, TP.HCM" />
            </div>
            {message && (
              <div style={{ background: message.startsWith('✓') ? '#dcfce7' : '#fee2e2', border: `1px solid ${message.startsWith('✓') ? '#86efac' : '#fca5a5'}`, color: message.startsWith('✓') ? '#15803d' : '#dc2626', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.88rem', fontWeight: 500 }}>
                {message}
              </div>
            )}
            {temporaryPassword && (
              <div style={{ background: '#fef3c7', border: '1px solid #fde68a', color: '#92400e', padding: '0.8rem 0.9rem', borderRadius: '10px', fontSize: '0.85rem' }}>
                🔑 Mật khẩu tạm thời: <strong style={{ userSelect: 'all' }}>{temporaryPassword}</strong>
              </div>
            )}
            <button type="submit" disabled={submitting} style={{ background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '10px', padding: '0.875rem 1rem', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', fontSize: '0.92rem', opacity: submitting ? 0.7 : 1 }}>
              {submitting ? 'Đang lưu...' : '+ Tạo bệnh nhân'}
            </button>
          </form>
        </div>

        {/* Patient List */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 1px 8px rgba(15,23,42,0.06)' }}>
          <h2 style={{ margin: '0 0 0.25rem', fontSize: '1.05rem', color: '#0f172a', fontWeight: 700 }}>Danh sách bệnh nhân</h2>
          <p style={{ margin: '0 0 1rem', color: '#64748b', fontSize: '0.88rem' }}>Số lượng và thông tin liên hệ được cập nhật realtime khi tạo mới.</p>

          {loading ? (
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', color: '#64748b', textAlign: 'center' }}>Đang tải dữ liệu...</div>
          ) : patients.length === 0 ? (
            <div style={{ background: '#f8fafc', border: '1px dashed #d1d5db', borderRadius: '12px', padding: '1.5rem', color: '#64748b', textAlign: 'center' }}>Chưa có bệnh nhân nào trong hệ thống.</div>
          ) : (
            <div style={{ display: 'grid', gap: '0.75rem', maxHeight: '520px', overflowY: 'auto' }}>
              {patients.map((patient) => (
                <div key={patient.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '0.9rem 1rem', transition: 'box-shadow 0.15s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ color: '#0f172a', fontWeight: 700, fontSize: '0.95rem' }}>{patient.name || 'Bệnh nhân'}</div>
                    <span style={{ background: '#dbeafe', color: '#1d4ed8', borderRadius: '999px', padding: '0.2rem 0.65rem', fontSize: '0.7rem', fontWeight: 700 }}>{patient.role}</span>
                  </div>
                  <div style={{ color: '#475569', fontSize: '0.82rem', marginTop: '0.3rem' }}>{patient.email}</div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', color: '#64748b', fontSize: '0.8rem', marginTop: '0.35rem' }}>
                    <span>{patient.phone || 'Chưa có SĐT'}</span>
                    <span style={{ color: '#d1d5db' }}>•</span>
                    <span>{patient.address || 'Chưa có địa chỉ'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const labelStyle: CSSProperties = {
  display: 'block',
  marginBottom: '0.4rem',
  color: '#374151',
  fontSize: '0.82rem',
  fontWeight: 600,
};

const inputStyle: CSSProperties = {
  width: '100%',
  borderRadius: '10px',
  border: '1px solid #d1d5db',
  background: '#ffffff',
  color: '#0f172a',
  padding: '0.7rem 0.875rem',
  outline: 'none',
  fontSize: '0.9rem',
  boxSizing: 'border-box',
};
