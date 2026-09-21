import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import BookingLink from '@/components/BookingLink';

export default async function DoctorsPage() {
  const doctors = await prisma.doctor.findMany({
    include: { user: true },
  });

  const specialtyColors: Record<string, string> = {
    'Nội khoa': '#0ea5e9',
    'Nhi khoa': '#10b981',
    'Da liễu': '#f59e0b',
    'Tiêu hóa': '#8b5cf6',
    'Đa khoa': '#64748b',
  };

  return (
    <div className="container" style={{ padding: '4rem 0' }}>
      <style>{`
        .doctor-card { transition: transform 0.2s, box-shadow 0.2s; }
        .doctor-card:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(0,0,0,0.12); }
      `}</style>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '1rem' }}>
          Đội ngũ Bác sĩ
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
          Chuyên gia y tế hàng đầu, tận tâm chăm sóc sức khỏe của bạn
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {doctors.map((doctor) => {
          const color = specialtyColors[doctor.specialty] || '#64748b';
          const initials = doctor.user.name.split(' ').slice(-2).map((n: string) => n[0]).join('');
          return (
            <div key={doctor.id} className="glass doctor-card" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              {/* Avatar header */}
              <div style={{ background: `linear-gradient(135deg, ${color}22, ${color}44)`, padding: '2rem', textAlign: 'center', borderBottom: `3px solid ${color}` }}>
                <div style={{
                  width: '80px', height: '80px', borderRadius: '50%',
                  background: color, color: '#0f172a',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.75rem', fontWeight: 700, margin: '0 auto 1rem'
                }}>
                  {initials}
                </div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-dark)', margin: 0 }}>
                  {doctor.user.name}
                </h2>
                <span style={{
                  display: 'inline-block', marginTop: '0.5rem',
                  padding: '0.25rem 0.75rem', borderRadius: '20px',
                  backgroundColor: `${color}22`, color: color,
                  fontSize: '0.85rem', fontWeight: 600
                }}>
                  {doctor.specialty}
                </span>
              </div>

              {/* Body */}
              <div style={{ padding: '1.5rem' }}>
                {doctor.bio && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                    {doctor.bio}
                  </p>
                )}
                <BookingLink href={`/booking?doctorId=${doctor.id}`} style={{
                  display: 'block', textAlign: 'center',
                  padding: '0.75rem', borderRadius: 'var(--radius-md)',
                  backgroundColor: color, color: 'white',
                  fontWeight: 600, textDecoration: 'none'
                }}>
                  Đặt lịch khám
                </BookingLink>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
