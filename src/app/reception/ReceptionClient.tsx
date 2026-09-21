'use client';
import { useState } from 'react';
import { checkInAppointment } from '@/actions/receptionActions';

export default function ReceptionClient({ appointments }: { appointments: any[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const pendingList = appointments.filter(a => a.status === 'PENDING').sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const checkedInList = appointments.filter(a => a.status !== 'PENDING').sort((b, a) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());

  const handleCheckIn = async (appointmentId: string, patientName: string) => {
    if (!confirm(`Xác nhận Check-in cho bệnh nhân: ${patientName}?`)) return;
    setLoadingId(appointmentId);
    try {
      const res = await checkInAppointment(appointmentId);
      if (res.error) alert(res.error);
      else {
        // Mở popup in số thứ tự
        const printWindow = window.open('', '_blank', 'width=400,height=600');
        if (printWindow) {
          printWindow.document.write(`
            <html><head><title>Số thứ tự</title></head>
            <body style="font-family: sans-serif; text-align: center; padding: 20px;">
              <h3 style="margin: 0; font-size: 14px;">BỆNH VIỆN ĐA KHOA HƯNG LỢI</h3>
              <h2 style="margin: 10px 0; font-size: 20px;">PHIẾU SỐ THỨ TỰ KHÁM BỆNH</h2>
              <div style="font-size: 60px; font-weight: bold; margin: 20px 0;">${res.queueNumber}</div>
              <p><strong>Bệnh nhân:</strong> ${patientName}</p>
              <p>Vui lòng chờ gọi số tại khu vực phòng khám.</p>
              <hr style="margin: 20px 0;" />
              <p style="font-size: 12px;">Ngày in: ${new Date().toLocaleString('vi-VN')}</p>
              <script>setTimeout(() => window.print(), 1000);</script>
            </body></html>
          `);
          printWindow.document.close();
        }
      }
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem' }}>Bệnh nhân chờ Check-in (Hôm nay)</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Danh sách chờ Checkin */}
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ background: '#fdf4ff', padding: '1rem 1.5rem', borderBottom: '1px solid #fbcfe8', display: 'flex', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#86198f', margin: 0 }}>📋 Danh sách đặt lịch mới ({pendingList.length})</h2>
          </div>
          <div style={{ padding: '1rem' }}>
            {pendingList.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>Không có lịch hẹn nào đang chờ.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '0.85rem' }}>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>GIỜ HẸN</th>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>BỆNH NHÂN</th>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>BÁC SĨ / KHOA</th>
                    <th style={{ padding: '1rem', textAlign: 'right' }}>THAO TÁC</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingList.map(a => (
                    <tr key={a.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '1rem', fontWeight: 600, color: '#0f172a' }}>
                        {new Date(a.date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{a.patient.name}</div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>📞 {a.patient.phone || 'N/A'}</div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>BS. {a.doctor.user.name}</div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{a.doctor.department?.name || 'Phòng khám'}</div>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <button 
                          onClick={() => handleCheckIn(a.id, a.patient.name)}
                          disabled={loadingId === a.id}
                          style={{ padding: '0.5rem 1rem', background: '#c026d3', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: loadingId === a.id ? 'not-allowed' : 'pointer' }}>
                          {loadingId === a.id ? 'Đang cấp số...' : '✅ Check-in & In số'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Lịch sử Checkin */}
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', height: 'fit-content' }}>
          <div style={{ background: '#f8fafc', padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#475569', margin: 0 }}>🕒 Đã tiếp đón gần đây</h2>
          </div>
          <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {checkedInList.slice(0, 10).map(a => (
              <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#f1f5f9', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{a.patient.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>BS. {a.doctor.user.name}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>ĐÃ NHẬN SỐ</span>
                  <div style={{ background: '#10b981', color: '#0f172a', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                    {a.queueNumber}
                  </div>
                </div>
              </div>
            ))}
            {checkedInList.length === 0 && <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>Chưa có dữ liệu</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
