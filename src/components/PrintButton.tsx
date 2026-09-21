'use client';

export default function PrintButton() {
  return (
    <div style={{ textAlign: 'center', marginTop: '20px' }}>
      <button 
        onClick={() => window.print()} 
        style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', backgroundColor: '#1e40af', color: 'white', border: 'none', borderRadius: '5px' }}
        className="no-print"
      >
        🖨️ In trang này
      </button>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
