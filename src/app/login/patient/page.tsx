import Image from 'next/image';
import Link from 'next/link';
import { signIn, auth } from '@/auth';
import { redirect } from 'next/navigation';
import styles from '../page.module.css';

export default async function PatientLoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect('/patient');
  }

  return (
    <div className={styles.page}>
      <div className={styles.authGrid}>
        <section className={styles.brandPanel}>
          <div>
            <div className={styles.brandBadge}>
              <Image src="/clinic-logo.png" alt="Logo Bệnh viện Hưng Lợi" width={40} height={40} />
              <span>Cổng bệnh nhân</span>
            </div>
            <h1 className={styles.brandTitle}>Đăng nhập bệnh nhân</h1>
            <p className={styles.brandDescription}>
              Sử dụng tài khoản bệnh nhân để xem lịch hẹn, hồ sơ và đơn thuốc của bạn.
            </p>
          </div>

          <div className={styles.portalCards}>
            <Link href="/login/staff" className={styles.portalCard}>
              <div className={styles.portalTitle}>Cổng nhân viên</div>
              <div className={styles.portalSubtitle}>Dành riêng cho nhân viên bệnh viện.</div>
            </Link>
            <Link href="/login" className={styles.portalCard}>
              <div className={styles.portalTitle}>Quay lại lựa chọn</div>
              <div className={styles.portalSubtitle}>Chọn lại cổng đăng nhập nếu cần.</div>
            </Link>
          </div>
        </section>

        <section className={styles.formPanel}>
          <div className={styles.formHeader}>
            <div className={styles.formLabel}>Đăng nhập bệnh nhân</div>
            <h2 className={styles.formTitle}>Tiếp tục hành trình chăm sóc sức khỏe</h2>
            <p className={styles.formText}>Nhập email và mật khẩu bệnh nhân được cấp để đăng nhập.</p>
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
                  redirect(`/login/patient?error=${encodeURIComponent(error)}`);
                  return;
                }
                redirect('/auth/redirect');
              } catch (reason) {
                const errorPayload = reason as { type?: string; name?: string; message?: string };
                const maybeType = errorPayload?.type || errorPayload?.name || errorPayload?.message || 'CredentialsSignin';
                console.error('CredentialsSignin (throw):', maybeType, reason);
                redirect(`/login/patient?error=${encodeURIComponent(maybeType)}`);
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
            Chỉ dùng tài khoản bệnh nhân. Nếu bạn là nhân viên, hãy chuyển sang cổng nhân viên.
          </div>
        </section>
      </div>
    </div>
  );
}
