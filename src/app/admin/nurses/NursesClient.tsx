'use client';

import { type FormEvent, useEffect, useState } from 'react';

interface DepartmentOption {
  id: string;
  name: string;
}

interface NurseRecord {
  id: string;
  position: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    address: string | null;
  };
  department: {
    id: string;
    name: string;
  };
}

export default function NursesClient() {
  const [nurses, setNurses] = useState<NurseRecord[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    departmentId: '',
    position: 'Y tá',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [nursesRes, departmentsRes] = await Promise.all([
        fetch('/api/admin/nurses'),
        fetch('/api/admin/departments'),
      ]);

      if (nursesRes.ok) {
        const nursesData = await nursesRes.json();
        setNurses(nursesData);
      }

      if (departmentsRes.ok) {
        const departmentsData = await departmentsRes.json();
        setDepartments(departmentsData);
      }
    } catch (error) {
      console.error('Failed to load nurses data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/nurses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Không thể lưu y tá');
      }

      setMessage(`Đã lưu ${data.user?.name || form.name}`);
      setForm({
        name: '',
        email: '',
        phone: '',
        address: '',
        departmentId: '',
        position: 'Y tá',
      });
      await fetchData();
    } catch (error: any) {
      setMessage(error.message || 'Đã có lỗi xảy ra');
    } finally {
      setSubmitting(false);
    }
  };

  const departmentStats = departments.map((department) => ({
    ...department,
    nurses: nurses.filter((nurse) => nurse.department?.id === department.id),
  }));

  return (
    <div style={{ padding: '2rem', color: '#0f172a', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div>
          <div style={{ color: '#38bdf8', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase' }}>Y tá điều dưỡng</div>
          <h1 style={{ margin: '0.25rem 0 0.35rem', fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>Quản lý y tá theo khoa</h1>
          <p style={{ margin: 0, color: '#64748b', maxWidth: '680px' }}>Theo dõi nhân sự y tá điều dưỡng, phân bổ theo khoa và đảm bảo mỗi khoa luôn có đủ người trực.</p>
        </div>
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '0.85rem 1rem', minWidth: '180px' }}>
          <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Tổng y tá</div>
          <div style={{ color: '#0f172a', fontSize: '1.6rem', fontWeight: 800 }}>{nurses.length}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1rem 1.1rem' }}>
          <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Khoa được phân bổ</div>
          <div style={{ color: '#38bdf8', fontSize: '1.4rem', fontWeight: 800, marginTop: '0.35rem' }}>{departmentStats.length}</div>
        </div>
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1rem 1.1rem' }}>
          <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Đội ngũ trực</div>
          <div style={{ color: '#34d399', fontSize: '1.4rem', fontWeight: 800, marginTop: '0.35rem' }}>{nurses.filter((nurse) => nurse.position.toLowerCase().includes('trưởng') || nurse.position.toLowerCase().includes('lead')).length}</div>
        </div>
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1rem 1.1rem' }}>
          <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Đang thiếu nhân sự</div>
          <div style={{ color: '#fbbf24', fontSize: '1.4rem', fontWeight: 800, marginTop: '0.35rem' }}>{departmentStats.filter((department) => department.nurses.length === 0).length}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: '1.2fr 0.8fr' }}>
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a' }}>Tổng quan theo khoa</h2>
              <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.9rem' }}>Mỗi khoa có một nhóm y tá riêng để dễ theo dõi.</p>
            </div>
          </div>

          {loading ? (
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem', color: '#475569' }}>Đang tải dữ liệu...</div>
          ) : departmentStats.length === 0 ? (
            <div style={{ background: '#ffffff', border: '1px dashed #d1d5db', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', color: '#64748b' }}>Chưa có khoa nào được tạo để phân bổ y tá.</div>
          ) : (
            <div style={{ display: 'grid', gap: '0.8rem' }}>
              {departmentStats.map((department) => (
                <div key={department.id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '0.95rem 1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
                    <div>
                      <div style={{ color: '#0f172a', fontWeight: 700 }}>{department.name}</div>
                      <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.2rem' }}>{department.nurses.length} y tá đã phân bổ</div>
                    </div>
                    <div style={{ background: department.nurses.length > 0 ? '#dcfce7' : '#fef3c7', color: department.nurses.length > 0 ? '#15803d' : '#92400e', padding: '0.3rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700 }}>
                      {department.nurses.length > 0 ? '✓ Đủ nhân sự' : '⚠ Cần tuyển'}
                    </div>
                  </div>
                  {department.nurses.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.7rem' }}>
                      {department.nurses.map((nurse) => (
                        <span key={nurse.id} style={{ background: '#dbeafe', color: '#1d4ed8', borderRadius: '999px', padding: '0.3rem 0.65rem', fontSize: '0.78rem', fontWeight: 500 }}>{nurse.user.name || 'Y tá'}</span>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.2rem' }}>
          <h2 style={{ margin: '0 0 0.35rem', fontSize: '1.05rem', color: '#0f172a' }}>Thêm y tá mới</h2>
          <p style={{ margin: '0 0 1rem', color: '#64748b', fontSize: '0.9rem' }}>Điền thông tin để phân bổ nhân sự vào khoa tương ứng.</p>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.85rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.35rem', color: '#475569', fontSize: '0.82rem', fontWeight: 600 }}>Họ tên</label>
              <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.35rem', color: '#475569', fontSize: '0.82rem', fontWeight: 600 }}>Email</label>
              <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required style={inputStyle} />
            </div>
            <div style={{ display: 'grid', gap: '0.85rem', gridTemplateColumns: '1fr 1fr' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.35rem', color: '#475569', fontSize: '0.82rem', fontWeight: 600 }}>Điện thoại</label>
                <input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.35rem', color: '#475569', fontSize: '0.82rem', fontWeight: 600 }}>Chức vụ</label>
                <input value={form.position} onChange={(event) => setForm({ ...form, position: event.target.value })} style={inputStyle} />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.35rem', color: '#475569', fontSize: '0.82rem', fontWeight: 600 }}>Địa chỉ</label>
              <input value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.35rem', color: '#475569', fontSize: '0.82rem', fontWeight: 600 }}>Khoa</label>
              <select value={form.departmentId} onChange={(event) => setForm({ ...form, departmentId: event.target.value })} required style={inputStyle}>
                <option value="">Chọn khoa</option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>{department.name}</option>
                ))}
              </select>
            </div>
            {message ? <div style={{ color: '#0369a1', fontSize: '0.85rem' }}>{message}</div> : null}
            <button type="submit" disabled={submitting} style={{ background: '#38bdf8', color: 'white', border: 'none', borderRadius: '10px', padding: '0.8rem 1rem', fontWeight: 700, cursor: 'pointer' }}>
              {submitting ? 'Đang lưu...' : 'Lưu y tá'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  borderRadius: '10px',
  border: '1px solid #e2e8f0',
  background: '#ffffff',
  color: '#0f172a',
  padding: '0.75rem 0.85rem',
  outline: 'none',
};
