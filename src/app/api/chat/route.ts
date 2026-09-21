import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  const systemMessage = {
    role: 'system',
    content: `Bạn là trợ lý y tế AI (Chatbot Lễ Tân) của bệnh viện MediCare. 
Bạn cần giao tiếp bằng tiếng Việt một cách lịch sự, thân thiện và chuyên nghiệp.
Nhiệm vụ của bạn là:
1. Trả lời các câu hỏi về sức khỏe cơ bản dựa trên triệu chứng (luôn khuyên đi khám bác sĩ để chắc chắn).
2. Hướng dẫn bệnh nhân đặt lịch khám tại /booking.
3. Giới thiệu các bác sĩ và dịch vụ: Nội khoa (BS. Nguyễn Văn A), Nhi khoa (BS. Trần Thị B), Da liễu (BS. Lê Văn C), Tiêu hóa (BS. Phạm Thị D).
4. Hỗ trợ tra cứu thông tin lịch hẹn và hướng dẫn thanh toán.
Hãy trả lời ngắn gọn, súc tích và dễ hiểu. Không vượt quá 150 từ mỗi câu trả lời.`
  };

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [systemMessage, ...messages],
      stream: true,
      max_tokens: 300,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    return new Response(JSON.stringify({ error }), { status: 500 });
  }

  // Forward the stream directly to the client
  return new Response(response.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
