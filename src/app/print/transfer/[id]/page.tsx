import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import PrintClient from '../../PrintClient';

export default async function TransferPrintPage({ params }: { params: Promise<{ id: string }> }) {
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
  
  const apptDate = new Date(appointment.date);

  return (
    <PrintClient>
      <article className="sheet a4">
        <div className="hdr">
          <div className="org">
            <div>SỞ Y TẾ</div>
            <b>BỆNH VIỆN ĐA KHOA HƯNG LỢI</b>
            <div className="ln"></div>
            <div className="small" style={{ marginTop: '4px' }}>Số: CV-{appointment.id.substring(0, 5).toUpperCase()}</div>
          </div>
          <div className="meta">
            <div>Mẫu: <b>HIS-08</b></div>
            <div>Số lưu trữ: <span className="d">LT-{apptDate.getFullYear()}-{appointment.id.substring(0, 5).toUpperCase()}</span></div>
            {/* Fake barcode block */}
            <svg className="bc" preserveAspectRatio="none" viewBox="0 0 100 30">
              <rect x="0" y="0" width="4" height="30" fill="#111" />
              <rect x="6" y="0" width="2" height="30" fill="#111" />
              <rect x="10" y="0" width="6" height="30" fill="#111" />
              <rect x="18" y="0" width="2" height="30" fill="#111" />
              <rect x="24" y="0" width="8" height="30" fill="#111" />
              <rect x="36" y="0" width="4" height="30" fill="#111" />
              <rect x="42" y="0" width="2" height="30" fill="#111" />
              <rect x="46" y="0" width="10" height="30" fill="#111" />
              <rect x="60" y="0" width="4" height="30" fill="#111" />
              <rect x="68" y="0" width="6" height="30" fill="#111" />
              <rect x="76" y="0" width="2" height="30" fill="#111" />
              <rect x="80" y="0" width="8" height="30" fill="#111" />
              <rect x="92" y="0" width="2" height="30" fill="#111" />
              <rect x="96" y="0" width="4" height="30" fill="#111" />
            </svg>
          </div>
        </div>
        
        <div className="title">GIẤY CHUYỂN TUYẾN</div>
        <div className="sub">Khám bệnh, chữa bệnh bảo hiểm y tế</div>

        <div className="row">
          <span style={{ fontStyle: 'italic' }}>Kính gửi: Bệnh viện tuyến trên / Cơ sở tiếp nhận</span>
        </div>
        <div className="row" style={{ marginTop: '10px' }}>
          <span>Bệnh viện Đa khoa Hưng Lợi trân trọng giới thiệu người bệnh:</span>
        </div>

        <div className="row">
          <span>Họ và tên người bệnh:</span><span className="d" style={{ flex: 2 }}>{appointment.patient.name.toUpperCase()}</span>
          <span>Tuổi:</span><span className="d">{age}</span>
          <span>Giới:</span><span className="d">{appointment.patient.gender === 'MALE' ? 'Nam' : 'Nữ'}</span>
        </div>
        <div className="row">
          <span>Dân tộc:</span><span className="d">Kinh</span>
          <span>Nghề nghiệp:</span><span className="d">Chưa cập nhật</span>
          <span>Mã BN:</span><span className="d">{appointment.patient.id.substring(0, 8).toUpperCase()}</span>
        </div>
        <div className="row">
          <span>Địa chỉ:</span><span className="d">{appointment.patient.address || 'Chưa cập nhật'}</span>
        </div>
        <div className="row">
          <span>Thẻ BHYT số:</span><span className="d" style={{ flex: 2 }}>—</span>
          <span>Giá trị đến:</span><span className="d">—</span>
        </div>
        <div className="row">
          <span>Đã được khám/điều trị tại Bệnh viện Đa khoa Hưng Lợi từ ngày:</span><span className="d">{apptDate.toLocaleDateString('vi-VN')}</span>
          <span>đến ngày:</span><span className="d">{apptDate.toLocaleDateString('vi-VN')}</span>
        </div>

        <div className="sec">TÓM TẮT BỆNH ÁN</div>
        <div className="row">
          <span>1. Dấu hiệu lâm sàng:</span><span className="d" style={{ fontWeight: 400 }}>{appointment.notes || 'Không ghi nhận'}</span>
        </div>
        <div className="row">
          <span>2. Kết quả xét nghiệm, cận lâm sàng:</span><span className="d" style={{ fontWeight: 400 }}>Chưa có / Đã đính kèm (nếu có)</span>
        </div>
        <div className="row">
          <span>3. Chẩn đoán tuyến dưới:</span><span className="d" style={{ fontWeight: 700 }}>{appointment.diagnosis || 'Chưa có kết luận'}</span>
        </div>
        <div className="row">
          <span>4. Phương pháp, thuốc đã sử dụng:</span><span className="d" style={{ fontWeight: 400 }}>Theo hồ sơ bệnh án đính kèm</span>
        </div>

        <div className="sec">LÝ DO CHUYỂN TUYẾN</div>
        <div className="row">
          <span className="d" style={{ fontWeight: 400 }}>☑ Theo yêu cầu của người bệnh / người nhà người bệnh (hoặc vượt quá khả năng điều trị).</span>
        </div>

        <div className="sigs" style={{ marginTop: '36px' }}>
          <div>
            <div className="role">Người có thẩm quyền chuyển tuyến</div>
            <div className="hint">(Ký, đóng dấu)</div>
            <div className="stamp">✓ Đã ký số<br />GIÁM ĐỐC BV ĐA KHOA HƯNG LỢI<br />{apptDate.toLocaleDateString('vi-VN')}</div>
          </div>
          <div>
            <div className="it">Ngày <span className="d">{apptDate.getDate()}</span> tháng <span className="d">{apptDate.getMonth() + 1}</span> năm <span className="d">{apptDate.getFullYear()}</span></div>
            <div className="role">Bác sĩ điều trị</div>
            <div className="hint">(Ký, ghi rõ họ tên)</div>
            <div className="stamp">✓ Đã ký số<br />{appointment.doctor.user.name}<br />{apptDate.toLocaleDateString('vi-VN')}</div>
          </div>
        </div>
      </article>
    </PrintClient>
  );
}
