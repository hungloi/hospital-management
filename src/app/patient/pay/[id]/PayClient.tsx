'use client';

import React, { useState } from 'react';

type Props = {
  appointmentId: string;
  initialAmount: number;
  paymentExists: boolean;
  paymentStatus: string;
};

export default function PayClient({ appointmentId, initialAmount, paymentExists, paymentStatus }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createOrGetPayment() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId, amount: initialAmount }),
      });
      const data = await res.json();
      if (data?.url) {
        // redirect to VNPay
        window.location.href = data.url;
      } else {
        setError(data?.error || 'Không thể tạo yêu cầu thanh toán');
      }
    } catch (err: any) {
      setError(err?.message || 'Lỗi mạng');
    } finally {
      setLoading(false);
    }
  }

  // If there's an existing pending payment, try to resume it automatically once
  React.useEffect(() => {
    if (paymentExists && paymentStatus === 'PENDING') {
      // Attempt to get a VNPay URL for the existing pending payment (api will reuse txnRef if possible)
      const t = setTimeout(() => {
        createOrGetPayment();
      }, 800); // small delay to let UI settle
      return () => clearTimeout(t);
    }
  }, [paymentExists, paymentStatus]);

  return (
    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
      {paymentExists && paymentStatus === 'PENDING' ? (
        <>
          <div style={{ color: '#d97706', fontWeight: 700 }}>Giao dịch chờ xử lý. Nếu không tự chuyển, bấm nút bên cạnh để mở VNPay.</div>
          <button
            onClick={createOrGetPayment}
            disabled={loading}
            style={{ padding: '0.6rem 1rem', background: '#2563eb', color: 'white', borderRadius: '8px', fontWeight: 700, border: 'none' }}
          >
            {loading ? 'Đang chuyển...' : 'Mở VNPay'}
          </button>
        </>
      ) : paymentExists && paymentStatus === 'PAID' ? (
        <div style={{ color: '#16a34a', fontWeight: 700 }}>Lịch hẹn đã được thanh toán.</div>
      ) : (
        <>
          <button
            onClick={createOrGetPayment}
            disabled={loading}
            style={{ padding: '0.6rem 1rem', background: '#2563eb', color: 'white', borderRadius: '8px', fontWeight: 700, border: 'none' }}
          >
            {loading ? 'Đang chuyển...' : 'Thanh toán bằng VNPay'}
          </button>
          <button
            onClick={() => alert('Tùy chọn Thanh toán tiền mặt: đến quầy tiếp nhận khi đến khám')}
            style={{ padding: '0.6rem 1rem', background: '#f3f4f6', color: '#0f172a', borderRadius: '8px', fontWeight: 700, border: '1px solid #e2e8f0' }}
          >
            Thanh toán tiền mặt
          </button>
        </>
      )}
      {error && <div style={{ color: '#dc2626', fontWeight: 700 }}>{error}</div>}
    </div>
  );
}
