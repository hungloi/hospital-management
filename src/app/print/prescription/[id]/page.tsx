import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import PrintClient from '@/app/print/PrintClient';

export default async function PrescriptionPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const { id } = await params;
  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: {
      patient: true,
      doctor: { include: { user: true, department: true } },
      prescription: { include: { items: { include: { medicine: true } } } }
    }
  });

  if (!appointment) notFound();

  // Tính tuổi
  const age = appointment.patient.dob 
    ? Math.floor((Date.now() - new Date(appointment.patient.dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25)) 
    : '—';
  
  const apptDate = new Date(appointment.date);
  const prescriptionId = appointment.prescription?.id || '—';

  return (
    <PrintClient>
      <article className="sheet a4">
        <div className="hdr">
          <div className="org">
            <div>SỞ Y TẾ</div>
            <b>BỆNH VIỆN ĐA KHOA HƯNG LỢI</b>
            <div className="ln"></div>
            <div className="small" style={{ marginTop: '4px' }}>Khoa Khám bệnh – {appointment.doctor.department?.name || 'Phòng khám'}</div>
          </div>
          <div className="meta">
            <div>Mẫu: <b>HIS-05</b></div>
            <div>Mã BN: <span className="d">{appointment.patient.id.substring(0, 8).toUpperCase()}</span></div>
            {/* Fake barcode block */}
            <svg className="bc" preserveAspectRatio="none" viewBox="0 0 100 30">
              <rect x="0" y="0" width="2" height="30" fill="#111" />
              <rect x="4" y="0" width="4" height="30" fill="#111" />
              <rect x="12" y="0" width="2" height="30" fill="#111" />
              <rect x="18" y="0" width="6" height="30" fill="#111" />
              <rect x="28" y="0" width="2" height="30" fill="#111" />
              <rect x="34" y="0" width="10" height="30" fill="#111" />
              <rect x="48" y="0" width="4" height="30" fill="#111" />
              <rect x="56" y="0" width="2" height="30" fill="#111" />
              <rect x="62" y="0" width="8" height="30" fill="#111" />
              <rect x="74" y="0" width="2" height="30" fill="#111" />
              <rect x="80" y="0" width="6" height="30" fill="#111" />
              <rect x="90" y="0" width="4" height="30" fill="#111" />
              <rect x="98" y="0" width="2" height="30" fill="#111" />
            </svg>
          </div>
        </div>

        <div className="title">ĐƠN THUỐC</div>
        <div className="sub">Ngoại trú – Thanh toán BHYT &nbsp; Số đơn: <span className="d">DT-{prescriptionId.substring(0, 8).toUpperCase()}</span></div>

        <div className="row">
          <span>Họ và tên:</span><span className="d" style={{ flex: 2 }}>{appointment.patient.name.toUpperCase()}</span>
          <span>Giới:</span><span className="d">{appointment.patient.gender === 'MALE' ? 'Nam' : 'Nữ'}</span>
          <span>Tuổi:</span><span className="d">{age}</span>
          <span>Cân nặng:</span><span className="d">— kg</span>
        </div>
        <div className="row">
          <span>Địa chỉ:</span><span className="d">{appointment.patient.address || 'Chưa cập nhật'}</span>
        </div>
        <div className="row">
          <span>Thẻ BHYT số:</span><span className="d">—</span>
          <span>Điện thoại:</span><span className="d">{appointment.patient.phone || '—'}</span>
        </div>
        <div className="row">
          <span>Chẩn đoán:</span><span className="d">{appointment.diagnosis || 'Chưa có kết luận'}</span>
        </div>

        <table className="tb" style={{ marginTop: '10px' }}>
          <thead>
            <tr>
              <th style={{ width: '36px' }}>STT</th>
              <th>Tên thuốc, hàm lượng, cách dùng</th>
              <th style={{ width: '60px' }}>ĐVT</th>
              <th style={{ width: '80px' }}>Số lượng</th>
            </tr>
          </thead>
          <tbody>
            {appointment.prescription?.items.map((item, index) => (
              <tr key={item.id}>
                <td className="c">{index + 1}</td>
                <td>
                  <b className="d" style={{ border: 0 }}>{(item as any).medicine?.name || 'Unknown'}</b><br />
                  <span className="d" style={{ fontWeight: 400, border: 0 }}>{item.dosage}, {item.instructions} ({item.duration} ngày)</span>
                </td>
                <td className="c">Viên</td>
                <td className="c d" style={{ border: '1px solid #444' }}>
                  {/* Tính tạm số lượng dựa vào liều và ngày (chỉ mô phỏng) */}
                  {parseInt(item.duration) > 0 ? (parseInt(item.duration) * parseInt(item.dosage.match(/\d+/)?.[0] || '1')) : 1}
                </td>
              </tr>
            ))}
            {(!appointment.prescription || appointment.prescription.items.length === 0) && (
              <tr>
                <td colSpan={4} className="c">Không có thuốc</td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="row">
          <span>Cộng khoản:</span><span className="d" style={{ flex: '0 0 40px', textAlign: 'center' }}>{appointment.prescription?.items.length || 0}</span>
          <span>Số ngày dùng:</span><span className="d" style={{ flex: '0 0 90px', textAlign: 'center' }}>—</span>
        </div>
        
        <div className="row">
          <span>Lời dặn:</span><span className="d">Uống thuốc theo đơn. Đến ngay bệnh viện nếu có biểu hiện bất thường.</span>
        </div>
        <div className="row">
          <span>Tái khám:</span><span className="d">Sau khi hết thuốc hoặc khi có dấu hiệu bất thường.</span>
        </div>

        <div className="sigs" style={{ alignItems: 'flex-end', marginTop: '30px' }}>
          <div style={{ textAlign: 'left' }}>
            {/* Fake QR */}
            <svg className="qr" viewBox="-1 -1 27 27" style={{ shapeRendering: 'crispEdges' }}>
              <rect x="-1" y="-1" width="27" height="27" fill="#fff" />
              <path d="M0 0h1v1h-1zM24 0h1v1h-1zM0 24h1v1h-1z" fill="#111" />
            </svg>
            <div className="small">Mã đơn thuốc điện tử:<br /><b className="d">DT-{prescriptionId.substring(0, 8).toUpperCase()}</b></div>
          </div>
          <div>
            <div className="it">Ngày <span className="d">{apptDate.getDate()}</span> tháng <span className="d">{apptDate.getMonth() + 1}</span> năm <span className="d">{apptDate.getFullYear()}</span></div>
            <div className="role">Bác sĩ kê đơn</div>
            <div className="hint">(Ký, ghi rõ họ tên)</div>
            <div style={{ height: '80px' }}></div>
            <div><strong>{appointment.doctor.user.name}</strong></div>
          </div>
        </div>
      </article>
    </PrintClient>
  );
}
