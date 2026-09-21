'use client';

import { type FormEvent, useCallback, useEffect, useState } from 'react';

interface Department { id: string; name: string; }
interface StaffMember { id: string; position?: string; specialty?: string; user: { id: string; name: string | null }; }
interface ShiftRecord {
  id: string;
  dayOfWeek?: string | null;
  scheduleDate?: string | null;
  shiftType: string;
  startTime: string;
  endTime: string;
  notes: string | null;
  department: { id: string; name: string };
  doctor?: { id: string; user: { id: string; name: string | null } } | null;
  nurse?: { id: string; position?: string; user: { id: string; name: string | null } } | null;
}

const DAYS = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'];
const DAY_LABELS: Record<string,string> = {
  MONDAY:'Thứ 2', TUESDAY:'Thứ 3', WEDNESDAY:'Thứ 4', THURSDAY:'Thứ 5',
  FRIDAY:'Thứ 6', SATURDAY:'Thứ 7', SUNDAY:'Chủ nhật',
};
const DAY_SHORT: Record<string,string> = {
  MONDAY:'T2', TUESDAY:'T3', WEDNESDAY:'T4', THURSDAY:'T5',
  FRIDAY:'T6', SATURDAY:'T7', SUNDAY:'CN',
};
const SHIFT_META: Record<string,{label:string;accent:string;bg:string;icon:string;time:string}> = {
  DAY:     { label:'Ca sáng',  accent:'#0369a1', bg:'#e0f2fe', icon:'☀️',  time:'07:00 - 15:00' },
  EVENING: { label:'Ca chiều', accent:'#c2410c', bg:'#fff7ed', icon:'🌤️', time:'15:00 - 22:00' },
  NIGHT:   { label:'Ca đêm',   accent:'#6d28d9', bg:'#ede9fe', icon:'🌙', time:'22:00 - 07:00' },
};

const NON_MEDICAL = new Set([
  'Phòng Công Nghệ Thông Tin','Phòng Kế Toán - Tài Chính',
  'Phòng Nhân Sự - Hành Chính','Phòng Vệ Sinh và Bảo Vệ',
  'Phòng Đào Tạo - Nghiên Cứu Khoa Học','Phòng Quản Lý Chất Lượng',
]);

export default function SchedulesClient() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<StaffMember[]>([]);
  const [nurses, setNurses] = useState<StaffMember[]>([]);
  const [shifts, setShifts] = useState<ShiftRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{text:string;ok:boolean}|null>(null);
  const [filterDept, setFilterDept] = useState('');
  const [viewMode, setViewMode] = useState<'week'|'list'>('week');

  const [form, setForm] = useState({
    scheduleType: 'RECURRING' as 'RECURRING'|'SPECIFIC',
    dayOfWeek: 'MONDAY',
    scheduleDate: '',
    shiftType: 'DAY',
    startTime: '07:00',
    endTime: '15:00',
    departmentId: '',
    staffType: 'DOCTOR',
    staffId: '',
    notes: '',
  });

  const isNonMedical = (deptId: string) => {
    const dept = departments.find(d => d.id === deptId);
    return dept ? NON_MEDICAL.has(dept.name) : false;
  };

  const fetchData = useCallback(async (deptId?: string) => {
    setLoading(true);
    try {
      const qs = deptId ? `?departmentId=${deptId}` : '';
      const res = await fetch(`/api/admin/schedules${qs}`);
      const data = await res.json();
      setDepartments(data.departments || []);
      setDoctors(data.doctors || []);
      setNurses(data.nurses || []);
      setShifts(data.shifts || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // When dept changes in form, re-fetch staff for that dept
  useEffect(() => {
    if (form.departmentId) {
      fetchData(form.departmentId);
      // Reset staffType for non-medical depts
      const nm = isNonMedical(form.departmentId);
      if (nm) setForm(f => ({ ...f, staffType: 'NURSE', staffId: '' }));
      else setForm(f => ({ ...f, staffId: '' }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.departmentId]);

  // Auto-set times based on shift type
  useEffect(() => {
    const times: Record<string,[string,string]> = {
      DAY: ['07:00','15:00'], EVENING: ['15:00','22:00'], NIGHT: ['22:00','07:00']
    };
    const [s, e] = times[form.shiftType] || ['07:00','15:00'];
    setForm(f => ({ ...f, startTime: s, endTime: e }));
  }, [form.shiftType]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg(null);
    try {
      const res = await fetch('/api/admin/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          dayOfWeek: form.scheduleType === 'RECURRING' ? form.dayOfWeek : null,
          scheduleDate: form.scheduleType === 'SPECIFIC' ? form.scheduleDate : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi khi lưu ca');
      setMsg({ text: `✅ Đã tạo ca làm cho ${data.department?.name}`, ok: true });
      setForm(f => ({ ...f, staffId: '', notes: '', scheduleDate: '' }));
      await fetchData(form.departmentId || undefined);
    } catch (err: any) {
      setMsg({ text: `❌ ${err.message}`, ok: false });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xoá ca làm này?')) return;
    await fetch(`/api/admin/schedules?id=${id}`, { method: 'DELETE' });
    await fetchData(filterDept || undefined);
  };

  // Staff options for form - for non-medical use nurses list (staff stored as nurse)
  const nm = isNonMedical(form.departmentId);
  const staffOptions = nm ? nurses : (form.staffType === 'DOCTOR' ? doctors : nurses);

  // Filtered shifts for display
  const displayShifts = filterDept ? shifts.filter(s => s.department.id === filterDept) : shifts;

  // Group shifts by day for week view
  const shiftsByDay: Record<string, ShiftRecord[]> = {};
  DAYS.forEach(d => { shiftsByDay[d] = []; });
  displayShifts.forEach(s => {
    if (s.dayOfWeek) shiftsByDay[s.dayOfWeek]?.push(s);
  });
  const specificShifts = displayShifts.filter(s => !!s.scheduleDate);

  const stats = {
    total: shifts.length,
    day: shifts.filter(s => s.shiftType === 'DAY').length,
    evening: shifts.filter(s => s.shiftType === 'EVENING').length,
    night: shifts.filter(s => s.shiftType === 'NIGHT').length,
  };

  return (
    <div style={{ padding: '2rem', color: '#0f172a', minHeight: '100vh', background: '#f0f4f8' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ color: '#0369a1', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Quản lý lịch làm việc</div>
        <h1 style={{ margin: '0 0 0.5rem', fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>Phân công Ca làm việc</h1>
        <p style={{ margin: 0, color: '#64748b', lineHeight: 1.6 }}>Phân công bác sĩ, y tá và nhân viên vào các ca theo từng khoa phòng.</p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.75rem' }}>
        {[
          { label: 'Tổng ca', value: stats.total, color: '#0369a1', bg: '#e0f2fe' },
          { label: '☀️ Ca sáng', value: stats.day, color: '#0369a1', bg: '#e0f2fe' },
          { label: '🌤️ Ca chiều', value: stats.evening, color: '#c2410c', bg: '#fff7ed' },
          { label: '🌙 Ca đêm', value: stats.night, color: '#6d28d9', bg: '#ede9fe' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1rem 1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em' }}>{s.label}</div>
            <div style={{ color: '#0f172a', fontSize: '1.6rem', fontWeight: 800, marginTop: '0.3rem' }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: '380px 1fr' }}>
        {/* Left: Form */}
        <div>
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', position: 'sticky', top: '1rem' }}>
            <h2 style={{ margin: '0 0 1.25rem', fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', paddingBottom: '0.75rem', borderBottom: '2px solid #f1f5f9' }}>
              ➕ Tạo ca làm mới
            </h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Department */}
              <div>
                <label style={lbl}>Khoa / Phòng ban</label>
                <select value={form.departmentId} onChange={e => setForm({...form, departmentId: e.target.value})} required style={inp}>
                  <option value="">— Chọn khoa —</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>

              {/* Schedule type + Day */}
              <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: '1fr 1fr' }}>
                <div>
                  <label style={lbl}>Loại lịch</label>
                  <select value={form.scheduleType} onChange={e => setForm({...form, scheduleType: e.target.value as any})} style={inp}>
                    <option value="RECURRING">Lặp theo tuần</option>
                    <option value="SPECIFIC">Ngày cụ thể</option>
                  </select>
                </div>
                <div>
                  <label style={lbl}>{form.scheduleType === 'SPECIFIC' ? 'Ngày' : 'Ngày trong tuần'}</label>
                  {form.scheduleType === 'SPECIFIC' ? (
                    <input type="date" value={form.scheduleDate} onChange={e => setForm({...form, scheduleDate: e.target.value})} required style={inp} />
                  ) : (
                    <select value={form.dayOfWeek} onChange={e => setForm({...form, dayOfWeek: e.target.value})} style={inp}>
                      {DAYS.map(d => <option key={d} value={d}>{DAY_LABELS[d]}</option>)}
                    </select>
                  )}
                </div>
              </div>

              {/* Shift type */}
              <div>
                <label style={lbl}>Ca làm việc</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.5rem' }}>
                  {Object.entries(SHIFT_META).map(([k, v]) => (
                    <button type="button" key={k} onClick={() => setForm({...form, shiftType: k})}
                      style={{ padding: '0.6rem 0.4rem', borderRadius: '10px', border: `2px solid ${form.shiftType === k ? v.accent : '#e2e8f0'}`, background: form.shiftType === k ? v.bg : '#fff', color: form.shiftType === k ? v.accent : '#64748b', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', transition: 'all .15s' }}>
                      {v.icon} {v.label}<br/>
                      <span style={{ fontSize: '0.65rem', fontWeight: 400, opacity: 0.8 }}>{v.time}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom time */}
              <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: '1fr 1fr' }}>
                <div>
                  <label style={lbl}>Bắt đầu</label>
                  <input type="time" value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} required style={inp} />
                </div>
                <div>
                  <label style={lbl}>Kết thúc</label>
                  <input type="time" value={form.endTime} onChange={e => setForm({...form, endTime: e.target.value})} required style={inp} />
                </div>
              </div>

              {/* Staff selection */}
              <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '1rem', border: '1px solid #e2e8f0' }}>
                <label style={{ ...lbl, marginBottom: '0.5rem' }}>Phân công nhân sự</label>
                {!nm && (
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    {[{v:'DOCTOR', l:'👨‍⚕️ Bác sĩ'},{v:'NURSE', l:'👩‍⚕️ Y tá / Điều dưỡng'}].map(opt => (
                      <button type="button" key={opt.v} onClick={() => setForm({...form, staffType: opt.v, staffId: ''})}
                        style={{ flex:1, padding: '0.45rem', borderRadius: '8px', border: `2px solid ${form.staffType===opt.v?'#0369a1':'#e2e8f0'}`, background: form.staffType===opt.v?'#e0f2fe':'#fff', color: form.staffType===opt.v?'#0369a1':'#64748b', fontWeight: 700, fontSize: '0.75rem', cursor:'pointer' }}>
                        {opt.l}
                      </button>
                    ))}
                  </div>
                )}
                {nm && <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '0.5rem' }}>👤 Nhân viên hành chính</div>}
                <select value={form.staffId} onChange={e => setForm({...form, staffId: e.target.value})} required style={inp}
                  disabled={!form.departmentId}>
                  <option value="">{form.departmentId ? '— Chọn nhân sự —' : '— Chọn khoa trước —'}</option>
                  {staffOptions.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.user.name || 'Nhân viên'}{s.position ? ` (${s.position})` : s.specialty ? ` — ${s.specialty}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label style={lbl}>Ghi chú (tuỳ chọn)</label>
                <input value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Ví dụ: Trực tầng 2, phụ trách cấp cứu..." style={inp} />
              </div>

              {msg && (
                <div style={{ padding: '0.7rem 0.9rem', borderRadius: '10px', background: msg.ok ? '#ecfdf5' : '#fef2f2', border: `1px solid ${msg.ok ? '#86efac' : '#fca5a5'}`, color: msg.ok ? '#15803d' : '#dc2626', fontSize: '0.85rem', fontWeight: 600 }}>
                  {msg.text}
                </div>
              )}

              <button type="submit" disabled={submitting || !form.departmentId || !form.staffId}
                style={{ background: submitting ? '#94a3b8' : 'linear-gradient(135deg, #0369a1, #2563eb)', color:'#fff', border:'none', borderRadius:'12px', padding:'0.9rem', fontWeight:700, fontSize:'0.95rem', cursor: submitting ? 'not-allowed' : 'pointer', boxShadow:'0 4px 14px rgba(37,99,235,0.3)', transition:'all .15s' }}>
                {submitting ? '⏳ Đang lưu...' : '💾 Lưu ca làm việc'}
              </button>
            </form>
          </div>
        </div>

        {/* Right: Schedule view */}
        <div>
          {/* Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <select value={filterDept} onChange={e => { setFilterDept(e.target.value); fetchData(e.target.value || undefined); }}
              style={{ ...inp, maxWidth: '280px', fontWeight: 600 }}>
              <option value="">🏥 Tất cả khoa phòng</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <div style={{ display: 'flex', gap: '0.4rem', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.25rem' }}>
              {[{v:'week',l:'📅 Lịch tuần'},{v:'list',l:'📋 Danh sách'}].map(opt => (
                <button type="button" key={opt.v} onClick={() => setViewMode(opt.v as any)}
                  style={{ padding: '0.4rem 0.75rem', borderRadius: '8px', border: 'none', background: viewMode===opt.v?'#0369a1':'transparent', color: viewMode===opt.v?'#fff':'#64748b', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
                  {opt.l}
                </button>
              ))}
            </div>
            <span style={{ marginLeft: 'auto', color: '#64748b', fontSize: '0.82rem' }}>
              {displayShifts.length} ca hiển thị
            </span>
          </div>

          {loading ? (
            <div style={{ background: '#fff', borderRadius: '16px', padding: '3rem', textAlign: 'center', color: '#64748b' }}>
              ⏳ Đang tải lịch làm việc...
            </div>
          ) : viewMode === 'week' ? (
            /* Weekly calendar view */
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', marginBottom: '0.75rem' }}>
                {DAYS.map(day => (
                  <div key={day} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '0.5rem', minHeight: '200px' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: ['SATURDAY','SUNDAY'].includes(day) ? '#dc2626' : '#0369a1', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem', textAlign: 'center' }}>
                      {DAY_SHORT[day]}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      {shiftsByDay[day].length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#cbd5e1', fontSize: '0.65rem', marginTop: '1rem' }}>—</div>
                      ) : shiftsByDay[day].map(shift => {
                        const meta = SHIFT_META[shift.shiftType];
                        const name = shift.doctor?.user?.name || shift.nurse?.user?.name || '?';
                        const shortName = name.split(' ').slice(-2).join(' ');
                        return (
                          <div key={shift.id}
                            style={{ background: meta.bg, borderLeft: `3px solid ${meta.accent}`, borderRadius: '6px', padding: '0.3rem 0.4rem', fontSize: '0.65rem', position: 'relative', cursor: 'default' }}
                            title={`${meta.label} ${shift.startTime}-${shift.endTime}\n${name}\n${shift.department.name}${shift.notes ? '\n'+shift.notes : ''}`}>
                            <div style={{ fontWeight: 700, color: meta.accent }}>{meta.icon} {meta.label}</div>
                            <div style={{ color: '#374151', marginTop: '1px' }}>{shortName}</div>
                            <div style={{ color: '#94a3b8', fontSize: '0.6rem' }}>{shift.startTime}-{shift.endTime}</div>
                            <button onClick={() => handleDelete(shift.id)} type="button"
                              style={{ position: 'absolute', top: '2px', right: '2px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '0.65rem', padding: '1px 3px', lineHeight: 1 }}
                              title="Xoá ca">×</button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Specific date shifts */}
              {specificShifts.length > 0 && (
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1rem 1.25rem' }}>
                  <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem', fontSize: '0.9rem' }}>📅 Ca theo ngày cụ thể ({specificShifts.length})</div>
                  <div style={{ display: 'grid', gap: '0.5rem' }}>
                    {specificShifts.map(shift => {
                      const meta = SHIFT_META[shift.shiftType];
                      return (
                        <div key={shift.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.8rem', background: meta.bg, borderRadius: '10px', border: `1px solid ${meta.accent}30` }}>
                          <span style={{ fontSize: '1.2rem' }}>{meta.icon}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#0f172a' }}>{shift.doctor?.user?.name || shift.nurse?.user?.name}</div>
                            <div style={{ color: '#64748b', fontSize: '0.73rem' }}>{shift.department.name} · {new Date(shift.scheduleDate!).toLocaleDateString('vi-VN')} · {shift.startTime}–{shift.endTime}</div>
                          </div>
                          <span style={{ background: meta.bg, color: meta.accent, fontWeight: 700, fontSize: '0.72rem', padding: '0.2rem 0.6rem', borderRadius: '999px', border: `1px solid ${meta.accent}` }}>{meta.label}</span>
                          <button onClick={() => handleDelete(shift.id)} type="button" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '6px', padding: '0.2rem 0.5rem', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700 }}>Xoá</button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* List view grouped by department */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {departments
                .filter(d => !filterDept || d.id === filterDept)
                .map(dept => {
                  const dShifts = displayShifts.filter(s => s.department.id === dept.id);
                  if (dShifts.length === 0 && filterDept) return null;
                  return (
                    <div key={dept.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden' }}>
                      <div style={{ background: '#f8fafc', padding: '0.75rem 1.1rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem' }}>{dept.name}</div>
                        <span style={{ background: dShifts.length > 0 ? '#dcfce7' : '#f1f5f9', color: dShifts.length > 0 ? '#15803d' : '#94a3b8', fontWeight: 700, fontSize: '0.72rem', padding: '0.2rem 0.65rem', borderRadius: '999px' }}>
                          {dShifts.length} ca
                        </span>
                      </div>
                      {dShifts.length === 0 ? (
                        <div style={{ padding: '1rem 1.1rem', color: '#94a3b8', fontSize: '0.82rem' }}>Chưa có ca làm nào.</div>
                      ) : (
                        <div style={{ padding: '0.75rem 1.1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {dShifts.map(shift => {
                            const meta = SHIFT_META[shift.shiftType];
                            const dayLabel = shift.scheduleDate
                              ? new Date(shift.scheduleDate).toLocaleDateString('vi-VN')
                              : DAY_LABELS[shift.dayOfWeek || ''] || '—';
                            return (
                              <div key={shift.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.75rem', borderRadius: '10px', background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>{meta.icon}</div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {shift.doctor?.user?.name || shift.nurse?.user?.name || '—'}
                                  </div>
                                  <div style={{ color: '#64748b', fontSize: '0.73rem', marginTop: '1px' }}>
                                    {dayLabel} · {shift.startTime}–{shift.endTime}
                                    {shift.notes ? ` · ${shift.notes}` : ''}
                                  </div>
                                </div>
                                <span style={{ background: meta.bg, color: meta.accent, fontWeight: 700, fontSize: '0.7rem', padding: '0.2rem 0.55rem', borderRadius: '999px', border: `1px solid ${meta.accent}30`, flexShrink: 0 }}>{meta.label}</span>
                                <button onClick={() => handleDelete(shift.id)} type="button" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '6px', padding: '0.2rem 0.45rem', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0 }}>✕</button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const lbl: React.CSSProperties = { display: 'block', marginBottom: '0.3rem', color: '#374151', fontSize: '0.8rem', fontWeight: 700 };
const inp: React.CSSProperties = { width: '100%', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#fff', color: '#0f172a', padding: '0.65rem 0.85rem', fontSize: '0.87rem', outline: 'none', boxSizing: 'border-box' };
