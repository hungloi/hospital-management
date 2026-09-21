'use client';

import { useState } from 'react';
import { createMedicalOrder, dischargePatient } from '@/app/actions/doctorActions';

export default function InpatientDetailClient({ record, doctorId }: { record: any, doctorId: string }) {
  const [orderText, setOrderText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData();
    formData.append('recordId', record.id);
    formData.append('doctorId', doctorId);
    formData.append('orderText', orderText);

    const res = await createMedicalOrder(formData);
    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      setOrderText('');
    }
  };

  const handleDischarge = async () => {
    if (confirm('Bạn có chắc chắn muốn cho bệnh nhân xuất viện?')) {
      await dischargePatient(record.id);
    }
  };

  const inputStyle = { width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1fae5', backgroundColor: '#f0fdf9', color: '#064e3b', outline: 'none' };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
      {/* Cột trái: Danh sách y lệnh */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <h2 style={{ color: '#064e3b', fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
          <span>📋 Y lệnh (Medical Orders)</span>
        </h2>
        
        {record.status === 'ADMITTED' && (
          <form onSubmit={handleAddOrder} style={{ marginBottom: '2rem', display: 'flex', gap: '0.75rem' }}>
            <input 
              value={orderText} 
              onChange={e => setOrderText(e.target.value)} 
              placeholder="Nhập y lệnh mới (VD: Bơm tiêm 50ml NaCl, siêu âm ổ bụng...)" 
              style={{ ...inputStyle, flex: 1 }} 
              required
            />
            <button type="submit" disabled={loading} style={{ background: '#059669', color: 'white', border: 'none', padding: '0 1.5rem', borderRadius: '8px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Đang thêm...' : 'Thêm y lệnh'}
            </button>
          </form>
        )}

        {error && <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {record.medicalOrders.length === 0 ? (
            <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>Chưa có y lệnh nào.</p>
          ) : (
            record.medicalOrders.map((o: any) => (
              <div key={o.id} style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', borderLeft: '4px solid #10b981' }}>
                <p style={{ color: '#0f172a', fontWeight: 500, fontSize: '0.95rem', marginBottom: '0.5rem' }}>{o.orderText}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b' }}>
                  <span>Trạng thái: {o.status}</span>
                  <span>{new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(o.createdAt))}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Cột phải: Trạng thái & Hành động */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <h3 style={{ color: '#0f172a', fontWeight: 600, marginBottom: '1rem' }}>Trạng thái điều trị</h3>
          
          <div style={{ marginBottom: '1rem' }}>
            <span style={{ display: 'block', color: '#64748b', fontSize: '0.8rem', marginBottom: '4px' }}>Tình trạng</span>
            <span style={{ background: record.status === 'ADMITTED' ? '#d1fae5' : '#f1f5f9', color: record.status === 'ADMITTED' ? '#059669' : '#64748b', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700 }}>
              {record.status === 'ADMITTED' ? 'Đang điều trị nội trú' : 'Đã xuất viện'}
            </span>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <span style={{ display: 'block', color: '#64748b', fontSize: '0.8rem', marginBottom: '4px' }}>Nhập viện ngày</span>
            <span style={{ color: '#0f172a', fontWeight: 600 }}>{new Intl.DateTimeFormat('vi-VN').format(new Date(record.admissionDate))}</span>
          </div>

          {record.status === 'ADMITTED' && (
            <button onClick={handleDischarge} style={{ width: '100%', background: '#ef4444', color: 'white', border: 'none', padding: '0.875rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', display: 'flex', justifyContent: 'center', gap: '8px' }}>
              <span>👋</span> Ra chỉ định Xuất viện
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
