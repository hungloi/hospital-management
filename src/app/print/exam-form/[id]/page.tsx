import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import PrintClient from '../../PrintClient';

export default async function ExamFormPrintPage({ params }: { params: Promise<{ id: string }> }) {
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
    <PrintClient title="PHIẾU KHÁM BỆNH">
      <div style={{ marginBottom: '20px', lineHeight: '1.8' }}>
        <p><strong>1. Thông tin người bệnh:</strong></p>
        <p style={{ paddingLeft: '20px' }}>Họ và tên: {appointment.patient.name} &nbsp;&nbsp;&nbsp; Tuổi: {appointment.patient.dob ? Math.floor((Date.now() - new Date(appointment.patient.dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25)) : '—'} &nbsp;&nbsp;&nbsp; Giới tính: {appointment.patient.gender === 'MALE' ? 'Nam' : 'Nữ'}</p>
        <p style={{ paddingLeft: '20px' }}>Địa chỉ: {appointment.patient.address || 'Chưa cập nhật'}</p>
        <p style={{ paddingLeft: '20px' }}>Điện thoại: {appointment.patient.phone || 'Chưa cập nhật'}</p>
        
        <p style={{ marginTop: '20px' }}><strong>2. Thông tin lâm sàng:</strong></p>
        <p style={{ paddingLeft: '20px' }}>Lý do khám (Triệu chứng): {appointment.notes || 'Không ghi nhận'}</p>
        <p style={{ paddingLeft: '20px' }}>Chẩn đoán sơ bộ: {appointment.diagnosis || 'Chưa có kết luận'}</p>

        <p style={{ marginTop: '20px' }}><strong>3. Lời dặn của bác sĩ:</strong></p>
        <p style={{ paddingLeft: '20px' }}>- Vui lòng tuân thủ đúng đơn thuốc (nếu có).</p>
        <p style={{ paddingLeft: '20px' }}>- Tái khám sau khi hết thuốc hoặc khi có dấu hiệu bất thường.</p>
        <p style={{ paddingLeft: '20px' }}>- Chế độ ăn uống sinh hoạt điều độ.</p>
      </div>

      <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ textAlign: 'center' }}>
          <p><em>Ngày {new Date(appointment.date).getDate()} tháng {new Date(appointment.date).getMonth() + 1} năm {new Date(appointment.date).getFullYear()}</em></p>
          <p><strong>Bác sĩ khám bệnh</strong></p>
          <div style={{ height: '80px' }}></div>
          <p><strong>{appointment.doctor.user.name}</strong></p>
        </div>
      </div>
    </PrintClient>
  );
}
