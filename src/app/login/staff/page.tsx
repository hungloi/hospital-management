import Image from 'next/image';
import Link from 'next/link';
import { signIn, auth } from '@/auth';
import { redirect } from 'next/navigation';
import styles from '../page.module.css';

export default async function StaffLoginPage() {
  const session = await auth();
  if (session?.user) {
    const role = (session.user as { role?: string }).role;
    if (role === 'ADMIN') redirect('/admin');
    if (role === 'DIRECTOR' || role === 'DEPUTY_DIRECTOR') redirect('/director');
    if (role === 'HEAD_DOCTOR' || role === 'DEPUTY_HEAD' || role === 'DOCTOR') redirect('/doctor');
    if (role === 'CHIEF_ACCOUNTANT' || role === 'ACCOUNTANT') redirect('/accountant');
    if (role === 'NURSE') redirect('/nurse');
    if (role === 'STAFF') redirect('/staff');
    redirect('/patient');
  }

  return (
    <div className={styles.page}>
      <div className={styles.authGrid}>
        <section className={styles.brandPanel}>
          <div>
            <div className={styles.brandBadge}>
              <Image src="/clinic-logo.png" alt="Logo Bệnh viện Hưng Lợi" width={40} height={40} />
              <span>Cổng nhân viên</span>
            </div>
            <h1 className={styles.brandTitle}>Đăng nhập nhân viên</h1>
            <p className={styles.brandDescription}>
              Đăng nhập bằng tài khoản nhân viên nội bộ để quản lý lịch trực, khám bệnh và vận hành.
            </p>
          </div>

          <div className={styles.portalCards}>
            <Link href="/login/patient" className={styles.portalCard}>
              <div className={styles.portalTitle}>Cổng bệnh nhân</div>
              <div className={styles.portalSubtitle}>Dành riêng cho bệnh nhân.</div>
            </Link>
            <Link href="/login" className={styles.portalCard}>
              <div className={styles.portalTitle}>Quay lại lựa chọn</div>
              <div className={styles.portalSubtitle}>Chọn lại cổng đăng nhập nếu cần.</div>
            </Link>
          </div>
        </section>

        <section className={styles.formPanel}>
          <div className={styles.formHeader}>
            <div className={styles.formLabel}>Đăng nhập nhân viên</div>
            <h2 className={styles.formTitle}>Kết nối với công việc bệnh viện</h2>
            <p className={styles.formText}>Nhập email và mật khẩu nội bộ để truy cập cổng nhân viên.</p>
          </div>

          <form
            action={async (formData) => {
              'use server';
              const data = Object.fromEntries(formData);

              try {
                const result = await signIn('credentials', { ...data, redirect: false });
                const error = typeof result === 'object' && result !== null && 'error' in result
                  ? (result as { error?: string }).error
                  : undefined;
                if (error) {
                  console.error('CredentialsSignin (result):', error);
                  redirect(`/login/staff?error=${encodeURIComponent(error)}`);
                  return;
                }
                redirect('/auth/redirect');
              } catch (reason) {
                const errorPayload = reason as { type?: string; name?: string; message?: string };
                const maybeType = errorPayload?.type || errorPayload?.name || errorPayload?.message || 'CredentialsSignin';
                console.error('CredentialsSignin (throw):', maybeType, reason);
                redirect(`/login/staff?error=${encodeURIComponent(maybeType)}`);
              }
            }}
            className={styles.loginForm}
          >
            <div className={styles.fieldGroup}>
              <label htmlFor="email">Email</label>
              <input type="email" id="email" name="email" required placeholder="name@medicare.com" />
            </div>
            <div className={styles.fieldGroup}>
              <label htmlFor="password">Mật khẩu</label>
              <input type="password" id="password" name="password" required placeholder="Nhập mật khẩu" />
            </div>
            <button type="submit" className={styles.submitButton}>Đăng nhập</button>
          </form>

          <div className={styles.formNote}>
            Chỉ dùng tài khoản nhân viên. Nếu bạn là bệnh nhân, hãy chuyển sang cổng bệnh nhân.
          </div>
        </section>
      </div>
    </div>
  );
}
