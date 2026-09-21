import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';
import { DIRECTOR_THEME } from '@/lib/adminConfig';
import { prisma } from '@/lib/prisma';
import { DIRECTOR_NAV } from '../page';

export default async function DirectorHRPage() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session?.user || !['ADMIN', 'DIRECTOR', 'DEPUTY_DIRECTOR'].includes(role)) {
    redirect('/login');
  }

  const [doctors, nurses, accountants, staff, directors] = await Promise.all([
    prisma.user.count({ where: { role: { in: ['DOCTOR', 'HEAD_DOCTOR', 'DEPUTY_HEAD'] } } }),
    prisma.user.count({ where: { role: 'NURSE' } }),
    prisma.user.count({ where: { role: { in: ['ACCOUNTANT', 'CHIEF_ACCOUNTANT'] } } }),
    prisma.user.count({ where: { role: 'STAFF' } }),
    prisma.user.count({ where: { role: { in: ['DIRECTOR', 'DEPUTY_DIRECTOR'] } } }),
  ]);
  const total = doctors + nurses + accountants + staff + directors;

  // Get today's active shifts
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  const tomorrow = new Date(todayDate);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const activeShifts = await prisma.staffShift.findMany({
    where: {
      scheduleDate: { gte: todayDate, lt: tomorrow }
    },
    include: {
      department: true,
      doctor: { include: { user: true } },
      nurse: { include: { user: true } }
    },
    take: 10 // Giới hạn hiển thị 10 ca
  });

  return (
    <DashboardShell title="Ban Giám Đốc" subtitle="Báo cáo Nhân sự" items={DIRECTOR_NAV} theme={DIRECTOR_THEME} >
      <div style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>Cơ cấu Nhân sự</h1>
          <button style={{ padding: '0.75rem 1.5rem', background: '#ef4444', color: 'white', borderRadius: '8px', border: 'none', fontWeight: 700, cursor: 'pointer' }}>🖨️ Xuất báo cáo (PDF)</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
          {/* Tổng quan */}
          <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <p style={{ color: '#64748b', fontWeight: 600, marginBottom: '0.5rem' }}>TỔNG NHÂN SỰ BỆNH VIỆN</p>
            <p style={{ fontSize: '3.5rem', fontWeight: 800, color: '#ef4444', marginBottom: '1rem' }}>{total}</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 600 }}>▲ +12% so với quý trước</span>
            </div>
          </div>

          {/* Chi tiết */}
          <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ color: '#0f172a', fontWeight: 700, marginBottom: '1.5rem' }}>Phân bổ theo Khối</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '120px', color: '#64748b', fontWeight: 600, fontSize: '0.9rem' }}>Khối Lâm sàng</div>
                <div style={{ flex: 1, background: '#f1f5f9', borderRadius: '8px', height: '12px', overflow: 'hidden' }}>
                  <div style={{ width: `${(doctors / total) * 100}%`, background: '#3b82f6', height: '100%' }}></div>
                </div>
                <div style={{ width: '40px', textAlign: 'right', fontWeight: 700 }}>{doctors}</div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '120px', color: '#64748b', fontWeight: 600, fontSize: '0.9rem' }}>Khối Điều dưỡng</div>
                <div style={{ flex: 1, background: '#f1f5f9', borderRadius: '8px', height: '12px', overflow: 'hidden' }}>
                  <div style={{ width: `${(nurses / total) * 100}%`, background: '#ec4899', height: '100%' }}></div>
                </div>
                <div style={{ width: '40px', textAlign: 'right', fontWeight: 700 }}>{nurses}</div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '120px', color: '#64748b', fontWeight: 600, fontSize: '0.9rem' }}>Khối Tài chính</div>
                <div style={{ flex: 1, background: '#f1f5f9', borderRadius: '8px', height: '12px', overflow: 'hidden' }}>
                  <div style={{ width: `${(accountants / total) * 100}%`, background: '#8b5cf6', height: '100%' }}></div>
                </div>
                <div style={{ width: '40px', textAlign: 'right', fontWeight: 700 }}>{accountants}</div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '120px', color: '#64748b', fontWeight: 600, fontSize: '0.9rem' }}>Khối Hành chính</div>
                <div style={{ flex: 1, background: '#f1f5f9', borderRadius: '8px', height: '12px', overflow: 'hidden' }}>
                  <div style={{ width: `${(staff / total) * 100}%`, background: '#f59e0b', height: '100%' }}></div>
                </div>
                <div style={{ width: '40px', textAlign: 'right', fontWeight: 700 }}>{staff}</div>
              </div>

            </div>
          </div>
        </div>

        {/* Ca trực hôm nay */}
        <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', marginTop: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ color: '#0f172a', fontWeight: 700 }}>Nhân sự đang trực (Hôm nay)</h3>
            <a href="/admin/schedules" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>Xem toàn bộ lịch →</a>
          </div>
          
          {activeShifts.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#64748b', padding: '2rem', background: '#f8fafc', borderRadius: '8px' }}>
              Không có ca trực nào được lên lịch cho hôm nay.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {activeShifts.map(shift => {
                const user = shift.doctor?.user || shift.nurse?.user;
                return (
                  <div key={shift.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '40px', height: '40px', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#64748b' }}>
                        {user?.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p style={{ fontWeight: 700, color: '#0f172a' }}>{user?.name || 'Không xác định'}</p>
                        <p style={{ fontSize: '0.85rem', color: '#64748b' }}>{shift.department.name} • {shift.doctor ? 'Bác sĩ' : 'Nhân viên'}</p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ padding: '0.25rem 0.75rem', background: shift.shiftType === 'NIGHT' ? '#1e293b' : (shift.shiftType === 'EVENING' ? '#f59e0b' : '#3b82f6'), color: 'white', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700 }}>
                        CA {shift.shiftType === 'DAY' ? 'SÁNG' : shift.shiftType === 'EVENING' ? 'CHIỀU' : 'ĐÊM'}
                      </span>
                      <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.5rem', fontWeight: 600 }}>{shift.startTime} - {shift.endTime}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </DashboardShell>
  );
}
