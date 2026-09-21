import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import PrintClient from '@/app/print/PrintClient';

export default async function PrescriptionPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const { id } = await params;
  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: {
      patient: true,
      doctor: { include: { user: true, department: true } },
      prescription: { include: { items: { include: { medicine: true } } } }
    }
  });

  if (!appointment) notFound();

  return (
    <PrintClient title="ĐƠN THUỐC">
      <div style={{ marginBottom: '20px' }}>
        <p><strong>Họ và tên bệnh nhân:</strong> {appointment.patient.name} &nbsp;&nbsp;&nbsp; <strong>Tuổi:</strong> {appointment.patient.dob ? new Date().getFullYear() - new Date(appointment.patient.dob).getFullYear() : 'N/A'} &nbsp;&nbsp;&nbsp; <strong>Giới tính:</strong> {appointment.patient.gender === 'MALE' ? 'Nam' : 'Nữ'}</p>
        <p><strong>Địa chỉ:</strong> {appointment.patient.address || 'Chưa cập nhật'}</p>
        <p><strong>Chẩn đoán:</strong> {appointment.diagnosis}</p>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid black', padding: '8px', textAlign: 'left' }}>STT</th>
            <th style={{ border: '1px solid black', padding: '8px', textAlign: 'left' }}>Tên thuốc</th>
            <th style={{ border: '1px solid black', padding: '8px', textAlign: 'left' }}>Liều dùng</th>
            <th style={{ border: '1px solid black', padding: '8px', textAlign: 'left' }}>Số ngày</th>
            <th style={{ border: '1px solid black', padding: '8px', textAlign: 'left' }}>Cách dùng</th>
          </tr>
        </thead>
        <tbody>
          {appointment.prescription?.items.map((item, index) => (
            <tr key={item.id}>
              <td style={{ border: '1px solid black', padding: '8px' }}>{index + 1}</td>
              <td style={{ border: '1px solid black', padding: '8px' }}><strong>{(item as any).medicine?.name || 'Unknown'}</strong></td>
              <td style={{ border: '1px solid black', padding: '8px' }}>{item.dosage}</td>
              <td style={{ border: '1px solid black', padding: '8px' }}>{item.duration}</td>
              <td style={{ border: '1px solid black', padding: '8px' }}>{item.instructions}</td>
            </tr>
          ))}
          {(!appointment.prescription || appointment.prescription.items.length === 0) && (
            <tr>
              <td colSpan={5} style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>Không có thuốc</td>
            </tr>
          )}
        </tbody>
      </table>

      <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ textAlign: 'center' }}>
          <p><em>Ngày {new Date(appointment.date).getDate()} tháng {new Date(appointment.date).getMonth() + 1} năm {new Date(appointment.date).getFullYear()}</em></p>
          <p><strong>Bác sĩ điều trị</strong></p>
          <div style={{ height: '80px' }}></div>
          <p><strong>{appointment.doctor.user.name}</strong></p>
        </div>
      </div>
    </PrintClient>
  );
}
