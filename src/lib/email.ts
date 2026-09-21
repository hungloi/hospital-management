import nodemailer from 'nodemailer';

// Cấu hình Mailtrap - dùng để test email (không cần cài đặt gì thêm)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'sandbox.smtp.mailtrap.io',
  port: Number(process.env.SMTP_PORT) || 2525,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

export async function sendBookingConfirmationEmail({
  to,
  patientName,
  doctorName,
  date,
  appointmentId,
}: {
  to: string;
  patientName: string;
  doctorName: string;
  date: Date;
  appointmentId: string;
}) {
  const formattedDate = new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(new Date(date));

  const html = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8" />
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #f8fafc; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #0ea5e9, #0284c7); padding: 40px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
        .header p { margin: 8px 0 0; opacity: 0.9; font-size: 15px; }
        .body { padding: 40px; }
        .greeting { font-size: 18px; color: #1e293b; margin-bottom: 20px; }
        .info-card { background: #f1f5f9; border-radius: 12px; padding: 24px; margin: 20px 0; border-left: 4px solid #0ea5e9; }
        .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
        .info-row:last-child { border-bottom: none; }
        .info-label { color: #64748b; font-weight: 500; }
        .info-value { color: #1e293b; font-weight: 600; }
        .badge { display: inline-block; background: #dcfce7; color: #16a34a; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600; margin-top: 4px; }
        .cta { text-align: center; margin: 30px 0; }
        .btn { background: linear-gradient(135deg, #0ea5e9, #0284c7); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block; }
        .footer { text-align: center; padding: 24px 40px; color: #94a3b8; font-size: 13px; background: #f8fafc; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏥 MediCare</h1>
          <p>Xác nhận lịch hẹn khám bệnh</p>
        </div>
        <div class="body">
          <p class="greeting">Xin chào <strong>${patientName}</strong>,</p>
          <p style="color:#475569;">Lịch hẹn khám bệnh của bạn đã được đặt thành công. Dưới đây là thông tin chi tiết:</p>
          
          <div class="info-card">
            <div class="info-row">
              <span class="info-label">Mã lịch hẹn</span>
              <span class="info-value">#${appointmentId.slice(-8).toUpperCase()}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Bác sĩ</span>
              <span class="info-value">${doctorName}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Thời gian khám</span>
              <span class="info-value">${formattedDate}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Trạng thái</span>
              <span class="info-value"><span class="badge">✓ Đã xác nhận</span></span>
            </div>
          </div>

          <p style="color:#475569; font-size:14px;">
            📍 <strong>Lưu ý:</strong> Vui lòng đến trước 15 phút để hoàn tất thủ tục đăng ký tại quầy lễ tân.
          </p>

          <div class="cta">
            <a href="http://localhost:3000/dashboard" class="btn">Xem lịch hẹn của tôi</a>
          </div>
        </div>
        <div class="footer">
          <p>© 2025 MediCare Hospital. Mọi thắc mắc xin liên hệ: <strong>support@medicare.vn</strong></p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: '"MediCare Hospital" <no-reply@medicare.vn>',
      to,
      subject: `✅ Xác nhận lịch hẹn khám - ${formattedDate}`,
      html,
    });
    console.log('✅ Email xác nhận đã được gửi đến:', to);
  } catch (err) {
    console.error('❌ Lỗi gửi email:', err);
    // Không throw - email thất bại không làm hỏng booking
  }
}
