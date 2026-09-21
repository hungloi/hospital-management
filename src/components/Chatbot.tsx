'use client';
import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';

type Message = { role: 'user' | 'assistant'; content: string };

const DASHBOARD_PATHS = ['/admin', '/doctor', '/patient'];

export default function Chatbot() {
  const pathname = usePathname();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Phải đặt useEffect TRƯỚC mọi return để tuân thủ Rules of Hooks
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Ẩn chatbot trên trang dashboard (sau tất cả hooks)
  const isHidden = DASHBOARD_PATHS.some(p => pathname === p || pathname?.startsWith(`${p}/`));
  if (isHidden) return null;

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    // Add empty assistant message for streaming
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!response.ok) throw new Error('API Error');
      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.startsWith('data: '));

        for (const line of lines) {
          const data = line.replace('data: ', '').trim();
          if (data === '[DONE]') break;
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              fullContent += delta;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: fullContent };
                return updated;
              });
            }
          } catch {}
        }
      }
    } catch (error) {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'assistant', content: 'Xin lỗi, có lỗi xảy ra hoặc máy chủ bận. Vui lòng thử lại sau.' };
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Nút bấm mở/đóng Chatbot */}
      <button
        id="chatbot-toggle"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed', bottom: '2rem', right: '2rem',
          backgroundColor: 'var(--primary-color)', color: 'white',
          border: 'none', borderRadius: '50%',
          width: '60px', height: '60px', fontSize: '1.5rem',
          cursor: 'pointer', boxShadow: 'var(--shadow-lg)', zIndex: 1000,
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          transition: 'transform 0.2s',
        }}
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* Cửa sổ Chat */}
      {isOpen && (
        <div className="glass" style={{
          position: 'fixed', bottom: '6rem', right: '2rem',
          width: '360px', height: '520px', borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)', zIndex: 1000,
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          backgroundColor: 'var(--surface-light)'
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, var(--primary-color), var(--primary-dark))',
            color: 'white', padding: '1rem 1.25rem',
            display: 'flex', alignItems: 'center', gap: '0.75rem'
          }}>
            <div style={{ fontSize: '1.5rem' }}>🏥</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>AI Lễ Tân Hưng Lợi</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>
                {isLoading ? '⚡ Đang trả lời...' : '🟢 Trực tuyến'}
              </div>
            </div>
          </div>

          {/* Khung tin nhắn */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', marginTop: 'auto', marginBottom: 'auto' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>👋</div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Xin chào! Tôi có thể giúp bạn đặt lịch, tư vấn sức khỏe hoặc tra cứu thông tin.
                </p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '82%',
              }}>
                <div style={{
                  backgroundColor: m.role === 'user' ? 'var(--primary-color)' : '#f1f5f9',
                  color: m.role === 'user' ? 'white' : 'var(--text-main)',
                  padding: '0.6rem 0.9rem', borderRadius: 'var(--radius-md)',
                  fontSize: '0.9rem', lineHeight: 1.5, wordWrap: 'break-word',
                  borderBottomRightRadius: m.role === 'user' ? '4px' : undefined,
                  borderBottomLeftRadius: m.role === 'assistant' ? '4px' : undefined,
                }}>
                  {m.content || (isLoading && i === messages.length - 1
                    ? <span style={{ opacity: 0.6 }}>●●●</span>
                    : '')}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Form nhập liệu */}
          <form onSubmit={sendMessage} style={{ display: 'flex', borderTop: '1px solid var(--border-color)', backgroundColor: 'white' }}>
            <input
              id="chatbot-input"
              style={{ flex: 1, padding: '0.875rem', border: 'none', outline: 'none', backgroundColor: 'transparent', fontSize: '0.9rem' }}
              value={input}
              placeholder="Nhập câu hỏi của bạn..."
              onChange={e => setInput(e.target.value)}
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading || !input.trim()} style={{
              padding: '0.875rem 1rem', backgroundColor: 'transparent',
              color: input.trim() ? 'var(--primary-color)' : '#94a3b8',
              border: 'none', fontWeight: 700, cursor: input.trim() ? 'pointer' : 'default',
              fontSize: '1.1rem', transition: 'color 0.2s'
            }}>
              ➤
            </button>
          </form>
        </div>
      )}
    </>
  );
}
