import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import styles from './page.module.css';
import HomeHero from '@/components/HomeHero';
import HospitalInfo from '@/components/HospitalInfo';

export default async function Home() {
  const session = await auth();
  if (session?.user) {
    const role = (session.user as { role?: string }).role;
    if (role === 'ADMIN') redirect('/admin');
    if (role === 'DOCTOR') redirect('/doctor');
    if (role === 'PATIENT') redirect('/patient');
  }

  return (
    <main className={styles.page}>
      <HomeHero />
      <HospitalInfo />
    </main>
  );
}

