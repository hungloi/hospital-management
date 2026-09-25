'use client';

import { Fragment, useMemo, useState, type CSSProperties } from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const ROOM_TYPE_LABELS: Record<string, string> = {
  NORMAL: 'Phòng thường',
  VIP: 'VIP',
  ICU: 'ICU',
  SURGERY: 'Phòng mổ',
  OBSERVATION: 'Theo dõi',
};

const ROOM_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  AVAILABLE: { label: 'Còn trống', color: '#16a34a' },
  OCCUPIED: { label: 'Đang sử dụng', color: '#f59e0b' },
  MAINTENANCE: { label: 'Bảo trì', color: '#ef4444' },
  CLOSED: { label: 'Đóng', color: '#64748b' },
};

export default function RoomsClient() {
  const { data: roomsData, mutate } = useSWR('/api/admin/rooms', fetcher);
  const rooms = Array.isArray(roomsData) ? roomsData : (roomsData?.data || []);
  const { data: departments = [] } = useSWR('/api/admin/departments', fetcher);
  const [name, setName] = useState('');
  const [type, setType] = useState('NORMAL');
  const [floor, setFloor] = useState(1);
  const [capacity, setCapacity] = useState(1);
  const [rate, setRate] = useState(0);
  const [status, setStatus] = useState('AVAILABLE');
  const [departmentId, setDepartmentId] = useState('');
  const [description, setDescription] = useState('');
  const [servicesText, setServicesText] = useState('');
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const stats = useMemo(
    () => ({
      totalRooms: rooms.length,
      totalBeds: rooms.reduce((sum: number, room: any) => sum + (room.beds?.length || 0), 0),
      availableBeds: rooms.reduce(
        (sum: number, room: any) => sum + (room.beds?.filter((bed: any) => bed.status === 'AVAILABLE').length || 0),
        0,
      ),
      occupiedBeds: rooms.reduce(
        (sum: number, room: any) => sum + (room.beds?.filter((bed: any) => bed.status === 'OCCUPIED').length || 0),
        0,
      ),
      maintenanceRooms: rooms.filter((room: any) => room.status === 'MAINTENANCE').length,
    }),
    [rooms],
  );

  async function createRoom() {
    if (!name.trim()) {
      setMessage('Tên phòng không được để trống');
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const services = normalizeServices(servicesText, type);
      const res = await fetch('/api/admin/rooms', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          type,
          status,
          floor: Number(floor),
          capacity: Number(capacity),
          ratePerDay: Number(rate),
          description: description.trim(),
          departmentId: departmentId || null,
          services,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Không thể tạo phòng');
      }

      setMessage('Phòng bệnh đã được tạo thành công');
      setName('');
      setType('NORMAL');
      setFloor(1);
      setCapacity(1);
      setRate(0);
      setStatus('AVAILABLE');
      setDepartmentId('');
      setDescription('');
      setServicesText('');
      await mutate();
    } catch (error: any) {
      setMessage(error?.message || 'Có lỗi khi tạo phòng');
    } finally {
      setSubmitting(false);
    }
  }

  const toggleRoomDetails = (id: string) => setActiveRoomId((current) => (current === id ? null : id));

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p style={{ color: '#38bdf8', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Quản lý phòng bệnh
            </p>
            <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>Nội trú & phòng điều dưỡng</h1>
            <p style={{ color: '#475569', marginTop: '0.75rem', maxWidth: '720px' }}>
              Theo dõi tình trạng phòng, giường bệnh, dịch vụ đi kèm, khoa quản lý và chi phí nội trú theo ngày.
            </p>
          </div>
          <div style={{ display: 'grid', gap: '0.75rem', textAlign: 'right' }}>
            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Tổng phòng</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>{stats.totalRooms}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCard label="Tổng phòng" value={stats.totalRooms} color="#38bdf8" />
        <StatCard label="Tổng giường" value={stats.totalBeds} color="#8b5cf6" />
        <StatCard label="Giường trống" value={stats.availableBeds} color="#22c55e" />
        <StatCard label="Giường đang dùng" value={stats.occupiedBeds} color="#f59e0b" />
        <StatCard label="Phòng bảo trì" value={stats.maintenanceRooms} color="#ef4444" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(148,163,184,0.25)', borderRadius: '18px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.15rem', fontWeight: 700 }}>Danh sách phòng bệnh</h2>
              <p style={{ margin: '0.5rem 0 0', color: '#64748b' }}>Xem tổng quan phòng, giường, dịch vụ đi kèm và người thuê giường hiện tại.</p>
            </div>
            <div style={{ textAlign: 'right', color: '#64748b', fontSize: '0.9rem' }}>{rooms.length} phòng</div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ color: '#64748b', textAlign: 'left', borderBottom: '1px solid #f1f5f9' }}>
                  <th style={tableHeaderStyle}>Phòng</th>
                  <th style={tableHeaderStyle}>Khoa</th>
                  <th style={tableHeaderStyle}>Loại / Tầng</th>
                  <th style={tableHeaderStyle}>Giường</th>
                  <th style={tableHeaderStyle}>Trạng thái</th>
                  <th style={tableHeaderStyle}>Giá/ngày</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room: any) => (
                  <Fragment key={room.id}>
                    <tr style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }} onClick={() => toggleRoomDetails(room.id)}>
                      <td style={rowCellStyle}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{room.name}</div>
                        <div style={{ color: '#64748b', fontSize: '0.85rem' }}>{room.description || 'Chưa có mô tả'}</div>
                      </td>
                      <td style={rowCellStyle}>{room.department?.name || 'Chưa gán'}</td>
                      <td style={rowCellStyle}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                          <span>{ROOM_TYPE_LABELS[room.type] || room.type}</span>
                          <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Tầng {room.floor ?? '-'}</span>
                        </div>
                      </td>
                      <td style={rowCellStyle}>
                        {room.availableBeds ?? 0} trống / {room.beds?.length ?? 0}
                      </td>
                      <td style={rowCellStyle}><StatusBadge value={room.status} /></td>
                      <td style={rowCellStyle}>{Number(room.ratePerDay).toLocaleString('vi-VN')}₫</td>
                    </tr>
                    {activeRoomId === room.id ? (
                      <tr>
                        <td colSpan={6} style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem 1.25rem' }}>
                          <div style={{ display: 'grid', gap: '0.9rem' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                              {(room.services || []).map((service: any) => (
                                <span key={service.id} style={{ background: 'rgba(56,189,248,0.14)', color: '#bae6fd', borderRadius: '999px', padding: '0.32rem 0.7rem', fontSize: '0.78rem', fontWeight: 700 }}>
                                  {service.name}
                                </span>
                              ))}
                              {(room.services || []).length === 0 ? <span style={{ color: '#64748b' }}>Chưa có dịch vụ đi kèm</span> : null}
                            </div>
                            {room.beds?.length > 0 ? (
                              room.beds.map((bed: any) => (
                                <div key={bed.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', padding: '0.85rem 0', borderBottom: '1px solid #f1f5f9' }}>
                                  <div>
                                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{bed.bedNumber}</div>
                                    <div style={{ color: '#64748b', fontSize: '0.85rem' }}>{bed.inpatientRecords?.[0]?.patient?.name || 'Chưa có bệnh nhân'}</div>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <StatusBadge value={bed.status} />
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div style={{ color: '#64748b' }}>Chưa có giường trong phòng.</div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(148,163,184,0.25)', borderRadius: '18px', padding: '1.25rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <h2 style={{ color: '#0f172a', fontSize: '1.15rem', margin: 0, fontWeight: 700 }}>Thêm phòng mới</h2>
            <p style={{ marginTop: '0.5rem', color: '#64748b' }}>Tạo phòng, tự động sinh giường theo sức chứa và gắn dịch vụ đi kèm.</p>
          </div>

          <div style={{ display: 'grid', gap: '0.85rem' }}>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tên phòng" style={inputStyle} />
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Mô tả" style={{ ...inputStyle, minHeight: '80px' }} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              <select value={type} onChange={(e) => setType(e.target.value)} style={inputStyle}>
                <option value="NORMAL">Phòng thường</option>
                <option value="VIP">VIP</option>
                <option value="ICU">ICU</option>
                <option value="SURGERY">Phòng mổ</option>
                <option value="OBSERVATION">Theo dõi</option>
              </select>
              <select value={status} onChange={(e) => setStatus(e.target.value)} style={inputStyle}>
                <option value="AVAILABLE">Còn trống</option>
                <option value="OCCUPIED">Đang sử dụng</option>
                <option value="MAINTENANCE">Bảo trì</option>
                <option value="CLOSED">Đóng</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              <input type="number" min="1" value={floor} onChange={(e) => setFloor(Number(e.target.value) || 1)} placeholder="Tầng" style={inputStyle} />
              <input type="number" min="1" value={capacity} onChange={(e) => setCapacity(Number(e.target.value) || 1)} placeholder="Sức chứa" style={inputStyle} />
            </div>

            <input type="number" min="0" value={rate} onChange={(e) => setRate(Number(e.target.value) || 0)} placeholder="Giá/ngày" style={inputStyle} />

            <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} style={inputStyle}>
              <option value="">Chọn khoa (tùy chọn)</option>
              {departments.map((department: any) => (
                <option key={department.id} value={department.id}>{department.name}</option>
              ))}
            </select>

            <textarea value={servicesText} onChange={(e) => setServicesText(e.target.value)} placeholder="Dịch vụ đi kèm (phân cách bằng dấu phẩy)" style={{ ...inputStyle, minHeight: '80px' }} />

            {message ? <div style={{ color: '#0f172a', background: 'rgba(56,189,248,0.12)', padding: '0.75rem', borderRadius: '12px' }}>{message}</div> : null}
            <button onClick={createRoom} disabled={submitting} style={{ ...buttonStyle, opacity: submitting ? 0.7 : 1 }}>
              {submitting ? 'Đang tạo...' : 'Tạo phòng'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function normalizeServices(raw: string, type: string) {
  const defaultServices: Record<string, string[]> = {
    VIP: ['TV', 'Wi-Fi', 'Máy lạnh', 'Dịch vụ ăn sáng'],
    ICU: ['Máy theo dõi', 'Oxy', 'Điều dưỡng 24h'],
    SURGERY: ['Phòng mổ', 'Gây mê', 'Hồi sức'],
  };

  const values = raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  if (values.length > 0) {
    return values;
  }

  return defaultServices[type] || ['Dịch vụ cơ bản'];
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ background: '#f8fafc', border: '1px solid rgba(148,163,184,0.2)', borderRadius: '16px', padding: '1.25rem', minHeight: '110px' }}>
      <div style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.85rem' }}>{label}</div>
      <div style={{ color, fontSize: '2rem', fontWeight: 800 }}>{value}</div>
    </div>
  );
}

function StatusBadge({ value }: { value: string }) {
  const status = ROOM_STATUS_LABELS[value] || { label: value, color: '#64748b' };
  return (
    <span style={{ background: `${status.color}22`, color: status.color, padding: '0.3rem 0.7rem', borderRadius: '999px', fontWeight: 700, fontSize: '0.8rem' }}>
      {status.label}
    </span>
  );
}

const tableHeaderStyle: CSSProperties = {
  padding: '0.85rem 0.85rem',
};

const rowCellStyle: CSSProperties = {
  padding: '0.95rem 0.85rem',
  verticalAlign: 'top',
  color: '#475569',
};

const inputStyle: CSSProperties = {
  width: '100%',
  borderRadius: '12px',
  border: '1px solid rgba(148,163,184,0.35)',
  padding: '0.9rem 1rem',
  background: '#ffffff',
  color: '#0f172a',
  outline: 'none',
};

const buttonStyle: CSSProperties = {
  border: 'none',
  borderRadius: '12px',
  padding: '0.95rem 1rem',
  background: '#38bdf8',
  color: '#0f172a',
  fontWeight: 700,
  cursor: 'pointer',
};
