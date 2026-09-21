'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Medicine = { id: string; name: string; unit: string };
type PrescriptionItem = { medicineId: string; medicineName: string; dosage: string; duration: string; instructions: string };

export default function ExamineClient({ appointment, medicines, examinationType }: {
  appointment: any;
  medicines: Medicine[];
  examinationType: 'APPOINTMENT' | 'CLINIC_APPOINTMENT';
}) {
  const router = useRouter();
  const [diagnosis, setDiagnosis] = useState(appointment.diagnosis || '');
  const [notes, setNotes] = useState(appointment.notes || appointment.symptoms || '');
  const [prescriptionItems, setPrescriptionItems] = useState<PrescriptionItem[]>(
    appointment.prescription?.items?.map((i: any) => ({
      medicineId: i.medicineId,
      medicineName: i.medicine?.name || 'Thuốc',
      dosage: i.dosage,
      duration: i.duration,
      instructions: i.instructions
    })) || []
  );
  const [labOrders, setLabOrders] = useState<{ type: string; description: string }[]>(
    appointment.labOrders?.map((l: any) => ({ type: l.type, description: l.description })) || []
  );
  const [selectedMed, setSelectedMed] = useState('');
  const [dosage, setDosage] = useState('');
  const [duration, setDuration] = useState('');
  const [instructions, setInstructions] = useState('');
  const [labType, setLabType] = useState('');
  const [saving, setSaving] = useState(false);

  // Thêm state cho Nhập viện và Chỉ định mổ
  const [requireAdmission, setRequireAdmission] = useState(false);
  const [admissionReason, setAdmissionReason] = useState('');
  const [requireSurgery, setRequireSurgery] = useState(false);
  const [surgeryName, setSurgeryName] = useState('');
  const [diagnosisBefore, setDiagnosisBefore] = useState('');

  const addMedicine = () => {
    const med = medicines.find(m => m.id === selectedMed);
    if (!med || !dosage || !duration) return;
    setPrescriptionItems(prev => [...prev, { medicineId: selectedMed, medicineName: med.name, dosage, duration, instructions }]);
    setSelectedMed(''); setDosage(''); setDuration(''); setInstructions('');
  };

  const addLabOrder = () => {
    if (!labType) return;
    setLabOrders(prev => [...prev, { type: labType, description: '' }]);
    setLabType('');
  };

  const submit = async () => {
    if (!diagnosis) return alert('Vui lòng nhập chẩn đoán!');
    setSaving(true);
    try {
      const payload = {
        appointmentId: appointment.id,
        examinationType,
        diagnosis, notes, prescriptionItems, labOrders,
        requireAdmission, admissionReason,
        requireSurgery, surgeryName, diagnosisBefore
      };
      
      const res = await fetch('/api/doctor/examine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) { router.push('/doctor'); router.refresh(); }
      else alert('Có lỗi xảy ra!');
    } finally { setSaving(false); }
  };

  const inputStyle = { width: '100%', padding: '0.875rem', borderRadius: '12px', border: '1.5px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#0f172a', outline: 'none', boxSizing: 'border-box' as const, fontSize: '0.95rem', transition: 'all 0.2s' };
  const labelStyle = { color: '#475569', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', display: 'block', textTransform: 'uppercase' as const, letterSpacing: '0.5px' };
  const cardStyle = { background: 'white', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '2rem', marginBottom: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' };

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', padding: '3rem 1rem', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <a href="/doctor" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600, padding: '0.5rem 1rem', background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', marginBottom: '1rem', transition: 'all 0.2s' }}>
              ← Quay lại danh sách
            </a>
            <h1 style={{ color: '#0f172a', fontSize: '2rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>
              Hồ sơ Khám bệnh
            </h1>
            <p style={{ color: '#64748b', fontSize: '1rem', margin: 0 }}>
              Bệnh nhân: <span style={{ color: '#0ea5e9', fontWeight: 700 }}>{appointment.patient.name}</span> • 📞 {appointment.patient.phone || 'Chưa cập nhật'}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ padding: '0.5rem 1rem', background: '#e0f2fe', color: '#0284c7', borderRadius: '12px', fontWeight: 700, fontSize: '0.9rem' }}>
              {new Intl.DateTimeFormat('vi-VN', { dateStyle: 'full' }).format(new Date(appointment.date))}
            </div>
          </div>
        </div>

        {appointment.notes && (
          <div style={{ background: '#fef3c7', borderLeft: '4px solid #f59e0b', borderRadius: '0 12px 12px 0', padding: '1rem 1.5rem', marginBottom: '2rem', boxShadow: '0 2px 10px rgba(245,158,11,0.1)' }}>
            <span style={{ color: '#92400e', fontSize: '0.95rem', fontWeight: 600 }}>⚠️ Triệu chứng ban đầu: {appointment.notes}</span>
          </div>
        )}

        {/* Chẩn đoán */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>📝</div>
            <h2 style={{ color: '#0f172a', fontWeight: 800, fontSize: '1.25rem', margin: 0 }}>Chẩn đoán & Ghi chú</h2>
          </div>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={labelStyle}>Kết luận chẩn đoán *</label>
            <textarea value={diagnosis} onChange={e => setDiagnosis(e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="VD: Viêm họng cấp, Đau dạ dày..." />
          </div>
          <div>
            <label style={labelStyle}>Lời dặn của Bác sĩ</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} style={{ ...inputStyle, resize: 'vertical' }} placeholder="VD: Nghỉ ngơi, uống nhiều nước, tái khám sau 7 ngày..." />
          </div>
        </div>

        {/* Kê đơn thuốc */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>💊</div>
            <h2 style={{ color: '#0f172a', fontWeight: 800, fontSize: '1.25rem', margin: 0 }}>Kê đơn thuốc</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.5fr 2fr auto', gap: '1rem', marginBottom: '1.5rem', alignItems: 'end' }}>
            <div>
              <label style={labelStyle}>Tên thuốc</label>
              <select value={selectedMed} onChange={e => setSelectedMed(e.target.value)} style={inputStyle}>
                <option value="">-- Chọn thuốc --</option>
                {medicines.map(m => <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Liều dùng</label>
              <input style={inputStyle} value={dosage} onChange={e => setDosage(e.target.value)} placeholder="VD: 2 viên/ngày" />
            </div>
            <div>
              <label style={labelStyle}>Số ngày</label>
              <input style={inputStyle} value={duration} onChange={e => setDuration(e.target.value)} placeholder="VD: 7 ngày" />
            </div>
            <div>
              <label style={labelStyle}>Cách dùng</label>
              <input style={inputStyle} value={instructions} onChange={e => setInstructions(e.target.value)} placeholder="VD: Uống sau ăn" />
            </div>
            <button onClick={addMedicine} style={{ padding: '0.875rem', width: '45px', height: '45px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}>+</button>
          </div>
          {prescriptionItems.length > 0 && (
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
              {prescriptionItems.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: i % 2 === 0 ? '#f8fafc' : 'white', padding: '1rem', borderBottom: i === prescriptionItems.length - 1 ? 'none' : '1px solid #e2e8f0' }}>
                  <div style={{ color: '#334155', fontSize: '0.95rem' }}>
                    <strong style={{ color: '#0f172a' }}>{item.medicineName}</strong> — <span style={{ color: '#10b981', fontWeight: 600 }}>{item.dosage}</span>, {item.duration} {item.instructions && <span style={{ color: '#64748b' }}>({item.instructions})</span>}
                  </div>
                  <button onClick={() => setPrescriptionItems(prev => prev.filter((_, j) => j !== i))} style={{ background: '#fee2e2', padding: '0.4rem 0.6rem', borderRadius: '6px', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 600 }}>Xóa</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chỉ định xét nghiệm */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>🔬</div>
            <h2 style={{ color: '#0f172a', fontWeight: 800, fontSize: '1.25rem', margin: 0 }}>Chỉ định Xét nghiệm</h2>
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <select value={labType} onChange={e => setLabType(e.target.value)} style={{ ...inputStyle, flex: 1 }}>
              <option value="">-- Bấm để chọn loại xét nghiệm / Cận lâm sàng --</option>
              {['Xét nghiệm máu', 'X-quang ngực', 'Siêu âm ổ bụng', 'Điện tim (ECG)', 'CT Scanner', 'MRI', 'Xét nghiệm nước tiểu', 'Nội soi dạ dày'].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <button onClick={addLabOrder} style={{ padding: '0.875rem 2rem', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 700, boxShadow: '0 4px 12px rgba(139,92,246,0.3)' }}>Thêm CLS</button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {labOrders.map((o, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f3e8ff', border: '1px solid #e9d5ff', borderRadius: '20px', padding: '0.5rem 1rem' }}>
                <span style={{ color: '#6b21a8', fontWeight: 600, fontSize: '0.9rem' }}>{o.type}</span>
                <button onClick={() => setLabOrders(prev => prev.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: '#9333ea', cursor: 'pointer', padding: '0' }}>✕</button>
              </div>
            ))}
          </div>
        </div>

        {/* Bổ sung: Nhập viện và Chỉ định mổ */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
          {/* Nhập viện */}
          <div style={{ ...cardStyle, marginBottom: 0, border: requireAdmission ? '2px solid #3b82f6' : '1px solid #e2e8f0' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', marginBottom: requireAdmission ? '1rem' : 0 }}>
              <input type="checkbox" checked={requireAdmission} onChange={e => setRequireAdmission(e.target.checked)} style={{ width: '24px', height: '24px', accentColor: '#3b82f6' }} />
              <h2 style={{ color: '#0f172a', fontWeight: 800, fontSize: '1.2rem', margin: 0 }}>Chỉ định nhập viện</h2>
            </label>
            {requireAdmission && (
              <div>
                <label style={labelStyle}>Lý do / Yêu cầu theo dõi *</label>
                <textarea value={admissionReason} onChange={e => setAdmissionReason(e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="VD: Theo dõi sốt xuất huyết..." />
              </div>
            )}
          </div>

          {/* Phẫu thuật */}
          <div style={{ ...cardStyle, marginBottom: 0, border: requireSurgery ? '2px solid #ef4444' : '1px solid #e2e8f0' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', marginBottom: requireSurgery ? '1rem' : 0 }}>
              <input type="checkbox" checked={requireSurgery} onChange={e => setRequireSurgery(e.target.checked)} style={{ width: '24px', height: '24px', accentColor: '#ef4444' }} />
              <h2 style={{ color: '#0f172a', fontWeight: 800, fontSize: '1.2rem', margin: 0 }}>Chỉ định phẫu thuật</h2>
            </label>
            {requireSurgery && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Tên phẫu thuật chỉ định *</label>
                  <input value={surgeryName} onChange={e => setSurgeryName(e.target.value)} style={inputStyle} placeholder="VD: Mổ ruột thừa nội soi" />
                </div>
                <div>
                  <label style={labelStyle}>Chẩn đoán trước mổ *</label>
                  <input value={diagnosisBefore} onChange={e => setDiagnosisBefore(e.target.value)} style={inputStyle} placeholder="VD: Viêm ruột thừa cấp" />
                </div>
              </div>
            )}
          </div>
        </div>

        <button onClick={submit} disabled={saving} style={{ width: '100%', padding: '1.25rem', background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: 'white', border: 'none', borderRadius: '16px', fontWeight: 800, fontSize: '1.25rem', cursor: saving ? 'not-allowed' : 'pointer', boxShadow: '0 10px 25px rgba(2,132,199,0.3)', transition: 'transform 0.2s', letterSpacing: '0.5px' }}>
          {saving ? '⏳ ĐANG LƯU DỮ LIỆU...' : '💾 LƯU HỒ SƠ & HOÀN TẤT KHÁM'}
        </button>

        {/* Các nút In ấn Biểu mẫu */}
        {appointment.status === 'COMPLETED' && (
          <div style={{ marginTop: '2rem', padding: '2rem', background: 'white', borderRadius: '20px', border: '1px dashed #cbd5e1', textAlign: 'center' }}>
            <h3 style={{ color: '#475569', margin: '0 0 1.5rem 0', fontSize: '1.1rem' }}>🖨️ TRUNG TÂM IN ẤN BIỂU MẪU</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
              <button onClick={() => window.open(`/print/prescription/${appointment.id}`, '_blank')} style={{ padding: '1rem', background: '#eff6ff', color: '#1d4ed8', borderRadius: '12px', border: '1px solid #bfdbfe', cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem' }}>💊</span> Đơn thuốc
              </button>
              <button onClick={() => window.open(`/print/exam-form/${appointment.id}`, '_blank')} style={{ padding: '1rem', background: '#f5f3ff', color: '#6d28d9', borderRadius: '12px', border: '1px solid #ddd6fe', cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem' }}>📝</span> Phiếu khám
              </button>
              <button onClick={() => window.open(`/print/transfer/${appointment.id}`, '_blank')} style={{ padding: '1rem', background: '#fffbeb', color: '#b45309', borderRadius: '12px', border: '1px solid #fde68a', cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem' }}>🚑</span> Chuyển tuyến
              </button>
              <button onClick={() => window.open(`/print/discharge/${appointment.id}`, '_blank')} style={{ padding: '1rem', background: '#fdf2f8', color: '#be185d', borderRadius: '12px', border: '1px solid #fbcfe8', cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem' }}>🏥</span> Xuất viện
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
