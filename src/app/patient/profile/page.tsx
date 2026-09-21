import ProfileForm from '@/components/PatientProfileForm';
import { auth } from '@/auth';

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) return null;

  return (
    <div className="container" style={{ padding: '2.5rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>Hồ sơ cá nhân</h1>
      <p style={{ color: '#64748b' }}>Cập nhật thông tin liên hệ để đặt lịch khám nhanh hơn.</p>
      <div style={{ marginTop: '1.5rem' }}>
        {/* PatientProfileForm is a client component that reads session */}
        <ProfileForm />
      </div>
    </div>
  );
}
