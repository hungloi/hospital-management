import BookingForm from '@/components/BookingForm';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function BookingPage() {
  const session = await auth();
  if (session?.user && (session.user as any).role === 'PATIENT') {
    redirect('/patient/booking');
  }

  const departments = await prisma.department.findMany({
    orderBy: { name: 'asc' },
    include: { doctors: { include: { user: true } } }
  });

  return (
    <div className="container" style={{ padding: '4rem 0' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '1rem' }}>
          Đặt Lịch Khám Trực Tuyến
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
          Vui lòng điền thông tin bên dưới để chúng tôi có thể sắp xếp bác sĩ phù hợp nhất cho bạn.
        </p>
      </div>
      
      <BookingForm departments={departments} />
    </div>
  );
}
