'use client';

import { type FormEvent, useEffect, useMemo, useState } from 'react';

interface PatientOption {
  id: string;
  name: string;
  phone: string | null;
  email: string;
}

interface DepartmentOption {
  id: string;
  name: string;
}

interface DoctorOption {
  id: string;
  user: {
    id: string;
    name: string | null;
  };
  department: {
    id: string;
    name: string;
  };
}

interface AppointmentRecord {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  symptoms: string | null;
  queueNumber: number | null;
  patient: {
    id: string;
    name: string;
  };
  doctor: {
    user: {
      name: string | null;
    };
    department: {
      name: string;
    };
  };
  department: {
    name: string;
  };
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Chờ khám',
  CONFIRMED: 'Đã xác nhận',
  EXAMINING: 'Đang khám',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
  NO_SHOW: 'Không đến',
};

const STATUS_COLOR: Record<string, string> = {
  PENDING: '#f59e0b',
  CONFIRMED: '#38bdf8',
  EXAMINING: '#a78bfa',
  COMPLETED: '#34d399',
  CANCELLED: '#f87171',
  NO_SHOW: '#64748b',
};

const panelStyle: React.CSSProperties = {
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '18px',
  padding: '1.25rem',
  boxShadow: '0 1px 3px rgba(15,23,42,0.08)',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  border: '1px solid #cbd5e1',
  borderRadius: '12px',
  background: '#f8fafc',
  color: '#0f172a',
  padding: '0.7rem 0.8rem',
  outline: 'none',
  fontSize: '0.95rem',
};

const buttonStyle: React.CSSProperties = {
  width: '100%',
  border: 'none',
  borderRadius: '12px',
  background: '#38bdf8',
  color: '#082f49',
  padding: '0.8rem 1rem',
  fontWeight: 700,
  cursor: 'pointer',
};

export default function ClinicClient() {
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [doctors, setDoctors] = useState<DoctorOption[]>([]);
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    patientId: '',
    doctorId: '',
    departmentId: '',
    date: new Date().toISOString().slice(0, 10),
    startTime: '08:00',
    endTime: '09:00',
    symptoms: '',
    queueNumber: '',
    type: 'SERVICE',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/clinic');
      if (!res.ok) throw new Error('Không thể tải dữ liệu phòng khám');
      const data = await res.json();
      setDepartments(data.departments || []);
      setPatients(data.patients || []);
      setDoctors(data.doctors || []);
      setAppointments(data.appointments || []);
    } catch (error: any) {
      setMessage(error.message || 'Có lỗi khi tải phòng khám');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredDoctors = useMemo(() => {
    if (!form.departmentId) return doctors;
    return doctors.filter((doctor) => doctor.department.id === form.departmentId);
  }, [doctors, form.departmentId]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      const payload = {
        ...form,
        queueNumber: form.queueNumber ? Number(form.queueNumber) : undefined,
        startTime: `${form.date}T${form.startTime}:00`,
        endTime: `${form.date}T${form.endTime}:00`,
      };
      const res = await fetch('/api/clinic-appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Không thể tạo lịch hẹn');
      setMessage(`Đã tạo lịch hẹn cho ${data.patient?.name || 'bệnh nhân'}`);
      setForm((current) => ({ ...current, patientId: '', doctorId: '', symptoms: '', queueNumber: '', departmentId: '' }));
      await fetchData();
    } catch (error: any) {
      setMessage(error.message || 'Đã có lỗi xảy ra');
    } finally {
      setSubmitting(false);
    }
  };

  const summary = useMemo(() => {
    const counts = appointments.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return counts;
  }, [appointments]);

  return (
    <div style={{ display: 'grid', gap: '1.25rem' }}>
      <div style={{ ...panelStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <div style={{ color: '#2563eb', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase' }}>Phòng khám</div>
          <h1 style={{ fontSize: '1.7rem', fontWeight: 700, color: '#0f172a', margin: '0.25rem 0 0.4rem' }}>Quản lý khám ngoại trú</h1>
          <p style={{ color: '#475569', margin: 0 }}>Theo dõi lịch hẹn, phân công bác sĩ và hỗ trợ quy trình khám bệnh chuyên nghiệp.</p>
        </div>
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '14px', padding: '0.8rem 1rem', color: '#1d4ed8' }}>
          Tổng lịch hẹn: <strong style={{ color: '#0f172a' }}>{appointments.length}</strong>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '0.9rem', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        {Object.entries(STATUS_LABEL).map(([status, label]) => (
          <div key={status} style={{ ...panelStyle, padding: '1rem' }}>
            <div style={{ color: STATUS_COLOR[status], fontWeight: 700, fontSize: '0.92rem' }}>{label}</div>
            <div style={{ marginTop: '0.35rem', fontSize: '1.6rem', fontWeight: 700, color: '#0f172a' }}>{summary[status] || 0}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gap: '1.25rem', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        <div style={panelStyle}>
          <h2 style={{ color: '#0f172a', fontSize: '1.1rem', marginBottom: '0.3rem' }}>Tạo lịch hẹn mới</h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem', margin: '0 0 1rem' }}>Đặt lịch cho bệnh nhân khám ngoại trú tại khoa phù hợp.</p>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.9rem' }}>
            <div style={{ display: 'grid', gap: '0.9rem', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
              <div>
                <label style={{ display: 'block', color: '#475569', marginBottom: '0.35rem', fontSize: '0.9rem' }}>Bệnh nhân</label>
                <select value={form.patientId} onChange={(event) => setForm({ ...form, patientId: event.target.value })} style={inputStyle} required>
                  <option value="">Chọn bệnh nhân</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id} style={{ color: '#0f172a' }}>
                      {patient.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', color: '#475569', marginBottom: '0.35rem', fontSize: '0.9rem' }}>Khoa</label>
                <select value={form.departmentId} onChange={(event) => setForm({ ...form, departmentId: event.target.value, doctorId: '' })} style={inputStyle} required>
                  <option value="">Chọn khoa</option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id} style={{ color: '#0f172a' }}>
                      {department.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gap: '0.9rem', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
              <div>
                <label style={{ display: 'block', color: '#475569', marginBottom: '0.35rem', fontSize: '0.9rem' }}>Bác sĩ</label>
                <select value={form.doctorId} onChange={(event) => setForm({ ...form, doctorId: event.target.value })} style={inputStyle} required>
                  <option value="">Chọn bác sĩ</option>
                  {filteredDoctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id} style={{ color: '#0f172a' }}>
                      {doctor.user.name || 'Bác sĩ'}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', color: '#475569', marginBottom: '0.35rem', fontSize: '0.9rem' }}>Loại khám</label>
                <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })} style={inputStyle}>
                  <option value="SERVICE" style={{ color: '#0f172a' }}>Dịch vụ</option>
                  <option value="BHYT" style={{ color: '#0f172a' }}>Bảo hiểm y tế</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gap: '0.9rem', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
              <div>
                <label style={{ display: 'block', color: '#475569', marginBottom: '0.35rem', fontSize: '0.9rem' }}>Ngày</label>
                <input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} style={inputStyle} required />
              </div>
              <div>
                <label style={{ display: 'block', color: '#475569', marginBottom: '0.35rem', fontSize: '0.9rem' }}>Giờ bắt đầu</label>
                <input type="time" value={form.startTime} onChange={(event) => setForm({ ...form, startTime: event.target.value })} style={inputStyle} required />
              </div>
              <div>
                <label style={{ display: 'block', color: '#475569', marginBottom: '0.35rem', fontSize: '0.9rem' }}>Giờ kết thúc</label>
                <input type="time" value={form.endTime} onChange={(event) => setForm({ ...form, endTime: event.target.value })} style={inputStyle} required />
              </div>
            </div>

            <div style={{ display: 'grid', gap: '0.9rem', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
              <div>
                <label style={{ display: 'block', color: '#475569', marginBottom: '0.35rem', fontSize: '0.9rem' }}>Số thứ tự</label>
                <input type="number" value={form.queueNumber} onChange={(event) => setForm({ ...form, queueNumber: event.target.value })} style={inputStyle} placeholder="Ví dụ: 12" />
              </div>
              <div>
                <label style={{ display: 'block', color: '#475569', marginBottom: '0.35rem', fontSize: '0.9rem' }}>Triệu chứng</label>
                <input value={form.symptoms} onChange={(event) => setForm({ ...form, symptoms: event.target.value })} style={inputStyle} placeholder="Mô tả triệu chứng" />
              </div>
            </div>

            {message ? <div style={{ color: '#0369a1', fontSize: '0.95rem' }}>{message}</div> : null}
            <button type="submit" disabled={submitting} style={{ ...buttonStyle, opacity: submitting ? 0.7 : 1 }}>
              {submitting ? 'Đang lưu...' : 'Tạo lịch hẹn'}
            </button>
          </form>
        </div>

        <div style={panelStyle}>
          <div style={{ marginBottom: '0.9rem' }}>
            <h2 style={{ color: '#0f172a', fontSize: '1.1rem', margin: 0 }}>Danh sách lịch hẹn ngoại trú</h2>
            <p style={{ color: '#475569', fontSize: '0.92rem', margin: '0.25rem 0 0' }}>Sắp xếp theo thời gian gần nhất.</p>
          </div>

          {loading ? (
            <div style={{ background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: '12px', padding: '0.9rem', color: '#475569' }}>Đang tải dữ liệu...</div>
          ) : appointments.length === 0 ? (
            <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '12px', padding: '1rem', textAlign: 'center', color: '#64748b' }}>
              Chưa có lịch hẹn nào trong phòng khám.
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '0.8rem' }}>
              {appointments.map((appointment) => (
                <div key={appointment.id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '0.9rem', boxShadow: '0 1px 2px rgba(15,23,42,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ color: '#0f172a', fontWeight: 700 }}>{appointment.patient.name}</div>
                      <div style={{ color: '#475569', fontSize: '0.92rem', marginTop: '0.2rem' }}>
                        {appointment.doctor.user.name || 'Bác sĩ'} • {appointment.department.name}
                      </div>
                    </div>
                    <span style={{ borderRadius: '999px', padding: '0.3rem 0.65rem', fontSize: '0.75rem', fontWeight: 700, backgroundColor: `${STATUS_COLOR[appointment.status] || '#94a3b8'}22`, color: STATUS_COLOR[appointment.status] || '#94a3b8' }}>
                      {STATUS_LABEL[appointment.status] || appointment.status}
                    </span>
                  </div>
                  <div style={{ marginTop: '0.7rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', color: '#475569', fontSize: '0.92rem' }}>
                    <span>Ngày: {new Date(appointment.date).toLocaleDateString('vi-VN')}</span>
                    <span>Giờ: {appointment.startTime.slice(11, 16)} - {appointment.endTime.slice(11, 16)}</span>
                    {appointment.queueNumber ? <span>STT: {appointment.queueNumber}</span> : null}
                  </div>
                  {appointment.symptoms ? <div style={{ marginTop: '0.45rem', color: '#64748b' }}>Triệu chứng: {appointment.symptoms}</div> : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
