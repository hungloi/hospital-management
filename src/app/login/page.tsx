import { redirect } from 'next/navigation';

// Trang /login không còn dùng nữa.
// Đăng nhập/đăng ký thông qua modal ở Navbar.
export default function LoginPage() {
  redirect('/');
}
