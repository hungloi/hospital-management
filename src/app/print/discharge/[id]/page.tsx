import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import PrintClient from '../../PrintClient';

export default async function DischargePrintPage({ params }: { params: Promise<{ id: string }> }) {
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
            <div className="small" style={{ marginTop: '4px' }}>Khoa {appointment.doctor.department?.name || 'Lâm sàng'}</div>
          </div>
          <div className="meta">
            <div>Mẫu: <b>HIS-07</b></div>
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
        
        <div className="title">GIẤY RA VIỆN</div>
        <div className="sub">Số: <span className="d">RV-{appointment.id.substring(0, 8).toUpperCase()}</span></div>

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
          <span>Vào viện lúc:</span><span className="d">08:00 ngày {apptDate.toLocaleDateString('vi-VN')}</span>
          <span>Ra viện lúc:</span><span className="d">16:00 ngày {apptDate.toLocaleDateString('vi-VN')}</span>
        </div>
        <div className="row">
          <span>Số ngày điều trị:</span><span className="d" style={{ flex: '0 0 50px', textAlign: 'center' }}>1</span>
          <span>Khoa điều trị:</span><span className="d">{appointment.doctor.department?.name || 'Khám bệnh'}</span>
        </div>

        <div className="sec">Chẩn đoán ra viện</div>
        <div className="row">
          <span className="d" style={{ fontWeight: 700 }}>{appointment.diagnosis || 'Chưa có kết luận'}</span>
        </div>

        <div className="sec">Phương pháp điều trị</div>
        <div className="row">
          <span className="d" style={{ fontWeight: 400 }}>Khám và kê đơn ngoại trú. Tuân thủ phác đồ điều trị.</span>
        </div>

        <div className="sec">Tình trạng người bệnh khi ra viện</div>
        <div className="row">
          <span className="d" style={{ fontWeight: 400 }}>Tỉnh táo, tiếp xúc tốt, sinh hiệu ổn định.</span>
        </div>

        <div className="sec">Hướng điều trị tiếp và các chế độ tiếp theo</div>
        <div className="row">
          <span className="d" style={{ fontWeight: 400 }}>Dùng thuốc theo đơn. Chế độ ăn uống, sinh hoạt hợp lý. Tái khám sau khi hết thuốc hoặc có dấu hiệu bất thường.</span>
        </div>

        <div className="sigs" style={{ marginTop: '26px' }}>
          <div>
            <div className="role">Bác sĩ điều trị</div>
            <div className="stamp">✓ Đã ký số<br />{appointment.doctor.user.name}<br />{apptDate.toLocaleDateString('vi-VN')}</div>
          </div>
          <div>
            <div className="role">Trưởng khoa</div>
            <div className="stamp">✓ Đã duyệt<br />Khoa {appointment.doctor.department?.name || 'Lâm sàng'}<br />{apptDate.toLocaleDateString('vi-VN')}</div>
          </div>
          <div>
            <div className="it">Ngày <span className="d">{apptDate.getDate()}</span> tháng <span className="d">{apptDate.getMonth() + 1}</span> năm <span className="d">{apptDate.getFullYear()}</span></div>
            <div className="role">Giám đốc bệnh viện</div>
            <div className="stamp">✓ Đã ký số<br />Bệnh viện Đa khoa Hưng Lợi<br />{apptDate.toLocaleDateString('vi-VN')}</div>
          </div>
        </div>
      </article>
    </PrintClient>
  );
}
