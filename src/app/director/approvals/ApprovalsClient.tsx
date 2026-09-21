'use client';

import { useState } from 'react';

type OrderType = 'SURGERY' | 'MEDICAL';

interface OrderItem {
  id: string;
  type: OrderType;
  title: string;
  description: string;
  patientName: string;
  doctorName: string;
  date: string;
  status: string;
}

interface ApprovalsClientProps {
  pendingSurgeries: OrderItem[];
  pendingMedicals: OrderItem[];
}

export default function ApprovalsClient({ pendingSurgeries, pendingMedicals }: ApprovalsClientProps) {
  const [activeTab, setActiveTab] = useState<OrderType>('SURGERY');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  
  // Local state to remove approved items immediately from UI
  const [surgeries, setSurgeries] = useState(pendingSurgeries);
  const [medicals, setMedicals] = useState(pendingMedicals);

  const handleAction = async (id: string, type: OrderType, action: 'APPROVE' | 'REJECT') => {
    if (!confirm(`Bạn có chắc chắn muốn ${action === 'APPROVE' ? 'PHÊ DUYỆT' : 'TỪ CHỐI'} lệnh này?`)) return;
    
    setLoadingId(id);
    try {
      const res = await fetch('/api/director/approvals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, type, action })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Có lỗi xảy ra');
      
      alert(`Đã ${action === 'APPROVE' ? 'phê duyệt' : 'từ chối'} thành công!`);
      
      if (type === 'SURGERY') {
        setSurgeries(prev => prev.filter(item => item.id !== id));
      } else {
        setMedicals(prev => prev.filter(item => item.id !== id));
      }
      
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoadingId(null);
    }
  };

  const currentList = activeTab === 'SURGERY' ? surgeries : medicals;

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>Ký duyệt Y lệnh</h1>
          <p style={{ color: '#64748b', marginTop: '0.25rem' }}>Phê duyệt các Lệnh phẫu thuật và Y lệnh nội trú đặc biệt.</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
        <button 
          onClick={() => setActiveTab('SURGERY')}
          style={{ 
            padding: '0.75rem 1.5rem', 
            borderRadius: '8px', 
            border: 'none', 
            fontWeight: 700, 
            cursor: 'pointer',
            background: activeTab === 'SURGERY' ? '#ef4444' : '#f1f5f9',
            color: activeTab === 'SURGERY' ? 'white' : '#64748b',
            transition: '0.2s'
          }}
        >
          Lệnh Phẫu Thuật ({surgeries.length})
        </button>
        <button 
          onClick={() => setActiveTab('MEDICAL')}
          style={{ 
            padding: '0.75rem 1.5rem', 
            borderRadius: '8px', 
            border: 'none', 
            fontWeight: 700, 
            cursor: 'pointer',
            background: activeTab === 'MEDICAL' ? '#3b82f6' : '#f1f5f9',
            color: activeTab === 'MEDICAL' ? 'white' : '#64748b',
            transition: '0.2s'
          }}
        >
          Y lệnh Nội trú ({medicals.length})
        </button>
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {currentList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '16px', border: '1px dashed #cbd5e1', color: '#94a3b8' }}>
            <span style={{ fontSize: '2rem', display: 'block', marginBottom: '1rem' }}>✅</span>
            <p style={{ fontWeight: 600 }}>Không có lệnh nào đang chờ duyệt.</p>
          </div>
        ) : (
          currentList.map(item => (
            <div key={item.id} style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <span style={{ padding: '0.25rem 0.75rem', background: '#fef3c7', color: '#d97706', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700 }}>
                    CHỜ DUYỆT
                  </span>
                  <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>{item.date}</span>
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
                  {item.title}
                </h3>
                <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '0.75rem', maxWidth: '600px' }}>
                  {item.description}
                </p>
                <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: '#64748b' }}>
                  <p>👤 <b>Bệnh nhân:</b> {item.patientName}</p>
                  <p>👨‍⚕️ <b>Bác sĩ chỉ định:</b> {item.doctorName}</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button 
                  onClick={() => handleAction(item.id, item.type, 'REJECT')}
                  disabled={loadingId === item.id}
                  style={{ padding: '0.75rem 1.5rem', background: '#f1f5f9', color: '#ef4444', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Từ chối
                </button>
                <button 
                  onClick={() => handleAction(item.id, item.type, 'APPROVE')}
                  disabled={loadingId === item.id}
                  style={{ padding: '0.75rem 1.5rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                >
                  {loadingId === item.id ? 'Đang xử lý...' : 'Phê duyệt'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
