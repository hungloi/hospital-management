'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from '../login/page.module.css';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!name.trim() || !phone.trim() || !password.trim()) {
      setError('Vui lòng điền đủ họ tên, số điện thoại và mật khẩu.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          password: password.trim(),
          email: email.trim() || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data?.message || 'Đăng ký không thành công. Vui lòng thử lại.');
        return;
      }

      setMessage('Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.');
      setName('');
      setPhone('');
      setPassword('');
      setEmail('');
    } catch (err) {
      setError('Lỗi hệ thống. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.authGrid}>
        <section className={styles.brandPanel}>
          <div>
            <div className={styles.brandBadge}>
              <span>HL</span>
              <span>Đăng ký bệnh nhân</span>
            </div>
            <h1 className={styles.brandTitle}>Tạo tài khoản bệnh nhân mới</h1>
            <p className={styles.brandDescription}>
              Đăng ký tài khoản để đặt lịch khám, tra cứu kết quả và theo dõi hồ sơ sức khỏe trực tuyến.
            </p>
          </div>

          <div className={styles.portalCards}>
            <Link href="/login" className={styles.portalCard}>
              <div className={styles.portalTitle}>Đã có tài khoản?</div>
              <div className={styles.portalSubtitle}>Đăng nhập ngay để tiếp tục sử dụng dịch vụ.</div>
            </Link>
          </div>
        </section>

        <section className={styles.formPanel}>
          <div className={styles.formHeader}>
            <div className={styles.formLabel}>Đăng ký bệnh nhân</div>
            <h2 className={styles.formTitle}>Khám chữa bệnh dễ dàng hơn với tài khoản của bạn</h2>
            <p className={styles.formText}>
              Điền thông tin cơ bản để tạo tài khoản, sau đó đăng nhập và đặt lịch khám trực tuyến.
            </p>
          </div>

          <form className={styles.loginForm} onSubmit={handleSubmit}>
            {error ? (
              <div style={{ padding: '1rem', borderRadius: '16px', background: '#fee2e2', color: '#b91c1c' }}>
                {error}
              </div>
            ) : null}
            {message ? (
              <div style={{ padding: '1rem', borderRadius: '16px', background: '#dbeafe', color: '#1d4ed8' }}>
                {message}
              </div>
            ) : null}

            <div className={styles.fieldGroup}>
              <label htmlFor="fullname">Họ và tên</label>
              <input
                type="text"
                id="fullname"
                name="fullname"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Nguyễn Văn A"
              />
            </div>
            <div className={styles.fieldGroup}>
              <label htmlFor="phone">Số điện thoại</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                required
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="0905123456"
              />
            </div>
            <div className={styles.fieldGroup}>
              <label htmlFor="email">Email (tùy chọn)</label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@example.com"
              />
            </div>
            <div className={styles.fieldGroup}>
              <label htmlFor="password">Mật khẩu</label>
              <input
                type="password"
                id="password"
                name="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Tạo mật khẩu"
              />
            </div>
            <button type="submit" className={styles.submitButton} disabled={loading}>
              {loading ? 'Đang gửi...' : 'Hoàn tất đăng ký'}
            </button>
          </form>

          <div className={styles.formNote}>
            Nhân sự bệnh viện đã có tài khoản sẵn. Nếu bạn là bác sĩ hoặc nhân viên, vui lòng dùng mục Đăng nhập.
          </div>
        </section>
      </div>
    </div>
  );
}
