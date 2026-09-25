import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import PrintClient from '@/app/print/PrintClient';

export default async function PrintReceipt({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const payment = await prisma.payment.findFirst({
    where: { appointmentId: id },
    include: {
      appointment: {
        include: {
          patient: true,
          doctor: { include: { department: true } }
        }
      }
    }
  });

  if (!payment) notFound();

  const appt = payment.appointment;
  const isBHYT = appt?.type === 'BHYT';

  // If invoice exists, load itemized invoice; otherwise fall back to older dummy logic
  let invoice = null;
  if (payment.invoiceId) {
    invoice = await prisma.invoice.findUnique({ where: { id: payment.invoiceId }, include: { items: true } });
  }

  // If we have an invoice with items, use them; otherwise synthesize items (consultation + other)
  let items: { description: string; amount: number; quantity: number }[] = [];
  let totalAmount = 0;

  if (invoice && invoice.items && invoice.items.length) {
    items = invoice.items.map(i => ({ description: i.description, amount: i.amount, quantity: i.quantity }));
    totalAmount = invoice.total ?? items.reduce((s, it) => s + it.amount * it.quantity, 0);
  } else {
    const examFee = isBHYT ? 50000 : 200000;
    const paymentAmt = payment.amount ?? 0;
    const otherFees = Math.max(0, paymentAmt - examFee);
    items.push({ description: `Công khám bệnh (${isBHYT ? 'BHYT' : 'Dịch vụ'})`, amount: examFee, quantity: 1 });
    if (otherFees > 0) items.push({ description: 'Tiền thuốc & DV khác', amount: otherFees, quantity: 1 });
    totalAmount = paymentAmt;
  }

  // Format currency
  const fmt = (n: number) => Math.round(n).toLocaleString('vi-VN');

  const bhytCoverage = isBHYT ? totalAmount * 0.8 : 0;
  const patientPays = totalAmount - bhytCoverage;

  const createdAt = new Date(payment.createdAt);

  return (
    <PrintClient>
      <article className="sheet slip">
        <div className="center"><b>BỆNH VIỆN ĐA KHOA HƯNG LỢI</b></div>
        <div className="center" style={{ fontSize: '15px', fontWeight: 700, marginTop: '4px' }}>PHIẾU THU TIỀN</div>
        <div className="center small">Số: <b className="d">PT-{payment.id.slice(0, 6).toUpperCase()}</b></div>
        <div className="center small">{createdAt.toLocaleString('vi-VN')} – Quầy thu</div>
        <hr />
        
        <div className="kv"><span>Người nộp</span><span className="v d">{appt?.patient?.name.toUpperCase() ?? '—'}</span></div>
        <div className="kv"><span>Mã BN</span><span className="v d">{appt?.patient?.id.substring(0, 8).toUpperCase() ?? '—'}</span></div>
        <div className="kv"><span>Đối tượng</span><span className="v d">{isBHYT ? 'BHYT đúng tuyến' : 'Dịch vụ'}</span></div>
        <div className="kv"><span>Lượt khám</span><span className="v d">KB-{appt?.id.substring(0, 8).toUpperCase() ?? '—'}</span></div>
        <hr />
        
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <tbody>
            {items.map((it, idx) => (
              <tr key={idx}>
                <td>{it.description}</td>
                <td className="r d" style={{ textAlign: 'right', border: 0 }}>
                  {fmt(it.amount * (it.quantity || 1))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <hr />

        <div className="kv"><b>Tổng chi phí</b><b className="v d">{fmt(totalAmount)}</b></div>
        <div className="kv"><span>BHYT chi trả</span><span className="v d">{isBHYT ? `−${fmt(bhytCoverage)}` : '0'}</span></div>
        <div className="kv" style={{ fontSize: '15px' }}><b>Người bệnh trả</b><b className="v d">{fmt(patientPays)}</b></div>
        <hr />

        <div className="kv"><span>Hình thức</span><span className="v d">{payment.method || 'Tiền mặt'}</span></div>
        <div className="kv"><span>Khách đưa</span><span className="v d">{fmt(patientPays)}</span></div>
        <div className="kv"><span>Trả lại</span><span className="v d">0</span></div>
        <hr />

        <div className="kv"><span>Thu ngân</span><span className="v d">Bệnh Viện Hưng Lợi</span></div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '8px' }}>
          <svg className="qr" viewBox="-1 -1 27 27" style={{ shapeRendering: 'crispEdges', width: '64px', height: '64px' }}>
            <rect x="-1" y="-1" width="27" height="27" fill="#fff" />
            <path d="M0 0h1v1h-1zM24 0h1v1h-1zM0 24h1v1h-1zM4 4h1v1h-1z" fill="#111" />
          </svg>
          <div className="small">Quét mã để xem/tải hóa đơn điện tử trên cổng bệnh nhân.</div>
        </div>
        <div className="small center" style={{ marginTop: '6px' }}>Hóa đơn điện tử cũng được gửi qua Zalo hoặc email đã đăng ký.</div>
        <div className="small center">Đơn vị: đồng</div>
      </article>
    </PrintClient>
  );
}
