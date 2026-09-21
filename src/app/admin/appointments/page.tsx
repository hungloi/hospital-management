import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import DashboardShell from '@/components/DashboardShell';
import Link from 'next/link';
import AssignCombo from '@/components/AssignCombo';
import LabServicesAdminWrapper from '@/components/LabServicesAdminWrapper';
import InvoiceEditor from '@/components/InvoiceEditor';
import { ADMIN_NAV, ADMIN_THEME } from '@/lib/adminConfig';


export default async function AdminAppointmentsPage() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'ADMIN') redirect('/login');

  const appointments = await prisma.appointment.findMany({
    orderBy: { date: 'desc' },
    include: { patient: true, doctor: { include: { user: true, department: true } }, payments: true }
  });

  const STATUS_COLOR: Record<string, string> = { PENDING: '#f59e0b', CONFIRMED: '#38bdf8', EXAMINING: '#a78bfa', COMPLETED: '#34d399', CANCELLED: '#f87171' };
  const STATUS_LABEL: Record<string, string> = { PENDING: 'Chờ xác nhận', CONFIRMED: 'Đã xác nhận', EXAMINING: 'Đang khám', COMPLETED: 'Hoàn thành', CANCELLED: 'Đã hủy' };

  return (
    <DashboardShell title="Quản trị viên" subtitle="Hệ thống" items={ADMIN_NAV} theme={ADMIN_THEME}
      footer={<div style={{ marginBottom: '0.5rem', padding: '0.5rem 0.75rem', background: 'rgba(56,189,248,0.1)', borderRadius: '8px', color: '#38bdf8', fontSize: '0.78rem', textAlign: 'center', fontWeight: 600 }}>👑 ADMIN</div>}>
      <div style={{ padding: '2rem', color: '#0f172a' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>📅 Tất cả lịch hẹn</h1>
          <p style={{ color: '#475569', marginTop: '4px' }}>{appointments.length} lịch hẹn trong hệ thống</p>
        </div>

        {/* Status summary */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {Object.entries(STATUS_LABEL).map(([status, label]) => {
            const count = appointments.filter(a => a.status === status).length;
            return (
              <div key={status} style={{ background: '#ffffff', border: `1px solid ${STATUS_COLOR[status]}44`, borderRadius: '10px', padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 1px 2px rgba(15,23,42,0.05)' }}>
                <span style={{ color: STATUS_COLOR[status], fontWeight: 700 }}>{count}</span>
                <span style={{ color: '#475569', fontSize: '0.8rem' }}>{label}</span>
              </div>
            );
          })}
        </div>

        {/* Lab services admin (client component) */}
        <div style={{ marginTop: '1rem' }}>
          <LabServicesAdminWrapper />
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 1px 2px rgba(15,23,42,0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: '#e2e8f0' }}>
                {['Bệnh nhân', 'Bác sĩ', 'Khoa', 'Ngày khám', 'Trạng thái', 'Thanh toán', 'Gói dịch vụ', 'Hóa đơn'].map(h => (
                  <th key={h} style={{ padding: '0.875rem 1rem', color: '#475569', textAlign: 'left', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {appointments.map(a => (
                <tr key={a.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '0.875rem 1rem', color: '#0f172a' }}>{a.patient.name}</td>
                  <td style={{ padding: '0.875rem 1rem', color: '#475569' }}>{a.doctor.user.name}</td>
                  <td style={{ padding: '0.875rem 1rem', color: '#64748b' }}>{a.doctor.department?.name || '—'}</td>
                  <td style={{ padding: '0.875rem 1rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                    {new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(a.date))}
                  </td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <span style={{ padding: '2px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600, background: `${STATUS_COLOR[a.status]}22`, color: STATUS_COLOR[a.status] }}>
                      {STATUS_LABEL[a.status]}
                    </span>
                  </td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    {(a.payments && a.payments.length > 0) ? (
                      <span style={{ color: '#16a34a', fontSize: '0.8rem', fontWeight: 600 }}>✓ { (a.payments.find(p => p.status === 'PAID')?.method) || a.payments[0].method }</span>
                    ) : (
                      <span style={{ color: '#64748b', fontSize: '0.8rem' }}>Chưa TT</span>
                    )}
                  </td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <AssignCombo appointmentId={a.id} currentComboId={a.serviceComboId} />
                  </td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <InvoiceEditor appointmentId={a.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardShell>
  );
}
