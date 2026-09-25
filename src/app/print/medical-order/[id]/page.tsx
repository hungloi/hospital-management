import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import PrintClient from '@/app/print/PrintClient';

export default async function MedicalOrderPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const { id } = await params;
  const medicalOrder = await prisma.medicalOrder.findUnique({
    where: { id },
    include: {
      inpatientRecord: {
        include: {
          patient: true,
          roomBed: { include: { room: true } },
        }
      },
      doctor: { include: { user: true, department: true } },
    }
  });

  if (!medicalOrder || !medicalOrder.inpatientRecord) notFound();

  const record = medicalOrder.inpatientRecord;
  const patient = record.patient;
  const doctor = medicalOrder.doctor;
  
  const age = patient.dob
    ? Math.floor((Date.now() - new Date(patient.dob).getTime()) / (365.25 * 24 * 3600 * 1000))
    : '—';

  const orderDate = new Date(medicalOrder.createdAt);
  const admissionDate = new Date(record.admissionDate);
  const daysIn = Math.max(1, Math.ceil((orderDate.getTime() - admissionDate.getTime()) / (1000 * 3600 * 24)));

  return (
    <PrintClient>
      <article className="sheet a4">
        <div className="hdr">
          <div className="org">
            <div>SỞ Y TẾ</div>
            <b>BỆNH VIỆN ĐA KHOA HƯNG LỢI</b>
            <div className="ln"></div>
            <div className="small" style={{ marginTop: '4px' }}>Khoa <span className="d">{doctor.department?.name || 'Nội trú'}</span></div>
          </div>
          <div className="meta">
            <div>Mẫu: <b>HIS-06</b></div>
            <div>Số bệnh án: <span className="d">NT-{record.id.substring(0,8).toUpperCase()}</span></div>
            <svg className="bc" preserveAspectRatio="none" viewBox="0 0 100 30">
              {[0, 4, 10, 16, 26, 32, 42, 50, 56, 68, 76, 88].map((x, i) => (
                <rect key={i} x={x} y="0" width={i % 3 === 0 ? 3 : i % 2 === 0 ? 5 : 2} height="30" fill="#111" />
              ))}
            </svg>
          </div>
        </div>

        <div className="title">PHIẾU ĐIỀU TRỊ VÀ Y LỆNH</div>
        <div className="sub">
          Ngày <span className="d">{orderDate.toLocaleDateString('vi-VN')}</span> – 
          Ngày điều trị thứ <span className="d">{daysIn}</span>
        </div>

        <div className="row">
          <span>Họ và tên:</span>
          <span className="d" style={{ flex: 2 }}>{patient.name.toUpperCase()}</span>
          <span>Giới:</span>
          <span className="d">{patient.gender === 'MALE' ? 'Nam' : 'Nữ'}</span>
          <span>Tuổi:</span>
          <span className="d">{age}</span>
        </div>
        <div className="row">
          <span>Buồng:</span>
          <span className="d" style={{ flex: '0 0 100px' }}>{record.roomBed?.room.name || '—'}</span>
          <span>Giường:</span>
          <span className="d" style={{ flex: '0 0 80px' }}>{record.roomBed?.bedNumber || '—'}</span>
          <span>Mã BN:</span>
          <span className="d">{patient.id.substring(0,8).toUpperCase()}</span>
          <span>Vào viện:</span>
          <span className="d">{admissionDate.toLocaleDateString('vi-VN')}</span>
        </div>
        <div className="row">
          <span>Chẩn đoán:</span>
          <span className="d">{record.reason || 'Đang chẩn đoán'}</span>
        </div>

        <div className="sec">I. DIỄN BIẾN (bác sĩ ghi)</div>
        <div className="row">
          <span className="d" style={{ fontWeight: 400, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
            {medicalOrder.orderText.includes('Diễn biến:') 
              ? medicalOrder.orderText.split('Y lệnh:')[0].replace('Diễn biến:', '').trim()
              : 'Người bệnh ổn định, tiếp tục theo dõi sinh hiệu.'}
          </span>
        </div>

        <div className="sec">II. Y LỆNH VÀ THỰC HIỆN</div>
        <table className="tb sm13" style={{ marginTop: '10px' }}>
          <thead>
            <tr>
              <th style={{ width: '30px' }}>STT</th>
              <th>Nội dung y lệnh (Thuốc, Dịch vụ, Chăm sóc)</th>
              <th style={{ width: '120px' }}>Trạng thái</th>
              <th style={{ width: '150px' }}>Điều dưỡng thực hiện</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="c">1</td>
              <td className="d" style={{ border: '1px solid #444', whiteSpace: 'pre-wrap' }}>
                {medicalOrder.orderText.includes('Y lệnh:') 
                  ? medicalOrder.orderText.split('Y lệnh:')[1].trim() 
                  : medicalOrder.orderText}
              </td>
              <td className="c">
                {medicalOrder.status === 'DONE' ? <span className="ok">✓ Đã thực hiện</span> : <span className="wait">○ Chờ thực hiện</span>}
              </td>
              <td className="c sm">
                {medicalOrder.status === 'DONE' ? 'ĐD. Xác nhận hệ thống' : '—'}
              </td>
            </tr>
          </tbody>
        </table>

        <div className="small" style={{ marginTop: '5px' }}>
          ✓ đã thực hiện và ký xác nhận trên hệ thống (đúng người, đúng thuốc, đúng liều, đúng đường, đúng giờ). ○ chưa thực hiện.
        </div>

        <div className="sigs" style={{ marginTop: '40px' }}>
          <div>
            <div className="role">Điều dưỡng chăm sóc</div>
            <div className="hint">(Ký, ghi rõ họ tên)</div>
            <div style={{ height: '70px' }}></div>
          </div>
          <div>
            <div className="role">Bác sĩ điều trị</div>
            <div className="stamp">✓ Đã ký số<br/>{doctor.user.name}<br/>{orderDate.toLocaleString('vi-VN')}</div>
          </div>
        </div>
      </article>
    </PrintClient>
  );
}
