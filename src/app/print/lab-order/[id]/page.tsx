import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import PrintClient from '@/app/print/PrintClient';

export default async function LabOrderPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const { id } = await params;
  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: {
      patient: true,
      doctor: { include: { user: true, department: true } },
      labOrders: true,
    },
  });

  if (!appointment) notFound();

  const age = appointment.patient.dob
    ? Math.floor((Date.now() - new Date(appointment.patient.dob).getTime()) / (365.25 * 24 * 3600 * 1000))
    : '—';

  const apptDate = new Date(appointment.date);
  const fmt = (d: Date) =>
    `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')} ngày ${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;

  const totalPrice = appointment.labOrders.reduce((s, o) => s + (o.price ?? 0), 0);

  return (
    <PrintClient>
      <article className="sheet a4">
        <div className="hdr">
          <div className="org">
            <div>SỞ Y TẾ</div>
            <b>BỆNH VIỆN ĐA KHOA HƯNG LỢI</b>
            <div className="ln"></div>
            <div className="small" style={{ marginTop: '4px' }}>
              {appointment.doctor.department?.name || 'Khoa Khám bệnh'}
            </div>
          </div>
          <div className="meta">
            <div>Mẫu: <b>HIS-03</b></div>
            <div>Số phiếu: <span className="d">CD-{id.substring(0,8).toUpperCase()}</span></div>
            <svg className="bc" preserveAspectRatio="none" viewBox="0 0 100 30">
              {[0,4,12,18,28,34,48,56,62,74,80,90,98].map((x,i) => (
                <rect key={i} x={x} y="0" width={i%3===0?4:i%2===0?6:2} height="30" fill="#111" />
              ))}
            </svg>
          </div>
        </div>

        <div className="title">PHIẾU CHỈ ĐỊNH XÉT NGHIỆM</div>
        <div className="sub">
          Chỉ định lúc <span className="d">{fmt(apptDate)}</span>
        </div>

        <div className="row">
          <span>Họ và tên:</span>
          <span className="d" style={{ flex: 2 }}>{appointment.patient.name.toUpperCase()}</span>
          <span>Giới:</span>
          <span className="d">{appointment.patient.gender === 'MALE' ? 'Nam' : 'Nữ'}</span>
          <span>Tuổi:</span>
          <span className="d">{age}</span>
        </div>
        <div className="row">
          <span>Mã BN:</span>
          <span className="d">{id.substring(0,8).toUpperCase()}</span>
        </div>
        <div className="row">
          <span>Chẩn đoán:</span>
          <span className="d">{appointment.diagnosis || 'Đang chờ kết quả khám'}</span>
        </div>

        <table className="tb" style={{ marginTop: '10px' }}>
          <thead>
            <tr>
              <th style={{ width: '36px' }}>STT</th>
              <th>Dịch vụ chỉ định</th>
              <th style={{ width: '80px' }}>Ưu tiên</th>
              <th style={{ width: '110px' }}>Thành tiền (đ)</th>
              <th style={{ width: '110px' }}>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {appointment.labOrders.length === 0 ? (
              <tr><td colSpan={5} className="c">Chưa có chỉ định xét nghiệm</td></tr>
            ) : (
              appointment.labOrders.map((order, idx) => (
                <tr key={order.id}>
                  <td className="c">{idx + 1}</td>
                  <td className="d" style={{ border: '1px solid #444' }}>{order.type}</td>
                  <td className="c">Thường</td>
                  <td className="r">{(order.price ?? 0).toLocaleString('vi-VN')}</td>
                  <td className="c">
                    {order.status === 'DONE'
                      ? <span className="ok">✓ Hoàn thành</span>
                      : order.status === 'CANCELLED'
                      ? <span className="flag">✕ Đã huỷ</span>
                      : <span className="wait">⏳ Đang xử lý</span>}
                  </td>
                </tr>
              ))
            )}
            <tr>
              <td colSpan={3} className="r"><b>Tổng cộng</b></td>
              <td className="r"><b>{totalPrice.toLocaleString('vi-VN')}</b></td>
              <td></td>
            </tr>
          </tbody>
        </table>

        <div className="row" style={{ marginTop: '8px' }}>
          <span>Nơi thực hiện:</span>
          <span className="d">Khoa Xét nghiệm – Phòng lấy mẫu, tầng 1</span>
        </div>
        <div className="row">
          <span>Ghi chú:</span>
          <span className="d">Mang phiếu này hoặc quét mã vạch tại quầy lấy mẫu</span>
        </div>

        <div className="sigs">
          <div><div className="it">Mang phiếu đến quầy lấy mẫu xét nghiệm</div></div>
          <div>
            <div className="it">
              Ngày <span className="d">{apptDate.getDate()}</span> tháng{' '}
              <span className="d">{apptDate.getMonth()+1}</span> năm{' '}
              <span className="d">{apptDate.getFullYear()}</span>
            </div>
            <div className="role">Bác sĩ chỉ định</div>
            <div className="hint">(Ký, ghi rõ họ tên)</div>
            <div style={{ height: '60px' }}></div>
            <div><strong>{appointment.doctor.user.name}</strong></div>
          </div>
        </div>
      </article>
    </PrintClient>
  );
}
