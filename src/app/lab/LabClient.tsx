'use client';
import { useState } from 'react';
import { submitLabResult } from '@/actions/labActions';

export default function LabClient({ pendingOrders, recentOrders }: { pendingOrders: any[], recentOrders: any[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [results, setResults] = useState<{ [key: string]: string }>({});

  const handleResultChange = (id: string, val: string) => {
    setResults(prev => ({ ...prev, [id]: val }));
  };

  const handleSubmit = async (orderId: string) => {
    const resValue = results[orderId];
    if (!resValue || resValue.trim() === '') {
      return alert('Vui lòng nhập kết quả trước khi trả!');
    }
    setLoadingId(orderId);
    try {
      const res = await submitLabResult(orderId, resValue);
      if (res.error) alert(res.error);
      else {
        alert('Trả kết quả thành công!');
        setResults(prev => { const n = { ...prev }; delete n[orderId]; return n; });
      }
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem' }}>Y lệnh Xét nghiệm / Chẩn đoán hình ảnh</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Danh sách Y lệnh chờ */}
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ background: '#f0f9ff', padding: '1rem 1.5rem', borderBottom: '1px solid #bae6fd', display: 'flex', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0369a1', margin: 0 }}>🔬 Cần thực hiện ({pendingOrders.length})</h2>
          </div>
          <div style={{ padding: '1.5rem' }}>
            {pendingOrders.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>Không có y lệnh nào đang chờ.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {pendingOrders.map(o => (
                  <div key={o.id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', background: '#f8fafc' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{o.type}</div>
                        <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Bệnh nhân: <strong style={{ color: '#0ea5e9' }}>{o.appointment?.patient?.name ?? '—'}</strong></div>
                      </div>
                      <div style={{ textAlign: 'right', fontSize: '0.85rem', color: '#64748b' }}>
                        <div>Chỉ định bởi: <strong>BS. {o.appointment?.doctor?.user?.name ?? '—'}</strong></div>
                        <div>{new Date(o.createdAt).toLocaleString('vi-VN')}</div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>KẾT QUẢ / KẾT LUẬN:</label>
                      <textarea 
                        value={results[o.id] || ''}
                        onChange={(e) => handleResultChange(o.id, e.target.value)}
                        rows={3} 
                        placeholder="Nhập kết quả xét nghiệm (Ví dụ: Hồng cầu 4.5 T/L, hoặc Không có bất thường...)"
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
                      />
                      <button 
                        onClick={() => handleSubmit(o.id)}
                        disabled={loadingId === o.id}
                        style={{ alignSelf: 'flex-end', marginTop: '0.5rem', padding: '0.75rem 1.5rem', background: '#0284c7', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: loadingId === o.id ? 'not-allowed' : 'pointer', boxShadow: '0 4px 6px rgba(2,132,199,0.2)' }}>
                        {loadingId === o.id ? 'Đang gửi...' : '✅ Trả kết quả về Phòng khám'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Lịch sử */}
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', height: 'fit-content' }}>
          <div style={{ background: '#f8fafc', padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#475569', margin: 0 }}>🕒 Đã trả kết quả gần đây</h2>
          </div>
          <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {recentOrders.map(o => (
              <div key={o.id} style={{ padding: '1rem', background: '#f1f5f9', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
                <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>{o.type}</div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>BN: {o.appointment?.patient?.name ?? 'Bệnh nhân chưa rõ'}</div>
                <div style={{ fontSize: '0.85rem', color: '#0f172a', background: 'white', padding: '0.5rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                  <strong>KQ:</strong> {o.result}
                </div>
              </div>
            ))}
            {recentOrders.length === 0 && <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>Chưa có dữ liệu</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
