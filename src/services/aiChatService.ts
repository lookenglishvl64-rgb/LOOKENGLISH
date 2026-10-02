import { GoogleGenAI } from '@google/genai';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  targetRole?: 'teacher' | 'student' | 'parent' | 'all';
}

export async function askLookEnglishAI(
  prompt: string,
  userRole: string,
  userName: string,
  history: ChatMessage[]
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY;

  const systemInstruction = `
Bạn là Trợ lý AI Thông Minh của Hệ Thống Trung Tâm Ngoại Ngữ LookEnglish (LookEnglish AI Assistant).
Đối tượng đang trò chuyện với bạn:
- Tên: ${userName}
- Vai trò: ${userRole} (Admin / Teacher / Student / Parent)

Nhiệm vụ của bạn tùy theo vai trò:
1. Nếu là Giáo viên (Teacher):
   - Gợi ý giáo án giảng dạy 4 kỹ năng (Nghe, Nói, Đọc, Viết) theo chuẩn Cambridge hoặc IELTS.
   - Hướng dẫn mẫu nhận xét học viên (Khen thưởng, khích lệ hoặc góp ý xây dựng khéo léo).
   - Đề xuất chủ đề bài tập về nhà sáng tạo, tiêu chí chấm điểm (rubric).
2. Nếu là Học viên (Student):
   - Giải thích ngữ pháp tiếng Anh dễ hiểu, kèm ví dụ sinh động.
   - Sửa lỗi câu, gợi ý từ vựng nâng cao (collocations, idioms).
   - Động viên học viên, chia sẻ bí quyết cải thiện kỹ năng nghe/nói.
3. Nếu là Phụ huynh (Parent):
   - Giải thích phương pháp đồng hành cùng con học tiếng Anh tại nhà.
   - Hướng dẫn cách đọc bảng điểm 4 kỹ năng, thang điểm Cambridge (Shields) và IELTS Band.
   - Giải đáp nhẹ nhàng, ân cần, tạo sự an tâm tuyệt đối về chất lượng đào tạo tại LookEnglish.

Quy định phản hồi:
- Trả lời bằng tiếng Việt chuẩn mực, lịch sự, chuyên nghiệp, nhiệt tình, có thể chèn từ vựng tiếng Anh minh họa.
- Định dạng rõ ràng bằng gạch đầu dòng, highlight từ khóa.
- Luôn giữ thái độ truyền cảm hứng học tập.
`;

  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { role: 'user', parts: [{ text: systemInstruction }] },
          ...history.slice(-6).map((msg) => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }],
          })),
          { role: 'user', parts: [{ text: prompt }] },
        ],
      });
      if (response.text) {
        return response.text;
      }
    } catch (err) {
      console.warn('Gemini API call failed, falling back to smart simulated assistant', err);
    }
  }

  // Smart fallback responder if API key is unconfigured
  const lower = prompt.toLowerCase();

  if (userRole === 'teacher') {
    if (lower.includes('nhận xét') || lower.includes('khen') || lower.includes('phê bình')) {
      return `### 💡 Gợi ý nhận xét học viên từ LookEnglish AI:
- **Mẫu Khen thưởng (Reward):** "Em [Tên] có tinh thần học tập gương mẫu, xuất sắc đạt điểm số cao trong bài kiểm tra định kỳ. Phản xạ giao tiếp lưu loát và chủ động hỗ trợ bạn bè trong nhóm."
- **Mẫu Biểu dương (Praise):** "Ghi nhận sự tiến bộ rõ rệt của em trong kỹ năng Nói và Phát âm. Cần tiếp tục duy trì phong độ này ở các bài thi thử sắp tới!"
- **Mẫu Góp ý / Nhắc nhở tích cực (Discipline):** "Em có tư duy ngôn ngữ tốt nhưng cần rèn luyện tính tập trung cao độ hơn khi làm bài Đọc, đồng thời hoàn thành đủ bài tập về nhà trước buổi học."`;
    }
    if (lower.includes('bài tập') || lower.includes('speaking') || lower.includes('writing')) {
      return `### 📚 Đề xuất bài tập phát triển kỹ năng Speaking & Writing:
1. **Speaking Task:** "Record a 2-minute voice note describing your favorite green invention. Focus on using at least 3 conditionals and 2 contrast linkers."
2. **Writing Prompt:** "Some people argue that online language learning is more effective than traditional classrooms. To what extent do you agree or disagree? (180 - 250 words)."
*Mẹo:* Bạn có thể tải file PDF bài tập lên tab **Bài Tập** để học viên nộp bài trực tiếp qua ứng dụng.`;
    }
    return `Chào thầy/cô! LookEnglish AI sẵn sàng hỗ trợ thầy/cô thiết kế giáo án, soạn bài kiểm tra 4 kỹ năng, và chấm điểm nhận xét học viên. Thầy/cô cần hỗ trợ phần nào hôm nay ạ?`;
  }

  if (userRole === 'parent') {
    if (lower.includes('điểm') || lower.includes('khiên') || lower.includes('kết quả')) {
      return `Kính chào Quý Phụ huynh!
Tại trung tâm LookEnglish, tiến độ của các con được cập nhật minh bạch:
- **Thang điểm Cambridge:** Tối đa 15 Khiên (Shields) cho 3 phần Nghe, Đọc-Viết và Nói. Đạt từ 10 khiên trở lên là đạt chuẩn tiếp thu rất tốt.
- **Thang điểm IELTS:** Đánh giá từ Band 1.0 đến 9.0 cho 4 kỹ năng toàn diện.
Quý phụ huynh có thể vào tab **Bảng Điểm** hoặc **Chứng Chỉ** để xem kết quả chi tiết của con mình ngay tại ứng dụng!`;
    }
    return `Chào Quý Phụ huynh! LookEnglish rất vui được đồng hành cùng gia đình trên hành trình phát triển ngôn ngữ của con. Quý phụ huynh cần tra cứu thời khóa biểu, điểm danh hay phương pháp đồng hành cùng con tại nhà ạ?`;
  }

  // Student role
  if (lower.includes('ielts') || lower.includes('speaking') || lower.includes('từ vựng')) {
    return `### 🌟 Mẹo cải thiện Speaking Band 7.0+:
1. **Fluency & Coherence:** Đừng ngập ngừng dịch từ tiếng Việt, hãy dùng filler phrases như *"Well, to be perfectly honest..."*, *"From my perspective..."*.
2. **Lexical Resource:** Thay vì dùng "very good", hãy dùng *"exceptional"*, *"outstanding"*, hoặc *"second to none"*.
3. **Pronunciation:** Chú ý các âm đuôi (/s/, /z/, /ed/) và ngữ điệu lên xuống tự nhiên.
Chúc bạn luyện tập thật hăng say và giành vị trí Top 1 tháng này tại LookEnglish nhé!`;
  }

  return `Chào bạn! Mình là Trợ lý AI của LookEnglish. Mình có thể giúp bạn giải đáp ngữ pháp, tra từ vựng, gợi ý dàn bài Writing, hoặc hướng dẫn cách nộp bài tập về nhà. Hãy thử hỏi mình bất cứ câu hỏi nào nhé!`;
}
