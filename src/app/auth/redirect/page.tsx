import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function AuthRedirectPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const role = (session.user as any).role;

  switch (role) {
    case 'ADMIN':
    case 'DIRECTOR':
      redirect('/admin');
    case 'DOCTOR':
    case 'HEAD_DOCTOR':
    case 'DEPUTY_HEAD':
      redirect('/doctor');
    case 'CHIEF_ACCOUNTANT':
    case 'ACCOUNTANT':
      redirect('/accountant');
    case 'NURSE':
      redirect('/nurse');
    case 'STAFF':
      redirect('/staff');
    case 'RECEPTIONIST':
      redirect('/reception');
    case 'PHARMACIST':
      redirect('/pharmacy');
    case 'LAB_TECH':
      redirect('/lab');
    default:
      redirect('/patient');
  }
}
