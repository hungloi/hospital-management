import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const role = (session.user as any).role;
  if (role === 'ADMIN') redirect('/admin');
  if (role === 'DOCTOR') redirect('/doctor');
  if (role === 'PATIENT') redirect('/patient');

  redirect('/login');
}
