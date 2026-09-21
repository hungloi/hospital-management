'use client';

import { useEffect, useState } from 'react';

type InpatientRecord = {
  id: string;
  status: string;
  reason: string;
  notes?: string | null;
  admissionDate: string;
  dischargeDate?: string | null;
  patient: { id: string; name: string | null; email: string | null };
  doctor: { user: { name: string | null } };
  roomBed?: { bedNumber: string; room: { name: string; type: string } } | null;
  medicalOrders: Array<{ id: string; orderText: string; status: string }>;
};

const statusStyle: Record<string, { background: string; color: string }> = {
  ADMITTED: { background: '#1d4ed8', color: '#dbeafe' },
  DISCHARGED: { background: '#15803d', color: '#dcfce7' },
  TRANSFERRED: { background: '#b45309', color: '#92400e' },
};

export function InpatientClient() {
  const [records, setRecords] = useState<InpatientRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/inpatient', { cache: 'no-store' });
      if (!res.ok) throw new Error('Không thể tải dữ liệu nội trú');
      const data = (await res.json()) as InpatientRecord[];
      setRecords(data);
    } catch (e: any) {
      setError(e?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDischarge = async (recordId: string) => {
    try {
      setError('');
      const res = await fetch('/api/admin/inpatient/discharge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inpatientId: recordId }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error || 'Không thể xuất viện');
      }
      await fetchData();
    } catch (e: any) {
      setError(e?.message || 'Không thể xuất viện');
    }
  };

  const admitted = records.filter((r) => r.status === 'ADMITTED').length;
  const discharged = records.filter((r) => r.status === 'DISCHARGED').length;

  return (
    <div style={{ display: 'grid', gap: '1.25rem', color: '#0f172a' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1rem 1.25rem', boxShadow: '0 1px 2px rgba(15,23,42,0.05)' }}>
          <div style={{ color: '#64748b', fontSize: '0.92rem' }}>Tổng số hồ sơ</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '0.35rem' }}>{records.length}</div>
        </div>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1rem 1.25rem', boxShadow: '0 1px 2px rgba(15,23,42,0.05)' }}>
          <div style={{ color: '#64748b', fontSize: '0.92rem' }}>Đang điều trị</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '0.35rem' }}>{admitted}</div>
        </div>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1rem 1.25rem', boxShadow: '0 1px 2px rgba(15,23,42,0.05)' }}>
          <div style={{ color: '#64748b', fontSize: '0.92rem' }}>Đã xuất viện</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '0.35rem' }}>{discharged}</div>
        </div>
      </div>

      {error ? (
        <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid #fecaca' }}>{error}</div>
      ) : null}

      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1rem', boxShadow: '0 1px 2px rgba(15,23,42,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700 }}>Danh sách nội trú</div>
            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Theo dõi bệnh nhân nhập viện, giường bệnh và y lệnh.</div>
          </div>
        </div>

        {loading ? (
          <div style={{ color: '#64748b' }}>Đang tải dữ liệu...</div>
        ) : records.length === 0 ? (
          <div style={{ color: '#64748b' }}>Chưa có hồ sơ nội trú nào.</div>
        ) : (
          <div style={{ display: 'grid', gap: '0.9rem' }}>
            {records.map((record) => {
              const badge = statusStyle[record.status] || { background: '#e2e8f0', color: '#0f172a' };
              return (
                <div key={record.id} style={{ border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1rem', background: '#ffffff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1rem' }}>{record.patient?.name || record.patient?.email || 'Bệnh nhân'}</div>
                      <div style={{ color: '#64748b', fontSize: '0.92rem', marginTop: '0.2rem' }}>{record.reason}</div>
                    </div>
                    <span style={{ padding: '0.35rem 0.7rem', borderRadius: '999px', background: badge.background, color: badge.color, fontSize: '0.8rem', fontWeight: 700 }}>
                      {record.status === 'ADMITTED' ? 'Đang điều trị' : record.status === 'DISCHARGED' ? 'Đã xuất viện' : record.status}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginTop: '0.85rem' }}>
                    <div>
                      <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Bác sĩ</div>
                      <div style={{ fontWeight: 600 }}>{record.doctor?.user?.name || 'Chưa phân công'}</div>
                    </div>
                    <div>
                      <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Giường</div>
                      <div style={{ fontWeight: 600 }}>{record.roomBed ? `${record.roomBed.room.name} - ${record.roomBed.bedNumber}` : 'Chưa có giường'}</div>
                    </div>
                    <div>
                      <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Ngày nhập viện</div>
                      <div style={{ fontWeight: 600 }}>{new Date(record.admissionDate).toLocaleDateString('vi-VN')}</div>
                    </div>
                    <div>
                      <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Ngày xuất viện</div>
                      <div style={{ fontWeight: 600 }}>{record.dischargeDate ? new Date(record.dischargeDate).toLocaleDateString('vi-VN') : '—'}</div>
                    </div>
                  </div>

                  {record.notes ? <div style={{ marginTop: '0.75rem', color: '#475569' }}>{record.notes}</div> : null}

                  {record.medicalOrders.length > 0 ? (
                    <div style={{ marginTop: '0.85rem' }}>
                      <div style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Y lệnh gần nhất</div>
                      <ul style={{ paddingLeft: '1rem', margin: 0, color: '#0f172a' }}>
                        {record.medicalOrders.map((order) => (
                          <li key={order.id} style={{ marginBottom: '0.2rem' }}>{order.orderText}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {record.status === 'ADMITTED' ? (
                    <div style={{ marginTop: '0.9rem', display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => handleDischarge(record.id)}
                        style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.65rem 0.95rem', cursor: 'pointer' }}
                      >
                        Đánh dấu xuất viện
                      </button>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
