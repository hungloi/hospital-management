import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function AuthRedirectPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const role = (session.user as any).role;

  switch (role) {
    case 'ADMIN':
      redirect('/admin');
    case 'DIRECTOR':
    case 'DEPUTY_DIRECTOR':
      redirect('/director');
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
