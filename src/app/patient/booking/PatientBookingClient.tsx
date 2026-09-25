'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { submitBooking } from '@/app/actions/bookingActions';
import Image from 'next/image';

export default function PatientBookingClient({ patient, user, departments }: { patient: any, user: any, departments: any[] }) {
  const router = useRouter();
  
  // Step 1: form
  // Step 2: success
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // Form state
  const [examType, setExamType] = useState('BHYT');
  const [bookMode, setBookMode] = useState('SCHEDULE');
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [reason, setReason] = useState('');
  const [bhytCode, setBhytCode] = useState('DN4720001234567');
  const [bhytLevel, setBhytLevel] = useState('100%');
  
  // Patient info state (from props if available)
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(patient?.phone || user?.phone || '');
  const [dob, setDob] = useState(patient?.dob ? new Date(patient.dob).toISOString().split('T')[0] : '');
  const [gender, setGender] = useState(patient?.gender || 'MALE');
  const [cccd, setCccd] = useState('');
  const [address, setAddress] = useState(patient?.address || '');

  // Ticket data generated after success
  const [ticketData, setTicketData] = useState<any>(null);

  const selectedDept = departments.find(d => d.id === selectedDeptId);
  const doctors = selectedDept?.doctors || [];
  const selectedDoctor = doctors.find((d: any) => d.id === selectedDoctorId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeptId || !date || !time) {
      setMessage('Vui lòng chọn Khoa khám, ngày và giờ khám.');
      return;
    }

    setLoading(true);
    setMessage('');
    
    // Convert date + time to ISO
    const dateTime = new Date(`${date}T${time}`);

    const formData = new FormData();
    formData.append('patientId', user.id);
    formData.append('email', user.email || '');
    formData.append('name', name);
    formData.append('phone', phone);
    formData.append('departmentId', selectedDeptId);
    if (selectedDoctorId) formData.append('doctorId', selectedDoctorId);
    formData.append('date', dateTime.toISOString());
    formData.append('notes', reason);
    formData.append('type', examType);

    const res = await submitBooking(formData);
    setLoading(false);

    if (res.success) {
      setTicketData({
        ticketCode: `PK-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        patientCode: patient?.id?.slice(0, 8).toUpperCase() || 'BN000001',
        name,
        date: date.split('-').reverse().join('/'),
        time,
        deptName: selectedDept?.name || '',
        room: selectedRoom || 'Phòng 102',
        doctorName: selectedDoctor?.user?.name || 'Chưa chỉ định',
        queueNo: `A0${Math.floor(Math.random() * 90) + 10}`,
        examType: examType === 'BHYT' ? 'Khám BHYT' : 'Khám dịch vụ',
        bookMode: bookMode === 'SCHEDULE' ? 'Đặt lịch' : 'Khám trong ngày',
        reason,
        dob: dob ? dob.split('-').reverse().join('/') : '',
        gender: gender === 'MALE' ? 'Nam' : 'Nữ',
        phone,
        cccd,
        address,
        bhyt: examType === 'BHYT' ? bhytCode : '',
        bhytLevel: examType === 'BHYT' ? bhytLevel : ''
      });
      setStep(2);
      window.scrollTo(0, 0);
    } else {
      setMessage(res.error || 'Có lỗi xảy ra');
    }
  };

  const PrintableTicket = ({ data }: { data: any }) => (
    <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #2563eb', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ width: '60px', height: '60px', background: '#2563eb', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2rem' }}>
            🏥
          </div>
          <div>
            <h3 style={{ color: '#1e3a8a', margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>BỆNH VIỆN ĐA KHOA</h3>
            <h2 style={{ color: '#2563eb', margin: '0.2rem 0', fontSize: '1.5rem', fontWeight: 900 }}>HƯNG LỢI</h2>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Sức khỏe của bạn - Trách nhiệm của chúng tôi</p>
          </div>
        </div>
        <div style={{ fontSize: '0.85rem', color: '#475569', textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <div>📍 Địa chỉ: 123 Nguyễn Văn Cừ, P. An Khánh, Ninh Kiều, Cần Thơ</div>
          <div>📞 Điện thoại: 0292 3 456 789</div>
          <div>🌐 Website: www.hungloi.vn</div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ color: '#1e3a8a', fontSize: '1.6rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>PHIẾU ĐĂNG KÝ KHÁM BỆNH</h2>
        <p style={{ color: '#64748b', margin: 0 }}>(Dành cho bệnh nhân)</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: '#e2e8f0', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', marginBottom: '1.5rem' }}>
        <div style={{ background: 'white', padding: '1rem', display: 'grid', gap: '0.75rem' }}>
          <DetailRow label="Mã phiếu" value={data?.ticketCode} bold />
          <DetailRow label="Mã bệnh nhân" value={data?.patientCode} />
          <DetailRow label="Họ tên" value={data?.name} bold />
          <DetailRow label="Ngày sinh" value={data?.dob} />
          <DetailRow label="Giới tính" value={data?.gender} />
          <DetailRow label="Số điện thoại" value={data?.phone} />
          <DetailRow label="CCCD" value={data?.cccd} />
          <DetailRow label="Địa chỉ" value={data?.address} />
          {data?.bhyt && <DetailRow label="BHYT" value={data?.bhyt} />}
          {data?.bhytLevel && <DetailRow label="Mức hưởng" value={data?.bhytLevel} />}
        </div>
        <div style={{ background: 'white', padding: '1rem', display: 'grid', gap: '0.75rem' }}>
          <DetailRow label="Loại khám" value={data?.examType} bold />
          <DetailRow label="Khoa khám" value={data?.deptName} />
          <DetailRow label="Phòng khám" value={data?.room} />
          <DetailRow label="Bác sĩ" value={data?.doctorName} />
          <DetailRow label="Chuyên khoa" value="Nội tổng quát" />
          <DetailRow label="Ngày khám" value={data?.date} bold color="#2563eb" />
          <DetailRow label="Giờ khám" value={data?.time} bold color="#2563eb" />
          <DetailRow label="Hình thức" value={data?.bookMode} />
          <DetailRow label="Lý do khám" value={data?.reason} />
        </div>
      </div>

      {step === 2 && (
        <>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ color: '#2563eb', fontSize: '2rem' }}>🎫</div>
              <div>
                <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>Số thứ tự khám</div>
                <div style={{ color: '#1e3a8a', fontSize: '2rem', fontWeight: 800 }}>{data?.queueNo}</div>
              </div>
            </div>
            <div style={{ background: '#dcfce7', color: '#16a34a', padding: '0.5rem 1.5rem', borderRadius: '999px', fontWeight: 700 }}>
              ĐÃ ĐĂNG KÝ
            </div>
          </div>

          <div style={{ background: '#eff6ff', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ color: '#1d4ed8', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              ℹ️ Hướng dẫn:
            </div>
            <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#1e3a8a', fontSize: '0.9rem', display: 'grid', gap: '0.3rem' }}>
              <li>Vui lòng có mặt tại phòng khám trước giờ khám và theo dõi số thứ tự trên hệ thống.</li>
              <li>Mang theo CCCD và thẻ BHYT (nếu có) khi đến bệnh viện.</li>
            </ul>
          </div>
        </>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem' }}>
          <div style={{ width: '80px', height: '80px', background: '#f1f5f9', border: '1px dashed #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}>
            <div style={{ width: '100%', height: '100%', background: 'url("https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=BVHL-BOOKING") center/contain no-repeat' }} />
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Quét mã QR để tra cứu<br/>thông tin phiếu khám
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '0.2rem' }}>Cần Thơ, ngày {new Date().getDate()} tháng {new Date().getMonth()+1} năm {new Date().getFullYear()}</div>
          <div style={{ fontWeight: 700, color: '#1e3a8a', marginBottom: '3rem' }}>Người lập phiếu</div>
          <div style={{ fontStyle: 'italic', color: '#475569' }}>(Ký, ghi rõ họ tên)</div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '2rem', borderTop: '1px dashed #cbd5e1', paddingTop: '1rem', color: '#2563eb', fontWeight: 600, fontSize: '0.9rem' }}>
        Vì sức khỏe cộng đồng
      </div>

      {step === 2 && (
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
          <button style={actionBtnStyle}>🖨️ In phiếu</button>
          <button style={actionBtnStyle}>📄 Xuất PDF</button>
          <button style={actionBtnStyle}>✉️ Gửi phiếu</button>
          <button style={{ ...actionBtnStyle, color: '#dc2626', borderColor: '#fca5a5', background: 'white' }}>✕ Đóng</button>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
      {/* LEFT COLUMN */}
      <div>
        {step === 1 && (
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
            {message && <div style={{ color: 'red', padding: '1rem', background: '#fef2f2', borderRadius: '8px' }}>{message}</div>}
            
            {/* CARD 1 */}
            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>1. Thông tin bệnh nhân</h2>
                <button type="button" style={{ background: '#2563eb', color: 'white', border: 'none', padding: '0.4rem 1rem', borderRadius: '6px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
                  Chọn bệnh nhân
                </button>
              </div>
              <div style={{ padding: '1.5rem', display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Mã bệnh nhân</label>
                  <input type="text" value={patient?.id?.slice(0, 8).toUpperCase() || 'BN000001'} disabled style={{ ...inputStyle, background: '#f1f5f9' }} />
                </div>
                <div>
                  <label style={labelStyle}>Họ và tên</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} style={inputStyle} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={labelStyle}>Ngày sinh</label>
                    <input type="date" value={dob} onChange={e => setDob(e.target.value)} style={inputStyle} required />
                  </div>
                  <div>
                    <label style={labelStyle}>Giới tính</label>
                    <select value={gender} onChange={e => setGender(e.target.value)} style={inputStyle}>
                      <option value="MALE">Nam</option>
                      <option value="FEMALE">Nữ</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Số điện thoại</label>
                  <input type="text" value={phone} onChange={e => setPhone(e.target.value)} style={inputStyle} required />
                </div>
                <div>
                  <label style={labelStyle}>CCCD</label>
                  <input type="text" value={cccd} onChange={e => setCccd(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Địa chỉ</label>
                  <input type="text" value={address} onChange={e => setAddress(e.target.value)} style={inputStyle} />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={labelStyle}>BHYT</label>
                    <input type="text" value={bhytCode} onChange={e => setBhytCode(e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Mức hưởng</label>
                    <select value={bhytLevel} onChange={e => setBhytLevel(e.target.value)} style={inputStyle}>
                      <option value="100%">100%</option>
                      <option value="80%">80%</option>
                      <option value="0%">0%</option>
                    </select>
                  </div>
                </div>

                <div style={{ background: '#eff6ff', color: '#1d4ed8', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  ℹ️ Bệnh nhân có thẻ BHYT, mức hưởng 100% (đúng tuyến).
                </div>
              </div>
            </div>

            {/* CARD 2 */}
            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>2. Thông tin đăng ký khám</h2>
              </div>
              <div style={{ padding: '1.5rem', display: 'grid', gap: '1rem' }}>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.9rem', color: '#64748b' }}>Loại khám</label>
                  <div style={{ display: 'flex', gap: '1.5rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input type="radio" name="extype" checked={examType === 'BHYT'} onChange={() => setExamType('BHYT')} /> BHYT
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input type="radio" name="extype" checked={examType === 'SERVICE'} onChange={() => setExamType('SERVICE')} /> Khám dịch vụ
                    </label>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.9rem', color: '#64748b' }}>Khoa khám</label>
                  <select value={selectedDeptId} onChange={e => setSelectedDeptId(e.target.value)} style={inputStyle} required>
                    <option value="">Chọn khoa khám</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.9rem', color: '#64748b' }}>Phòng khám</label>
                  <select value={selectedRoom} onChange={e => setSelectedRoom(e.target.value)} style={inputStyle}>
                    <option value="Phòng 102">Phòng 102</option>
                    <option value="Phòng 105">Phòng 105</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.9rem', color: '#64748b' }}>Bác sĩ</label>
                  <select value={selectedDoctorId} onChange={e => setSelectedDoctorId(e.target.value)} style={inputStyle}>
                    <option value="">Tùy chọn bác sĩ</option>
                    {doctors.map((d: any) => <option key={d.id} value={d.id}>{d.user.name}</option>)}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.9rem', color: '#64748b' }}>Chuyên khoa</label>
                  <input type="text" value={selectedDoctor?.specialty || 'Nội tổng quát'} disabled style={{ ...inputStyle, background: '#f1f5f9' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.9rem', color: '#64748b' }}>Ngày khám</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle} required />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.9rem', color: '#64748b' }}>Giờ khám</label>
                  <input type="time" value={time} onChange={e => setTime(e.target.value)} style={inputStyle} required />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.9rem', color: '#64748b' }}>Hình thức</label>
                  <div style={{ display: 'flex', gap: '1.5rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input type="radio" name="bmode" checked={bookMode === 'SCHEDULE'} onChange={() => setBookMode('SCHEDULE')} /> Đặt lịch
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input type="radio" name="bmode" checked={bookMode === 'TODAY'} onChange={() => setBookMode('TODAY')} /> Khám trong ngày
                    </label>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', alignItems: 'start' }}>
                  <label style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '0.5rem' }}>Lý do khám</label>
                  <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Đau tức ngực, mệt mỏi kéo dài..."></textarea>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', padding: '1rem 1.5rem', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <button type="button" onClick={() => router.push('/patient')} style={{ padding: '0.6rem 1.5rem', border: '1px solid #cbd5e1', background: 'white', borderRadius: '8px', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
                  Hủy
                </button>
                <button type="submit" disabled={loading} style={{ padding: '0.6rem 1.5rem', border: 'none', background: '#2563eb', color: 'white', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  📅 {loading ? 'Đang xử lý...' : 'Đăng ký khám'}
                </button>
              </div>
            </div>
          </form>
        )}

        {step === 2 && ticketData && (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div style={{ background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ background: '#22c55e', color: 'white', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>✓</div>
              <div>
                <h3 style={{ margin: '0 0 0.25rem 0', color: '#166534', fontSize: '1.1rem' }}>Đăng ký khám bệnh thành công!</h3>
                <p style={{ margin: 0, color: '#15803d', fontSize: '0.9rem' }}>Phiếu khám bệnh đã được tạo. Vui lòng lưu lại thông tin và mang theo khi đến khám.</p>
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <span style={{ background: '#eff6ff', color: '#2563eb', padding: '4px 8px', borderRadius: '6px' }}>📋</span>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>Thông tin phiếu khám</h2>
              </div>
              
              <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  <DetailRow label="Mã phiếu khám" value={ticketData.ticketCode} bold />
                  <DetailRow label="Mã bệnh nhân" value={ticketData.patientCode} />
                  <DetailRow label="Họ và tên" value={ticketData.name} />
                  <DetailRow label="Ngày khám" value={ticketData.date} />
                  <DetailRow label="Giờ khám" value={ticketData.time} />
                  <DetailRow label="Khoa khám" value={ticketData.deptName} />
                  <DetailRow label="Phòng khám" value={ticketData.room} />
                  <DetailRow label="Bác sĩ" value={ticketData.doctorName} />
                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', alignItems: 'center' }}>
                    <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Số thứ tự</span>
                    <span style={{ fontWeight: 800, color: '#22c55e', background: '#dcfce7', padding: '2px 8px', borderRadius: '4px', width: 'fit-content' }}>{ticketData.queueNo}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', borderLeft: '1px solid #e2e8f0', paddingLeft: '2rem' }}>
                  <div style={{ background: '#dcfce7', color: '#16a34a', padding: '0.4rem 1rem', borderRadius: '999px', fontWeight: 700, fontSize: '0.85rem' }}>ĐÃ ĐĂNG KÝ</div>
                  <div style={{ width: '120px', height: '120px', background: 'url("https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=BVHL-BOOKING") center/contain no-repeat' }} />
                  <div style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'center' }}>Quét mã để xem phiếu khám</div>
                </div>
              </div>

              <div style={{ padding: '1.5rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                <div style={{ color: '#1d4ed8', fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.9rem' }}>ℹ️ Hướng dẫn:</div>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#1e3a8a', fontSize: '0.85rem', display: 'grid', gap: '0.25rem' }}>
                  <li>Vui lòng có mặt tại phòng khám trước giờ khám và theo dõi số thứ tự trên hệ thống.</li>
                  <li>Mang theo CCCD và thẻ BHYT (nếu có) khi đến bệnh viện.</li>
                </ul>
              </div>

              <div style={{ padding: '1rem 1.5rem', display: 'flex', gap: '1rem', borderTop: '1px solid #e2e8f0' }}>
                <button style={{ ...actionBtnStyle, background: '#2563eb', color: 'white', flex: 1, borderColor: '#2563eb' }}>🖨️ In phiếu</button>
                <button style={{ ...actionBtnStyle, flex: 1 }}>📄 Xuất PDF</button>
                <button style={{ ...actionBtnStyle, flex: 1 }}>✉️ Gửi phiếu cho bệnh nhân</button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <button onClick={() => setStep(1)} style={{ padding: '0.75rem 1.5rem', background: 'white', border: '1px dashed #cbd5e1', borderRadius: '8px', color: '#2563eb', fontWeight: 600, flex: 1, cursor: 'pointer' }}>+ Đăng ký lượt khám mới</button>
              <button onClick={() => router.push('/patient/appointments')} style={{ padding: '0.75rem 1.5rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#475569', fontWeight: 600, flex: 1, cursor: 'pointer' }}>← Quay lại</button>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN */}
      <div>
        <div style={{ position: 'sticky', top: '2rem' }}>
          <PrintableTicket data={step === 1 ? {
            ticketCode: 'PK-xxxxxxxx-xxx', patientCode: patient?.id?.slice(0, 8).toUpperCase() || 'BN000001',
            name: name || '(Chưa nhập)', dob: dob ? dob.split('-').reverse().join('/') : '', gender: gender === 'MALE' ? 'Nam' : 'Nữ',
            phone, cccd, address, bhyt: examType === 'BHYT' ? bhytCode : '', bhytLevel: examType === 'BHYT' ? bhytLevel : '',
            examType: examType === 'BHYT' ? 'Khám BHYT' : 'Khám dịch vụ', deptName: selectedDept?.name || '(Chưa chọn)',
            room: selectedRoom || '(Chưa chọn)', doctorName: selectedDoctor?.user?.name || '(Tùy chọn)', date: date ? date.split('-').reverse().join('/') : '',
            time, bookMode: bookMode === 'SCHEDULE' ? 'Đặt lịch' : 'Khám trong ngày', reason
          } : ticketData} />
        </div>
      </div>
    </div>
  );
}

const DetailRow = ({ label, value, bold, color }: { label: string, value: string, bold?: boolean, color?: string }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', alignItems: 'start', fontSize: '0.9rem' }}>
    <span style={{ color: '#64748b' }}>{label}</span>
    <span style={{ fontWeight: bold ? 700 : 500, color: color || '#0f172a' }}>{value || '-'}</span>
  </div>
);

const labelStyle = { display: 'block', fontSize: '0.85rem', color: '#475569', marginBottom: '0.4rem', fontWeight: 500 };
const inputStyle = { width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', color: '#0f172a', boxSizing: 'border-box' as const, fontSize: '0.9rem' };
const actionBtnStyle = { padding: '0.6rem 1rem', background: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#475569', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' };
