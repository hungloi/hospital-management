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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'stretch' }}>
      {paymentExists && paymentStatus === 'PENDING' ? (
        <>
          <div style={{ color: '#d97706', fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px' }}>Giao dịch chờ xử lý. Nếu không tự chuyển, bấm nút bên dưới.</div>
          <button
            onClick={createOrGetPayment}
            disabled={loading}
            style={{ width: '100%', padding: '0.85rem 1rem', background: 'linear-gradient(135deg, #1d4ed8, #2563eb)', color: 'white', borderRadius: '12px', fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.25)' }}
          >
            {loading ? 'Đang chuyển...' : 'Mở VNPay'}
          </button>
        </>
      ) : paymentExists && paymentStatus === 'PAID' ? (
        <div style={{ padding: '1rem', background: '#dcfce7', color: '#166534', borderRadius: '12px', fontWeight: 700 }}>
          Giao dịch đã thanh toán thành công.
        </div>
      ) : (
        <>
          <button
            onClick={createOrGetPayment}
            disabled={loading}
            style={{ width: '100%', padding: '0.85rem 1rem', background: 'linear-gradient(135deg, #1d4ed8, #2563eb)', color: 'white', borderRadius: '12px', fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.25)' }}
          >
            {loading ? 'Đang xử lý...' : 'Thanh toán bằng VNPay'}
          </button>
          <button
            onClick={() => alert('Vui lòng đến quầy thu ngân (Tầng 1) để đóng tiền mặt.')}
            style={{ width: '100%', padding: '0.85rem 1rem', background: '#f8fafc', color: '#334155', borderRadius: '12px', fontWeight: 700, border: '1.5px solid #e2e8f0', cursor: 'pointer' }}
          >
            Thanh toán tiền mặt
          </button>
        </>
      )}
      {error && <div style={{ color: '#ef4444', fontWeight: 600, fontSize: '0.9rem', marginTop: '4px' }}>{error}</div>}
    </div>
  );
}
