import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import DashboardShell from '@/components/DashboardShell';
import { ADMIN_NAV, ADMIN_THEME } from '@/lib/adminConfig';
import Link from 'next/link';


export default async function AdminDepartmentsPage() {
  const session = await auth();
  if (!session?.user || !['ADMIN','DIRECTOR'].includes((session.user as any).role)) redirect('/login');

  const departments = await prisma.department.findMany({
    include: {
      doctors: { include: { user: true } },
      nurses: { include: { user: true } },
      rooms: true,
      _count: { select: { doctors: true, nurses: true, rooms: true } }
    },
    orderBy: { name: 'asc' }
  });

  const COLORS = ['#38bdf8', '#34d399', '#a78bfa', '#fbbf24', '#f87171', '#e879f9'];

  // Phòng ban KHÔNG Y TẾ — không cần bác sĩ/y tá
  const NON_MEDICAL_DEPTS = new Set([
    'Phòng Công Nghệ Thông Tin',
    'Phòng Kế Toán - Tài Chính',
    'Phòng Nhân Sự - Hành Chính',
    'Phòng Vệ Sinh và Bảo Vệ',
    'Phòng Đào Tạo - Nghiên Cứu Khoa Học',
    'Phòng Quản Lý Chất Lượng',
  ]);

  // Phòng ban hành chính (có nhân viên nhưng không phải BS/YT điều trị)
  const ADMIN_DEPTS = new Set([
    'Phòng Công Nghệ Thông Tin',
    'Phòng Kế Toán - Tài Chính',
    'Phòng Nhân Sự - Hành Chính',
  ]);

  const CLEANING_DEPTS = new Set([
    'Phòng Vệ Sinh và Bảo Vệ',
  ]);

  // Các khoa không có phòng bệnh nội trú (ngoại trú hoặc kỹ thuật)
  const NO_ROOMS_DEPTS = new Set([
    'Khoa Chẩn Đoán Hình Ảnh',
    'Khoa Xét Nghiệm',
    'Khoa Siêu Âm Chẩn Đoán',
    'Khoa Điện Não',
    'Khoa Pháp Y - Giám Định Tư Pháp',
    'Khoa Phòng Chống Bệnh Tật',
    'Phòng Công Nghệ Thông Tin',
    'Phòng Kế Toán - Tài Chính',
    'Phòng Nhân Sự - Hành Chính',
    'Phòng Dược',
    'Phòng Dinh Dưỡng',
    'Phòng Quản Lý Chất Lượng',
    'Phòng Vệ Sinh và Bảo Vệ',
    'Phòng Đào Tạo - Nghiên Cứu Khoa Học',
    'Pool Điều Dưỡng',
    'Khoa Tai Mũi Họng',
    'Khoa Mắt',
    'Khoa Nhãn',
  ]);

  // Chỉ tính khoa Y tế thực sự cho thống kê thiếu
  const medicalDepts = departments.filter(d => !NON_MEDICAL_DEPTS.has(d.name));
  const totalDoctors = departments.reduce((sum, dept) => sum + dept._count.doctors, 0);
  const totalNurses = departments.reduce((sum, dept) => sum + dept._count.nurses, 0);
  const departmentsMissingDoctor = medicalDepts.filter((dept) => dept._count.doctors === 0).length;
  const departmentsMissingNurse = medicalDepts.filter((dept) => dept._count.nurses === 0).length;

  return (
    <DashboardShell title="Quản trị viên" subtitle="Hệ thống" items={ADMIN_NAV} theme={ADMIN_THEME} >
      <div style={{ padding: '2rem', color: '#0f172a' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>🏢 Quản lý Khoa phòng</h1>
            <p style={{ color: '#475569', marginTop: '4px' }}>{departments.length} khoa trong bệnh viện</p>
          </div>
          <Link href="/admin/departments/new" style={{ padding: '0.6rem 1.25rem', background: '#38bdf8', color: '#0f172a', borderRadius: '10px', fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem' }}>
            + Thêm Khoa
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1rem 1.1rem', boxShadow: '0 1px 2px rgba(15,23,42,0.05)' }}>
            <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Tổng bác sĩ</div>
            <div style={{ color: '#0f172a', fontSize: '1.55rem', fontWeight: 800, marginTop: '0.3rem' }}>{totalDoctors}</div>
            <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.2rem' }}>Đã phân bổ vào khoa</div>
          </div>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1rem 1.1rem', boxShadow: '0 1px 2px rgba(15,23,42,0.05)' }}>
            <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Tổng y tá</div>
            <div style={{ color: '#0f172a', fontSize: '1.55rem', fontWeight: 800, marginTop: '0.3rem' }}>{totalNurses}</div>
            <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.2rem' }}>Đang phụ trách phòng ban</div>
          </div>
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '16px', padding: '1rem 1.1rem' }}>
            <div style={{ color: '#b91c1c', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Khoa thiếu bác sĩ</div>
            <div style={{ color: '#0f172a', fontSize: '1.55rem', fontWeight: 800, marginTop: '0.3rem' }}>{departmentsMissingDoctor}</div>
            <div style={{ color: '#b91c1c', fontSize: '0.8rem', marginTop: '0.2rem' }}>Cần bổ sung bác sĩ</div>
          </div>
          <div style={{ background: '#fefce8', border: '1px solid #fef08a', borderRadius: '16px', padding: '1rem 1.1rem' }}>
            <div style={{ color: '#92400e', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Khoa thiếu y tá</div>
            <div style={{ color: '#0f172a', fontSize: '1.55rem', fontWeight: 800, marginTop: '0.3rem' }}>{departmentsMissingNurse}</div>
            <div style={{ color: '#92400e', fontSize: '0.8rem', marginTop: '0.2rem' }}>Cần bổ sung điều dưỡng</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {departments.map((dept, idx) => {
            const color = COLORS[idx % COLORS.length];
            const isNonMedical = NON_MEDICAL_DEPTS.has(dept.name);
            const isAdminOnly = ADMIN_DEPTS.has(dept.name);
            const isCleaning = CLEANING_DEPTS.has(dept.name);
            const isNoRoomDept = NO_ROOMS_DEPTS.has(dept.name);
            
            // Với phòng không y tế, gom chung BS và Y tá (đã lưu trong DB thành bảng Doctor/Nurse tạm thời) thành Nhân viên
            const totalStaff = dept._count.doctors + dept._count.nurses;

            const hasDoctor = dept._count.doctors > 0;
            const hasNurse = dept._count.nurses > 0;
            const hasRoom = dept._count.rooms > 0;

            // Chỉ cảnh báo thiếu BS/YT với khoa y tế, và không báo thiếu phòng với khoa không cần phòng
            const staffingIssues = isNonMedical ? [
               totalStaff === 0 ? 'nhân sự' : null,
               !hasRoom ? 'phòng làm việc' : null,
            ].filter(Boolean) as string[] : [
              !hasDoctor ? 'bác sĩ' : null,
              !hasNurse ? 'y tá' : null,
              (!hasRoom && !isNoRoomDept) ? 'phòng' : null,
            ].filter(Boolean) as string[];
            
            const staffingState = isNonMedical
              ? (isCleaning ? 'Phòng vệ sinh & an ninh' : (isAdminOnly ? 'Phòng hành chính' : 'Phòng hỗ trợ y tế'))
              : (staffingIssues.length > 0 ? 'Thiếu nhân sự' : 'Đủ nhân sự');

            return (
              <div key={dept.id} style={{ background: '#ffffff', border: `1px solid ${color}22`, borderRadius: '16px', overflow: 'hidden', borderTop: `4px solid ${color}`, boxShadow: '0 1px 2px rgba(15,23,42,0.05)' }}>
                <div style={{ padding: '1.25rem 1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <h2 style={{ color: '#0f172a', fontWeight: 700, fontSize: '1.1rem' }}>{dept.name}</h2>
                      {dept.floor && <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '2px' }}>📍 {dept.floor}</p>}
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      {isNonMedical ? (
                        <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '20px', fontWeight: 700, fontSize: '0.8rem' }}>{totalStaff} Nhân viên</span>
                      ) : (
                        <>
                          <span style={{ background: `${color}22`, color, padding: '4px 10px', borderRadius: '20px', fontWeight: 700, fontSize: '0.8rem' }}>{dept._count.doctors} BS</span>
                          <span style={{ background: '#0f766e22', color: '#0f766e', padding: '4px 10px', borderRadius: '20px', fontWeight: 700, fontSize: '0.8rem' }}>{dept._count.nurses} Y tá</span>
                        </>
                      )}
                    </div>
                  </div>
                  {dept.description && <p style={{ color: '#475569', fontSize: '0.85rem', marginBottom: '1rem', lineHeight: 1.5 }}>{dept.description}</p>}

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                    {isNonMedical ? (
                      <>
                        <span style={{ background: '#eff6ff', color: '#1d4ed8', borderRadius: '999px', padding: '0.3rem 0.75rem', fontSize: '0.72rem', fontWeight: 700, border: '1px solid #bfdbfe' }}>
                          {isCleaning ? '🧹 Vệ sinh & Bảo vệ' : (isAdminOnly ? '🏢 Hành chính' : '📊 Hỗ trợ y tế')}
                        </span>
                        <StatusPill label={totalStaff > 0 ? 'Đã có NV' : 'Thiếu NV'} ok={totalStaff > 0} />
                        <StatusPill label={hasRoom ? 'Có phòng LV' : 'Thiếu phòng'} ok={hasRoom} />
                      </>
                    ) : (
                      <>
                        <StatusPill label={hasDoctor ? 'Đã có BS' : 'Thiếu BS'} ok={hasDoctor} />
                        <StatusPill label={hasNurse ? 'Đã có Y tá' : 'Thiếu Y tá'} ok={hasNurse} />
                        {isNoRoomDept ? (
                          <StatusPill label="Ngoại trú" ok={true} />
                        ) : (
                          <StatusPill label={hasRoom ? 'Có phòng' : 'Thiếu phòng'} ok={hasRoom} />
                        )}
                      </>
                    )}
                  </div>

                  <div style={{ background: isNonMedical ? (staffingIssues.length > 0 ? '#fef2f2' : '#eff6ff') : (staffingIssues.length > 0 ? '#fef2f2' : '#ecfdf5'), border: `1px solid ${isNonMedical ? (staffingIssues.length > 0 ? '#fecaca' : '#bfdbfe') : (staffingIssues.length > 0 ? '#fecaca' : '#bbf7d0')}`, borderRadius: '12px', padding: '0.75rem 0.9rem', marginBottom: '0.75rem' }}>
                    <div style={{ color: isNonMedical ? (staffingIssues.length > 0 ? '#b91c1c' : '#1e40af') : (staffingIssues.length > 0 ? '#b91c1c' : '#15803d'), fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }}>{staffingState}</div>
                    <div style={{ color: '#0f172a', fontSize: '0.9rem', fontWeight: 600, marginTop: '0.25rem' }}>
                      {staffingIssues.length > 0 ? `Cần bổ sung ${staffingIssues.join(', ')}` : (isNonMedical ? (isCleaning ? 'Nhân viên vệ sinh và bảo vệ' : (isAdminOnly ? 'Nhân viên hành chính' : 'Nhân viên chuyên trách')) : 'Đã đáp ứng đủ nhân sự cơ bản')}
                    </div>
                  </div>

                  <div style={{ borderTop: `1px solid ${color}22`, paddingTop: '0.875rem' }}>
                    <p style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                      {isNonMedical ? 'DANH SÁCH NHÂN VIÊN' : 'DANH SÁCH BÁC SĨ'}
                    </p>
                    {isNonMedical ? (
                       (dept.doctors.length > 0 || dept.nurses.length > 0) ? [...dept.doctors, ...dept.nurses].map((staff: any) => (
                        <div key={staff.id} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.4rem 0' }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0f172a', fontSize: '0.75rem', fontWeight: 700 }}>
                            {staff.user.name.split(' ').at(-1)?.[0]}
                          </div>
                          <div>
                            <div style={{ color: '#0f172a', fontSize: '0.85rem', fontWeight: 600 }}>{staff.user.name}</div>
                            <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{staff.position || staff.specialty || 'Nhân viên'}</div>
                          </div>
                        </div>
                      )) : <p style={{ color: '#475569', fontSize: '0.8rem' }}>Chưa có nhân viên</p>
                    ) : (
                      dept.doctors.length > 0 ? dept.doctors.map(doc => (
                        <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.4rem 0' }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0f172a', fontSize: '0.75rem', fontWeight: 700 }}>
                            {doc.user.name.split(' ').at(-1)?.[0]}
                          </div>
                          <div>
                            <div style={{ color: '#0f172a', fontSize: '0.85rem', fontWeight: 600 }}>{doc.user.name}</div>
                            <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{doc.specialty}</div>
                          </div>
                        </div>
                      )) : <p style={{ color: '#475569', fontSize: '0.8rem' }}>Chưa có bác sĩ</p>
                    )}
                  </div>

                  {!isNonMedical && (
                    <div style={{ borderTop: `1px solid ${color}22`, paddingTop: '0.75rem', marginTop: '0.8rem' }}>
                      <p style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>Y TÁ & PHÒNG</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0f172a', fontSize: '0.82rem' }}>
                        <span>{dept._count.nurses} y tá</span>
                        <span>{dept._count.rooms} phòng</span>
                      </div>
                      {dept.nurses.length > 0 && (
                        <div style={{ marginTop: '0.5rem' }}>
                          {dept.nurses.slice(0, 3).map((nurse) => (
                            <div key={nurse.id} style={{ color: '#475569', fontSize: '0.8rem', padding: '0.2rem 0' }}>• {nurse.user.name}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardShell>
  );
}

function StatusPill({ label, ok }: { label: string; ok: boolean }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      borderRadius: '999px',
      padding: '0.3rem 0.75rem',
      fontSize: '0.72rem',
      fontWeight: 700,
      background: ok ? '#dcfce7' : '#fee2e2',
      color: ok ? '#15803d' : '#dc2626',
      border: `1px solid ${ok ? '#86efac' : '#fca5a5'}`,
    }}>
      {ok ? '✓ ' : '✗ '}{label}
    </span>
  );
}



