import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import PrintClient from '@/app/print/PrintClient';

export default async function LabResultPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const { id } = await params;
  // id = labOrder id
  const labOrder = await prisma.labOrder.findUnique({
    where: { id },
    include: {
      appointment: {
        include: {
          patient: true,
          doctor: { include: { user: true, department: true } },
        },
      },
    },
  });

  if (!labOrder || !labOrder.appointment) notFound();

  const patient = labOrder.appointment.patient;
  const doctor  = labOrder.appointment.doctor;
  const age = patient.dob
    ? Math.floor((Date.now() - new Date(patient.dob).getTime()) / (365.25 * 24 * 3600 * 1000))
    : '—';

  const orderDate     = new Date(labOrder.orderDate);
  const completedDate = labOrder.completedDate ? new Date(labOrder.completedDate) : null;
  const fmtDate = (d: Date) => `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;
  const fmtTime = (d: Date) => `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;

  return (
    <PrintClient>
      <article className="sheet a4">
        <div className="hdr">
          <div className="org">
            <div>SỞ Y TẾ</div>
            <b>BỆNH VIỆN ĐA KHOA HƯNG LỢI</b>
            <div className="ln"></div>
            <div className="small" style={{ marginTop: '4px' }}>Khoa Xét nghiệm</div>
          </div>
          <div className="meta">
            <div>Mẫu: <b>HIS-04</b></div>
            <div>Mã mẫu: <span className="d">MXN-{id.substring(0,8).toUpperCase()}</span></div>
            <svg className="bc" preserveAspectRatio="none" viewBox="0 0 100 30">
              {[0,5,14,22,30,40,52,58,66,76,84,92].map((x,i) => (
                <rect key={i} x={x} y="0" width={i%2===0?4:2} height="30" fill="#111" />
              ))}
            </svg>
          </div>
        </div>

        <div className="title">PHIẾU KẾT QUẢ XÉT NGHIỆM</div>
        <div className="sub">{labOrder.type}</div>

        <div className="row">
          <span>Họ và tên:</span>
          <span className="d" style={{ flex: 2 }}>{patient.name.toUpperCase()}</span>
          <span>Giới:</span><span className="d">{patient.gender === 'MALE' ? 'Nam' : 'Nữ'}</span>
          <span>Tuổi:</span><span className="d">{age}</span>
        </div>
        <div className="row">
          <span>Bác sĩ chỉ định:</span>
          <span className="d">{doctor.user.name}</span>
          <span>Khoa:</span>
          <span className="d">{doctor.department?.name || '—'}</span>
        </div>
        <div className="row">
          <span>Ngày chỉ định:</span>
          <span className="d">{fmtDate(orderDate)} {fmtTime(orderDate)}</span>
          <span>Ngày trả KQ:</span>
          <span className="d">{completedDate ? `${fmtDate(completedDate)} ${fmtTime(completedDate)}` : 'Chưa có'}</span>
        </div>

        {labOrder.description && (
          <div className="row">
            <span>Mô tả chỉ định:</span>
            <span className="d">{labOrder.description}</span>
          </div>
        )}

        <div className="sec">KẾT QUẢ</div>

        {labOrder.status !== 'DONE' ? (
          <div className="alert">
            {labOrder.status === 'CANCELLED' ? '✕ Xét nghiệm đã huỷ' : '⏳ Chưa có kết quả — đang xử lý'}
          </div>
        ) : (
          <div style={{ background: '#f9fafb', border: '1px solid #ccc', borderRadius: '4px', padding: '14px 16px', margin: '8px 0', minHeight: '120px' }}>
            <div className="d" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
              {labOrder.result || 'Kết quả chưa được nhập vào hệ thống.'}
            </div>
          </div>
        )}

        <div className="small" style={{ marginTop: '6px' }}>
          Kết quả được xử lý bởi hệ thống máy xét nghiệm tại Bệnh viện Đa khoa Hưng Lợi.
          Trị số tham chiếu theo giới và tuổi. Cần kết hợp lâm sàng để chẩn đoán.
        </div>

        <div className="sigs">
          <div>
            <div className="role">Kỹ thuật viên thực hiện</div>
            <div className="hint">(Ký, ghi rõ họ tên)</div>
            <div style={{ height: '60px' }}></div>
          </div>
          <div>
            <div className="it">
              Ngày <span className="d">{completedDate ? completedDate.getDate() : '___'}</span> tháng{' '}
              <span className="d">{completedDate ? completedDate.getMonth()+1 : '___'}</span> năm{' '}
              <span className="d">{completedDate ? completedDate.getFullYear() : '___'}</span>
            </div>
            <div className="role">Bác sĩ duyệt kết quả</div>
            <div className="hint">(Ký, ghi rõ họ tên)</div>
            <div style={{ height: '60px' }}></div>
          </div>
        </div>
      </article>
    </PrintClient>
  );
}
