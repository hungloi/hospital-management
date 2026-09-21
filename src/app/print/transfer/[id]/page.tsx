import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import PrintClient from '../../PrintClient';

export default async function TransferPrintPage({ params }: { params: Promise<{ id: string }> }) {
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
    <PrintClient title="GIẤY CHUYỂN TUYẾN KHÁM BỆNH, CHỮA BỆNH BHYT">
      <div style={{ marginBottom: '20px', lineHeight: '1.8', textAlign: 'justify' }}>
        <p><strong>Kính gửi: Bệnh viện / Cơ sở tiếp nhận tuyến trên</strong></p>
        <p>Bệnh viện Đa khoa Hưng Lợi trân trọng giới thiệu người bệnh:</p>
        
        <p><strong>Họ và tên:</strong> {appointment.patient.name.toUpperCase()} &nbsp;&nbsp;&nbsp; <strong>Tuổi:</strong> {appointment.patient.dob ? Math.floor((Date.now() - new Date(appointment.patient.dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25)) : '—'} &nbsp;&nbsp;&nbsp; <strong>Giới tính:</strong> {appointment.patient.gender === 'MALE' ? 'Nam' : 'Nữ'}</p>
        <p><strong>Địa chỉ:</strong> {appointment.patient.address || 'Chưa cập nhật'}</p>
        
        <p>Đã được khám và điều trị tại Bệnh viện Đa khoa Hưng Lợi từ ngày {new Date(appointment.date).toLocaleDateString('vi-VN')} đến ngày {new Date(appointment.date).toLocaleDateString('vi-VN')}.</p>
        
        <p><strong>Tóm tắt bệnh án:</strong></p>
        <p>- Dấu hiệu lâm sàng: {appointment.notes}</p>
        <p>- Chẩn đoán tuyến dưới: {appointment.diagnosis}</p>
        
        <p><strong>Lý do chuyển tuyến:</strong></p>
        <p>☐ Vượt quá khả năng điều trị của cơ sở.</p>
        <p>☑ Theo yêu cầu của người bệnh / người nhà người bệnh.</p>
      </div>

      <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ textAlign: 'center' }}>
          <p><strong>Người có thẩm quyền chuyển tuyến</strong></p>
          <div style={{ height: '80px' }}></div>
          <p><strong>GIÁM ĐỐC</strong></p>
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
