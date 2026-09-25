import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import PrintClient from '@/app/print/PrintClient';

export default async function InvoicePrintPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      items: true,
      appointment: { include: { patient: true } },
      clinicAppointment: { include: { patient: true } },
      inpatientRecord: { include: { patient: true, doctor: { include: { department: true } } } },
    },
  });

  if (!invoice) notFound();

  // Xác định thông tin người bệnh và khoa (tùy vào nguồn của invoice)
  let patient;
  let contextName = '';
  let contextId = '';

  if (invoice.appointment) {
    patient = invoice.appointment.patient;
    contextName = 'Khám bệnh ngoại trú';
    contextId = invoice.appointment.id;
  } else if (invoice.clinicAppointment) {
    patient = invoice.clinicAppointment.patient;
    contextName = 'Khám bệnh phòng khám';
    contextId = invoice.clinicAppointment.id;
  } else if (invoice.inpatientRecord) {
    patient = invoice.inpatientRecord.patient;
    contextName = `Điều trị nội trú - ${invoice.inpatientRecord.doctor.department?.name || 'Khoa'}`;
    contextId = invoice.inpatientRecord.id;
  }

  if (!patient) notFound();

  const printDate = new Date();
  const fmtDate = (d: Date) =>
    `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} – ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;

  // BHYT giả lập (tuỳ chọn)
  const bhytRate = 0; // Chưa kết nối BHYT thực tế
  const bhytAmount = invoice.total * bhytRate;
  const patientPay = invoice.finalTotal;

  // Render dạng Bảng kê kiêm Phiếu thu A4 (tương tự mẫu HIS-10)
  return (
    <PrintClient>
      <article className="sheet a4">
        <div className="hdr">
          <div className="org">
            <div>SỞ Y TẾ</div>
            <b>BỆNH VIỆN ĐA KHOA HƯNG LỢI</b>
            <div className="ln"></div>
            <div className="small" style={{ marginTop: '4px' }}>Phòng Tài chính kế toán</div>
          </div>
          <div className="meta">
            <div>Mẫu: <b>HIS-10</b></div>
            <div>Số: <span className="d">QT-{invoice.invoiceNo}</span></div>
            <svg className="bc" preserveAspectRatio="none" viewBox="0 0 100 30">
              {[0, 5, 12, 18, 25, 30, 42, 50, 58, 65, 75, 85, 92].map((x, i) => (
                <rect key={i} x={x} y="0" width={i % 3 === 0 ? 4 : i % 2 === 0 ? 2 : 6} height="30" fill="#111" />
              ))}
            </svg>
          </div>
        </div>

        <div className="title">BẢNG KÊ CHI PHÍ KIÊM PHIẾU THU</div>
        <div className="sub">
          {contextName} &nbsp;|&nbsp; Ngày in: {fmtDate(printDate)}
        </div>

        <div className="row">
          <span>Họ và tên:</span>
          <span className="d" style={{ flex: 2 }}>{patient.name.toUpperCase()}</span>
          <span>Mã BN:</span>
          <span className="d">{patient.id.substring(0, 8).toUpperCase()}</span>
          <span>Giới:</span>
          <span className="d">{patient.gender === 'MALE' ? 'Nam' : 'Nữ'}</span>
        </div>
        <div className="row">
          <span>Mã hồ sơ/lượt:</span>
          <span className="d">{contextId.substring(0, 8).toUpperCase()}</span>
          <span>Thẻ BHYT:</span>
          <span className="d" style={{ flex: 2 }}>— Không có —</span>
        </div>

        <table className="tb sm13" style={{ marginTop: '15px' }}>
          <thead>
            <tr>
              <th style={{ width: '36px' }}>STT</th>
              <th>Nội dung</th>
              <th style={{ width: '50px' }}>SL</th>
              <th style={{ width: '90px' }}>Đơn giá (đ)</th>
              <th style={{ width: '100px' }}>Thành tiền (đ)</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, idx) => {
              const amount = item.amount * item.quantity;
              return (
                <tr key={item.id}>
                  <td className="c">{idx + 1}</td>
                  <td>{item.description}</td>
                  <td className="c">{item.quantity}</td>
                  <td className="r">{item.amount.toLocaleString('vi-VN')}</td>
                  <td className="r">{amount.toLocaleString('vi-VN')}</td>
                </tr>
              );
            })}
            <tr className="gr">
              <td colSpan={4} className="r">Tổng cộng chi phí</td>
              <td className="r">{invoice.total.toLocaleString('vi-VN')}</td>
            </tr>
            {invoice.discount > 0 && (
              <tr>
                <td colSpan={4} className="r">Giảm giá</td>
                <td className="r">-{invoice.discount.toLocaleString('vi-VN')}</td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="sum" style={{ marginTop: '15px', width: '50%' }}>
          <div>
            <span>Tổng chi phí:</span>
            <span>{invoice.total.toLocaleString('vi-VN')} đ</span>
          </div>
          <div>
            <span>Quỹ BHYT chi trả:</span>
            <span>{bhytAmount.toLocaleString('vi-VN')} đ</span>
          </div>
          <div className="tot">
            <span>Người bệnh thanh toán:</span>
            <span>{patientPay.toLocaleString('vi-VN')} đ</span>
          </div>
        </div>

        <div className="row" style={{ marginTop: '10px' }}>
          <span>Trạng thái thu tiền:</span>
          <span className="d">
            {invoice.status === 'PAID'
              ? <span className="ok">✓ Đã thanh toán</span>
              : invoice.status === 'PENDING'
              ? <span className="wait">⏳ Chờ thanh toán</span>
              : <span className="flag">✕ {invoice.status}</span>}
          </span>
        </div>
        <div className="small" style={{ marginTop: '5px' }}>
          Đơn vị tính: đồng. Bảng kê này kiêm phiếu thu tiền mặt hoặc xác nhận chuyển khoản hợp lệ.
        </div>

        <div className="sigs" style={{ marginTop: '40px' }}>
          <div>
            <div className="role">Người nộp tiền</div>
            <div className="hint">(Ký, ghi rõ họ tên)</div>
          </div>
          <div>
            <div className="it">
              Ngày <span className="d">{printDate.getDate()}</span> tháng{' '}
              <span className="d">{printDate.getMonth() + 1}</span> năm{' '}
              <span className="d">{printDate.getFullYear()}</span>
            </div>
            <div className="role">Thu ngân</div>
            <div className="hint">(Ký, ghi rõ họ tên)</div>
            <div style={{ height: '60px' }}></div>
            <div><strong>{session.user.name}</strong></div>
          </div>
        </div>
      </article>
    </PrintClient>
  );
}
