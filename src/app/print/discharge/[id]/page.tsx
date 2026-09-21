import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import PrintClient from '../../PrintClient';

export default async function DischargePrintPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const { id } = await params;
  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: {
      patient: true,
      doctor: { include: { user: true, department: true } },
    }
  });

  if (!appointment) notFound();

  return (
    <PrintClient title="GIẤY RA VIỆN">
      <div style={{ marginBottom: '20px', lineHeight: '1.8', textAlign: 'justify' }}>
        <p><strong>Bệnh viện Đa khoa Hưng Lợi chứng nhận:</strong></p>
        
        <p><strong>Họ và tên người bệnh:</strong> {appointment.patient.name.toUpperCase()} &nbsp;&nbsp;&nbsp; <strong>Tuổi:</strong> {appointment.patient.dob ? Math.floor((Date.now() - new Date(appointment.patient.dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25)) : '—'} &nbsp;&nbsp;&nbsp; <strong>Giới tính:</strong> {appointment.patient.gender === 'MALE' ? 'Nam' : 'Nữ'}</p>
        <p><strong>Địa chỉ:</strong> {appointment.patient.address || 'Chưa cập nhật'}</p>
        
        <p><strong>Khoa:</strong> {appointment.doctor.department?.name || 'Khám bệnh'}</p>
        <p><strong>Vào viện ngày:</strong> {new Date(appointment.date).toLocaleDateString('vi-VN')} &nbsp;&nbsp;&nbsp; <strong>Ra viện ngày:</strong> {new Date(appointment.date).toLocaleDateString('vi-VN')}</p>
        
        <p><strong>Chẩn đoán:</strong> {appointment.diagnosis}</p>
        <p><strong>Phương pháp điều trị:</strong> Điều trị ngoại trú nội khoa.</p>
        
        <p><strong>Lời dặn của Thầy thuốc:</strong></p>
        <p>- Tuân thủ đơn thuốc đính kèm.</p>
        <p>- Nghỉ ngơi hợp lý.</p>
        <p>- Tái khám sau 1 tuần hoặc khi có dấu hiệu bất thường.</p>
      </div>

      <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ textAlign: 'center' }}>
          <p><strong>Trưởng Khoa</strong></p>
          <div style={{ height: '80px' }}></div>
          <p><strong>(Đã ký)</strong></p>
        </div>
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
