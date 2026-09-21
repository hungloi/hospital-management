'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { submitBooking } from '@/app/actions/bookingActions';

export default function BookingForm({ departments }: { departments: any[] }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const [selectedDept, setSelectedDept] = useState('');
  const [examType, setExamType] = useState('SERVICE');

  const [defaultName, setDefaultName] = useState('');
  const [defaultEmail, setDefaultEmail] = useState('');
  const [defaultPhone, setDefaultPhone] = useState('');
  const [editableContacts, setEditableContacts] = useState(false);

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      setDefaultName(session.user.name || '');
      setDefaultEmail((session.user as any).email || '');
      setDefaultPhone((session.user as any).phone || '');
    }
  }, [status, session]);

  const selectedDeptData = departments.find(d => d.id === selectedDept);
  const doctors = selectedDeptData?.doctors || [];

  const validatePhone = (p: string) => {
    const cleaned = p.replace(/[^0-9]/g, '');
    return cleaned.length >= 9 && cleaned.length <= 12;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);

    const phone = (formData.get('phone') as string) || '';
    const dateStr = (formData.get('date') as string) || '';

    if (!validatePhone(phone)) {
      setMessage('Số điện thoại không hợp lệ. Vui lòng kiểm tra.');
      setLoading(false);
      return;
    }

    if (!dateStr) {
      setMessage('Vui lòng chọn ngày giờ khám.');
      setLoading(false);
      return;
    }

    const chosenDate = new Date(dateStr);
    if (isNaN(chosenDate.getTime()) || chosenDate < new Date()) {
      setMessage('Vui lòng chọn ngày giờ trong tương lai.');
      setLoading(false);
      return;
    }

    // include patientId when logged in to avoid duplicate user creation
    if (status === 'authenticated' && session?.user?.id) {
      formData.set('patientId', (session.user as any).id);
    }

    const result = await submitBooking(formData);
    
    if (result.success) {
      // redirect to patient appointments
      router.push('/patient/appointments');
      return;
    } else {
      setMessage(result.error || 'Có lỗi xảy ra. Vui lòng thử lại.');
    }
    setLoading(false);
  };

  const inputStyle = { padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', outline: 'none', width: '100%', boxSizing: 'border-box' as const };
  const labelStyle = { fontWeight: 600, display: 'block', marginBottom: '0.5rem' };

  return (
    <form className="glass" style={{ padding: '2.5rem', borderRadius: 'var(--radius-lg)', maxWidth: '700px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }} onSubmit={handleSubmit}>
      <h2 style={{ color: 'var(--primary-dark)', textAlign: 'center', marginBottom: '1rem' }}>Đặt lịch khám bệnh</h2>
      
      {message && <div style={{ padding: '1rem', backgroundColor: message.includes('thành công') ? 'var(--secondary-color)' : 'red', color: 'white', borderRadius: 'var(--radius-md)', textAlign: 'center', fontWeight: 600 }}>{message}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div>
          <label htmlFor="name" style={labelStyle}>Họ và tên *</label>
          <input defaultValue={defaultName} type="text" id="name" name="name" required style={inputStyle} readOnly={status === 'authenticated' && !editableContacts} />
        </div>
        <div>
          <label htmlFor="email" style={labelStyle}>Email liên hệ *</label>
          <input defaultValue={defaultEmail} type="email" id="email" name="email" required style={inputStyle} readOnly={status === 'authenticated' && !editableContacts} />
        </div>
      </div>

      <div style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>
        <label htmlFor="phone" style={labelStyle}>Số điện thoại *</label>
        <input defaultValue={defaultPhone} type="text" id="phone" name="phone" required style={inputStyle} readOnly={status === 'authenticated' && !editableContacts} />
        {status === 'authenticated' ? (
          <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#64748b' }}>
            Thông tin lấy từ hồ sơ. <button type="button" onClick={async () => {
              if (!editableContacts) {
                setEditableContacts(true);
                return;
              }
              // save profile
              const form = document.createElement('form');
              const nameInput = document.getElementById('name') as HTMLInputElement | null;
              const emailInput = document.getElementById('email') as HTMLInputElement | null;
              const phoneInput = document.getElementById('phone') as HTMLInputElement | null;
              const newName = nameInput?.value || '';
              const newEmail = emailInput?.value || '';
              const newPhone = phoneInput?.value || '';

              if (!newName || !newEmail || !newPhone) {
                setMessage('Vui lòng điền đầy đủ thông tin liên hệ trước khi lưu.');
                return;
              }

              if (!validatePhone(newPhone)) {
                setMessage('Số điện thoại không hợp lệ.');
                return;
              }

              setLoading(true);
              try {
                const res = await fetch('/api/patient/profile', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ name: newName, email: newEmail, phone: newPhone, patientId: session?.user?.id }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data?.message || 'Cập nhật thất bại');
                setMessage('Cập nhật hồ sơ thành công');
                setEditableContacts(false);
                try {
                  const usr = data?.user || { id: session?.user?.id, name: newName, email: newEmail, phone: newPhone };
                  try { localStorage.setItem('currentUser', JSON.stringify(usr)); } catch (e) {}
                  try { window.dispatchEvent(new CustomEvent('profile-updated', { detail: usr })); } catch (e) {}
                } catch (e) {
                  try { window.dispatchEvent(new CustomEvent('profile-updated', { detail: { name: newName, email: newEmail, phone: newPhone } })); } catch (er) {}
                }
                // refresh as fallback
                window.setTimeout(() => window.location.reload(), 700);
              } catch (err: any) {
                setMessage(err?.message || 'Lưu hồ sơ thất bại');
              } finally {
                setLoading(false);
              }
            }} style={{ color: '#2563eb', fontWeight: 700, background: 'transparent', border: 'none', cursor: 'pointer' }}>{editableContacts ? 'Lưu' : 'Chỉnh sửa'}</button>
          </div>
        ) : null}
      </div>

      {/* include hidden patientId when authenticated (set on submit as well) */}
      {status === 'authenticated' && session?.user?.id ? (
        <input type="hidden" name="patientId" value={(session.user as any).id} />
      ) : null}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div>
          <label style={labelStyle}>Khoa khám *</label>
          <select name="departmentId" value={selectedDept} onChange={e => setSelectedDept(e.target.value)} required style={inputStyle}>
            <option value="">-- Chọn chuyên khoa --</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label style={labelStyle}>Bác sĩ (Tùy chọn)</label>
          <select name="doctorId" style={inputStyle} disabled={!selectedDept}>
            <option value="">-- Chọn bác sĩ --</option>
            {doctors.map((d: any) => (
              <option key={d.id} value={d.id}>{d.user.name} ({d.specialty})</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ background: 'rgba(37,99,235,0.05)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(37,99,235,0.2)' }}>
        <label style={labelStyle}>Hình thức khám *</label>
        <div style={{ display: 'flex', gap: '2rem', marginTop: '0.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 500 }}>
            <input type="radio" name="type" value="SERVICE" checked={examType === 'SERVICE'} onChange={() => setExamType('SERVICE')} style={{ transform: 'scale(1.2)' }} />
            Khám Dịch vụ
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 500 }}>
            <input type="radio" name="type" value="BHYT" checked={examType === 'BHYT'} onChange={() => setExamType('BHYT')} style={{ transform: 'scale(1.2)' }} />
            Khám Bảo hiểm Y tế (BHYT)
          </label>
        </div>

        {examType === 'BHYT' && (
          <div style={{ marginTop: '1rem' }}>
            <label style={labelStyle}>Mã thẻ BHYT *</label>
            <input type="text" name="healthInsuranceNo" required placeholder="Nhập số thẻ BHYT của bạn" style={inputStyle} />
          </div>
        )}
      </div>
      
      <div>
        <label htmlFor="date" style={labelStyle}>Ngày giờ khám mong muốn *</label>
        <input type="datetime-local" id="date" name="date" required style={inputStyle} />
      </div>

      <div>
        <label htmlFor="notes" style={labelStyle}>Triệu chứng / Ghi chú</label>
        <textarea id="notes" name="notes" rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Mô tả triệu chứng của bạn để bác sĩ nắm rõ hơn..."></textarea>
      </div>

      <button type="submit" disabled={loading} style={{
        padding: '1rem', 
        backgroundColor: 'var(--primary-color)', 
        color: 'white', 
        border: 'none', 
        borderRadius: 'var(--radius-md)', 
        fontWeight: 700, 
        fontSize: '1.1rem',
        cursor: loading ? 'not-allowed' : 'pointer',
        marginTop: '0.5rem',
        boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
      }}>
        {loading ? 'Đang xử lý...' : 'Xác nhận Đặt lịch khám'}
      </button>
      <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        * Thanh toán chi phí sẽ được thực hiện sau khi hoàn tất quy trình khám bệnh.
      </p>
    </form>
  );
}
