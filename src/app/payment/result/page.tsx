'use client';
import Link from 'next/link';

export default function PaymentResultPage({ searchParams }: { searchParams: any }) {
  const status = searchParams?.status;
  const txn = searchParams?.txn;
  const amount = searchParams?.amount;
  const isSuccess = status === 'success';

  return (
    <div className="container" style={{ padding: '6rem 0', display: 'flex', justifyContent: 'center' }}>
      <div className="glass" style={{ padding: '3rem', borderRadius: 'var(--radius-lg)', maxWidth: '480px', width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
          {isSuccess ? '✅' : '❌'}
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: isSuccess ? '#16a34a' : '#dc2626', marginBottom: '0.5rem' }}>
          {isSuccess ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          {isSuccess
            ? `Giao dịch #${txn?.slice(-8).toUpperCase()} | ${Number(amount).toLocaleString('vi-VN')} VNĐ`
            : 'Giao dịch không thành công. Lịch hẹn vẫn được giữ nguyên.'}
        </p>

        {isSuccess && (
          <div style={{
            background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 'var(--radius-md)',
            padding: '1rem', marginBottom: '1.5rem', color: '#166534', fontSize: '0.9rem'
          }}>
            Lịch hẹn của bạn đã được xác nhận. Email xác nhận đã được gửi đến hộp thư của bạn.
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link href="/dashboard" style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: 'var(--primary-color)',
            color: 'white',
            borderRadius: 'var(--radius-md)',
            fontWeight: 600,
            textDecoration: 'none'
          }}>
            Xem lịch hẹn
          </Link>
          <Link href="/" style={{
            padding: '0.75rem 1.5rem',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            fontWeight: 600,
            textDecoration: 'none',
            color: 'var(--text-main)'
          }}>
            Trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
