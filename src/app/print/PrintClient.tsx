'use client';
import { useEffect } from 'react';

export default function PrintClient({ children, title }: { children: React.ReactNode, title: string }) {
  useEffect(() => {
    // Automatically trigger print dialog when component mounts
    setTimeout(() => {
      window.print();
    }, 500);
  }, []);

  return (
    <div style={{ background: '#e2e8f0', minHeight: '100vh', padding: '2rem 0', fontFamily: 'Times New Roman, serif' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { background: white; margin: 0; padding: 0; }
          .print-container { box-shadow: none !important; margin: 0 !important; width: 100% !important; max-width: none !important; }
          .no-print { display: none !important; }
        }
      `}} />
      
      <div className="print-container" style={{ maxWidth: '800px', margin: '0 auto', background: 'white', padding: '40px 50px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', color: 'black' }}>
        {/* Header Bộ Y Tế */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid black', paddingBottom: '10px', marginBottom: '20px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '14px' }}>SỞ Y TẾ THÀNH PHỐ</h3>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>BỆNH VIỆN ĐA KHOA HƯNG LỢI</h2>
            <p style={{ margin: 0, fontSize: '12px' }}>Địa chỉ: 123 Đường Sức Khỏe, Quận 1, TP.HCM</p>
            <p style={{ margin: 0, fontSize: '12px' }}>Điện thoại: 1900 1234</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>Mẫu số: 01/BV</p>
            <p style={{ margin: 0, fontSize: '14px' }}>Số phiếu: {Math.floor(Math.random() * 1000000)}</p>
          </div>
        </div>

        {/* Title */}
        <h1 style={{ textAlign: 'center', fontSize: '24px', fontWeight: 'bold', margin: '20px 0 30px 0' }}>{title}</h1>

        {/* Content */}
        {children}
      </div>

      <div className="no-print" style={{ textAlign: 'center', marginTop: '20px' }}>
        <button onClick={() => window.print()} style={{ padding: '10px 20px', fontSize: '16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          🖨️ In trang này
        </button>
      </div>
    </div>
  );
}
