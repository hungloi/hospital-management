'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { dispensePrescription } from '@/actions/pharmacyActions';

export default function PharmacyClient({ pending, recent, inventory, inventoryAlerts }: { pending: any[], recent: any[], inventory: any[], inventoryAlerts: any[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const alertMap = new Map<string, string[]>();
  inventoryAlerts.forEach((alert: any) => {
    const existing = alertMap.get(alert.medicineId) || [];
    existing.push(alert.message);
    alertMap.set(alert.medicineId, existing);
  });

  const handleDispense = async (prescriptionId: string, patientName: string) => {
    if (!confirm(`Xác nhận phát thuốc cho bệnh nhân: ${patientName}? Số lượng trong kho sẽ bị trừ tự động.`)) return;
    setLoadingId(prescriptionId);
    try {
      const res = await dispensePrescription(prescriptionId);
      if (res.error) alert(res.error);
      else {
        alert('Phát thuốc và trừ kho thành công!');
        router.refresh();
      }
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem' }}>Quầy Phát Thuốc & Quản lý Kho</h1>
      
      {inventoryAlerts.length > 0 && (
        <div style={{ marginBottom: '1.5rem', background: '#fff7ed', border: '1px solid #fdba74', borderRadius: '12px', padding: '1rem 1.25rem' }}>
          <div style={{ fontWeight: 800, color: '#9a2c00', marginBottom: '0.5rem' }}>⚠️ Cảnh báo kho thuốc</div>
          <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#7c2d12' }}>
            {inventoryAlerts.map((alert: any, idx: number) => (
              <li key={`${alert.medicineId}-${idx}`}>{alert.medicineName}: {alert.message}</li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Danh sách chờ */}
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div style={{ background: '#f0fdf4', padding: '1rem 1.5rem', borderBottom: '1px solid #bbf7d0', display: 'flex', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#15803d', margin: 0 }}>💊 Đơn thuốc chờ phát ({pending.length})</h2>
            </div>
            <div style={{ padding: '1.5rem' }}>
              {pending.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>Không có đơn thuốc nào đang chờ.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {pending.map(p => (
                    <div key={p.id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                      <div style={{ background: '#f8fafc', padding: '1rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontWeight: 800, color: '#0f172a' }}>{p.appointment?.patient?.name ?? 'Bệnh nhân chưa rõ'}</div>
                          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>BS Kê đơn: {p.appointment?.doctor?.user?.name ?? 'Bác sĩ chưa rõ'}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <button 
                            onClick={() => handleDispense(p.id, p.appointment?.patient?.name ?? 'Bệnh nhân chưa rõ')}
                            disabled={loadingId === p.id}
                            style={{ padding: '0.5rem 1rem', background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: loadingId === p.id ? 'not-allowed' : 'pointer' }}>
                            {loadingId === p.id ? 'Đang xuất kho...' : '✅ Phát thuốc'}
                          </button>
                        </div>
                      </div>
                      <div style={{ padding: '1rem', background: 'white' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.8rem', textAlign: 'left' }}>
                              <th style={{ paddingBottom: '0.5rem' }}>TÊN THUỐC</th>
                              <th style={{ paddingBottom: '0.5rem' }}>LIỀU DÙNG</th>
                              <th style={{ paddingBottom: '0.5rem' }}>SỐ NGÀY</th>
                            </tr>
                          </thead>
                          <tbody>
                            {p.items.map((item: any) => (
                              <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '0.75rem 0', fontWeight: 600, color: '#0f172a' }}>{item.medicine.name}</td>
                                <td style={{ padding: '0.75rem 0', color: '#475569' }}>{item.dosage}</td>
                                <td style={{ padding: '0.75rem 0', color: '#475569' }}>{item.duration}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Tồn kho */}
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div style={{ background: '#f8fafc', padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#475569', margin: 0 }}>📦 Danh sách Vật tư - Tồn kho</h2>
            </div>
            <div style={{ padding: '1rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.8rem', textAlign: 'left' }}>
                    <th style={{ padding: '0.5rem' }}>TÊN VẬT TƯ</th>
                    <th style={{ padding: '0.5rem' }}>ĐVT</th>
                    <th style={{ padding: '0.5rem', textAlign: 'right' }}>TỒN KHO</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map(med => {
                    const warnings = alertMap.get(med.id) || [];
                    const isWarning = warnings.length > 0;
                    return (
                      <tr key={med.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600, color: '#0f172a' }}>
                          {med.name}
                          {isWarning && <div style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.2rem' }}>{warnings.join(' • ')}</div>}
                        </td>
                        <td style={{ padding: '0.75rem 0.5rem', color: '#475569' }}>{med.unit}</td>
                        <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontWeight: 700, color: isWarning ? '#ef4444' : med.inventory < 20 ? '#ef4444' : '#10b981' }}>
                          {med.inventory}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Lịch sử */}
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', height: 'fit-content' }}>
          <div style={{ background: '#f8fafc', padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#475569', margin: 0 }}>🕒 Đã phát gần đây</h2>
          </div>
          <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {recent.map(p => (
              <div key={p.id} style={{ padding: '1rem', background: '#f0fdf4', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
                <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>{p.appointment?.patient?.name ?? 'Bệnh nhân chưa rõ'}</div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>{p.items.length} loại thuốc</div>
                <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>✅ Đã phát ({new Date(p.updatedAt).toLocaleTimeString('vi-VN')})</div>
              </div>
            ))}
            {recent.length === 0 && <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>Chưa có dữ liệu</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
