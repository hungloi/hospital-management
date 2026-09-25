import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import PrintClient from '../../PrintClient';

export default async function ExamFormPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const { id } = await params;
  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: {
      patient: true,
      doctor: { include: { user: true, department: true } },
    }
  });

  if (!appointment) notFound();

  // Tính tuổi
  const age = appointment.patient.dob 
    ? Math.floor((Date.now() - new Date(appointment.patient.dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25)) 
    : '—';
  
  const dobStr = appointment.patient.dob ? new Date(appointment.patient.dob).toLocaleDateString('vi-VN') : '—';
  const apptDate = new Date(appointment.date);

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
            <div>Mẫu: <b>HIS-02</b></div>
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

        <div className="title">PHIẾU KHÁM BỆNH</div>
        <div className="sub">Số phiếu: <span className="d">KB-{appointment.id.substring(0, 8).toUpperCase()}</span> &nbsp; Ngày khám: <span className="d">{apptDate.toLocaleDateString('vi-VN')}</span></div>

        <div className="sec">I. HÀNH CHÍNH</div>
        <div className="row">
          <span>Họ và tên:</span><span className="d" style={{ flex: 2 }}>{appointment.patient.name.toUpperCase()}</span>
          <span>Giới:</span><span className="d">{appointment.patient.gender === 'MALE' ? 'Nam' : 'Nữ'}</span>
          <span>Ngày sinh:</span><span className="d">{dobStr} ({age} tuổi)</span>
        </div>
        <div className="row">
          <span>Nghề nghiệp:</span><span className="d">Chưa cập nhật</span>
          <span>Dân tộc:</span><span className="d">Kinh</span>
          <span>Điện thoại:</span><span className="d">{appointment.patient.phone || '—'}</span>
        </div>
        <div className="row">
          <span>Địa chỉ:</span><span className="d">{appointment.patient.address || '—'}</span>
        </div>
        <div className="row">
          <span>Thẻ BHYT số:</span><span className="d" style={{ flex: 2 }}>—</span>
          <span>Giá trị đến:</span><span className="d">—</span>
        </div>

        <div className="sec">II. LÝ DO KHÁM VÀ BỆNH SỬ</div>
        <div className="row">
          <span>Lý do khám:</span><span className="d">{appointment.notes || '—'}</span>
        </div>
        <div className="row">
          <span>Bệnh sử, tiền sử:</span><span className="d">Chưa cập nhật</span>
        </div>

        <div className="sec">III. KHÁM LÂM SÀNG</div>
        <div className="row">
          <span>Khám toàn thân:</span><span className="d">Tỉnh, tiếp xúc tốt, sinh hiệu ổn định.</span>
        </div>

        <div className="sec">IV. CHẨN ĐOÁN</div>
        <div className="row">
          <span>Chẩn đoán:</span><span className="d">{appointment.diagnosis || 'Chưa có kết luận'}</span>
        </div>

        <div className="sec">V. KẾT LUẬN VÀ HƯỚNG XỬ TRÍ</div>
        <div className="row">
          <span>Xử trí:</span><span className="d">Theo đơn thuốc (nếu có).</span>
        </div>
        <div className="row">
          <span>Tái khám:</span><span className="d">Khi hết thuốc hoặc khi có dấu hiệu bất thường.</span>
        </div>

        <div className="sigs" style={{ marginTop: '40px' }}>
          <div></div>
          <div>
            <div className="it">Ngày <span className="d">{apptDate.getDate()}</span> tháng <span className="d">{apptDate.getMonth() + 1}</span> năm <span className="d">{apptDate.getFullYear()}</span></div>
            <div className="role">Bác sĩ khám bệnh</div>
            <div className="hint">(Ký, ghi rõ họ tên)</div>
            <div style={{ height: '80px' }}></div>
            <div><strong>{appointment.doctor.user.name}</strong></div>
          </div>
        </div>
      </article>
    </PrintClient>
  );
}
