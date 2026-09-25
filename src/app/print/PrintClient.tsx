'use client';
import { useEffect } from 'react';
import '../print.css'; // Import the new beautiful print CSS

export default function PrintClient({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Automatically trigger print dialog when component mounts
    setTimeout(() => {
      window.print();
    }, 500);
  }, []);

  return (
    <div className="print-app-wrapper">
      <div className="stage">
        <div className="fit">
          {children}
        </div>
      </div>

      <div className="no-print">
        <button onClick={() => window.print()}>
          🖨️ In trang này
        </button>
      </div>
    </div>
  );
}
