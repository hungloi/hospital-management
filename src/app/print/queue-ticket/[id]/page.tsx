import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import PrintClient from '@/app/print/PrintClient';

export default async function QueueTicketPrintPage({ params }: { params: Promise<{ id: string }> }) {
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

  const printTime = new Date();
  const apptDate = new Date(appointment.date);
  
  // Fake số thứ tự
  const queueNumber = `A-${Math.floor(Math.random() * 50) + 10}`;
  const waitingCount = Math.floor(Math.random() * 8);

  const fmtTime = (d: Date) => `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  const fmtDate = (d: Date) => `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;

  return (
    <PrintClient>
      <article className="sheet slip">
        <div className="center"><b>BỆNH VIỆN ĐA KHOA HƯNG LỢI</b></div>
        <div className="center" style={{ fontSize: '15px', fontWeight: 700, marginTop: '4px' }}>PHIẾU SỐ THỨ TỰ KHÁM</div>
        <hr />
        
        <div className="center small">Số thứ tự của bạn</div>
        <div className="big d" style={{ border: 0, display: 'block' }}>{queueNumber}</div>
        <div className="center" style={{ fontSize: '12px' }}>Vui lòng chờ gọi số trên màn hình</div>
        <hr />
        
        <div className="kv">
          <span>Phòng khám</span>
          <span className="v d">{appointment.doctor.department?.name || 'Phòng khám tổng quát'}</span>
        </div>
        <div className="kv">
          <span>Bác sĩ</span>
          <span className="v d">{appointment.doctor.user.name}</span>
        </div>
        <div className="kv">
          <span>Người bệnh</span>
          <span className="v d">{appointment.patient.name.toUpperCase()}</span>
        </div>
        <div className="kv">
          <span>Mã BN</span>
          <span className="v d">{appointment.patient.id.substring(0,8).toUpperCase()}</span>
        </div>
        <div className="kv">
          <span>Giờ hẹn</span>
          <span className="v d">{fmtTime(apptDate)} – {fmtDate(apptDate)}</span>
        </div>
        <div className="kv">
          <span>In phiếu lúc</span>
          <span className="v d">{fmtTime(printTime)}</span>
        </div>
        <div className="kv">
          <span>Số người chờ trước</span>
          <span className="v d">{waitingCount} người</span>
        </div>
        <hr />
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '10px' }}>
          <svg className="qr" viewBox="-1 -1 27 27" style={{ shapeRendering: 'crispEdges' }}>
            <rect x="-1" y="-1" width="27" height="27" fill="#fff" />
            <path d="M0 0h1v1h-1zM24 0h1v1h-1zM0 24h1v1h-1z" fill="#111" />
          </svg>
          <div className="small">
            Quét mã để xem số đang gọi và thời gian chờ trên điện thoại.<br />
            Mã lượt khám: <b className="d">KB-{appointment.id.substring(0,6).toUpperCase()}</b>
          </div>
        </div>
      </article>
    </PrintClient>
  );
}
