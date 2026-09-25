import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import DashboardShell from '@/components/DashboardShell';
import { PATIENT_NAV, PATIENT_THEME } from '@/lib/adminConfig';
import PatientBookingClient from './PatientBookingClient';

export default async function PatientBookingPage() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'PATIENT') redirect('/login');
  
  const userId = (session.user as any).id;

  const [patient, departments] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.department.findMany({
      orderBy: { name: 'asc' },
      include: { doctors: { include: { user: true } } }
    })
  ]);

  return (
    <DashboardShell 
      title={session.user.name!} 
      subtitle="BỆNH NHÂN" 
      items={PATIENT_NAV} 
      theme={PATIENT_THEME}
      footer={
        <div style={{ marginBottom: '0.5rem', padding: '0.5rem 0.75rem', background: '#dbeafe', borderRadius: '8px', color: '#2563eb', fontSize: '0.78rem', textAlign: 'center', fontWeight: 700 }}>
          🧑 BỆNH NHÂN
        </div>
      }
    >
      <div style={{ padding: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '2rem' }}>
          Đăng ký khám bệnh
        </h1>
        
        <PatientBookingClient 
          patient={patient} 
          user={session.user} 
          departments={departments} 
        />
      </div>
    </DashboardShell>
  );
}
