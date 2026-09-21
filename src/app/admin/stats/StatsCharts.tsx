'use client';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar,
} from 'recharts';

const PIE_COLORS: Record<string, string> = {
  PENDING: '#f59e0b',
  CONFIRMED: '#0ea5e9',
  COMPLETED: '#10b981',
  CANCELLED: '#ef4444',
};

type Props = {
  chartData: { date: string; count: number }[];
  prescriptionChartData: { date: string; count: number }[];
  statusData: { name: string; value: number }[];
  topDoctors: { id: string; user: { name: string }; specialty: string; _count: { appointments: number } }[];
};

export default function StatsCharts({ chartData, prescriptionChartData, statusData, topDoctors }: Props) {
  const doctorChartData = topDoctors.map((d) => ({
    name: d.user.name,
    appointments: d._count.appointments,
  }));

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
      {/* Line Chart: lịch hẹn 7 ngày */}
      <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', gridColumn: '1 / -1' }}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 600 }}>📈 Lịch hẹn 7 ngày gần nhất</h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#0ea5e9" strokeWidth={2.5} dot={{ fill: '#0ea5e9', r: 5 }} name="Lịch hẹn" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Line Chart: đơn thuốc 30 ngày */}
      <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', gridColumn: '1 / -1' }}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 600 }}>🧾 Đơn thuốc trong 30 ngày</h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={prescriptionChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', r: 5 }} name="Đơn thuốc" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart: trạng thái */}
      <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 600 }}>🥧 Tỷ lệ trạng thái lịch hẹn</h2>
        {statusData.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '4rem' }}>Chưa có dữ liệu</p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                {statusData.map((entry) => (
                  <Cell key={entry.name} fill={PIE_COLORS[entry.name] || '#8b5cf6'} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Bar Chart: top bác sĩ */}
      <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 600 }}>🏆 Top Bác sĩ nhiều lịch nhất</h2>
        {doctorChartData.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '4rem' }}>Chưa có dữ liệu</p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={doctorChartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="appointments" fill="#8b5cf6" radius={[0, 6, 6, 0]} name="Lịch hẹn" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
