import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Chatbot from "@/components/Chatbot";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "Bệnh viện Hưng Lợi - Chăm sóc sức khỏe toàn diện",
  description: "Hệ thống quản lý bệnh viện Hưng Lợi, đặt lịch khám và nhận tư vấn trực tuyến.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>
          <Navbar />
          <main className="main-content">
            {children}
          </main>
          <Footer />
          <Chatbot />
        </Providers>
      </body>
    </html>
  );
}
