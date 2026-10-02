import React, { useState } from 'react';
import { Bot, Send, Sparkles, User, RefreshCw, MessageSquare, Lightbulb } from 'lucide-react';
import { UserRole } from '../types';
import { askLookEnglishAI, ChatMessage } from '../services/aiChatService';

interface AiAssistantTabProps {
  currentRole: UserRole;
  userName: string;
}

export const AiAssistantTab: React.FC<AiAssistantTabProps> = ({ currentRole, userName }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Chào **${userName}**! Tôi là **LookEnglish AI Assistant**. 
Hôm nay tôi có thể hỗ trợ gì cho bạn? Hãy chọn câu hỏi gợi ý bên dưới hoặc nhập câu hỏi trực tiếp!`,
      timestamp: 'Vừa xong',
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const roleSuggestions: Record<UserRole, string[]> = {
    teacher: [
      'Gợi ý mẫu nhận xét khen thưởng học viên Speaking tốt',
      'Đề xuất giáo án 45 phút kỹ năng Writing Task 2',
      'Cách khích lệ học viên vắng buổi học ôn tập hiệu quả',
      'Đề tài Speaking chủ đề Trí tuệ nhân tạo (AI)',
    ],
    student: [
      'Giải thích cách dùng thì Hiện tại hoàn thành (Present Perfect)',
      '5 từ vựng nâng cao thay thế cho "very good" trong IELTS',
      'Cách luyện nghe Part 3 bài thi Cambridge Flyers',
      'Bí quyết tự tin nói tiếng Anh không sợ sai',
    ],
    parent: [
      'Làm thế nào để hỗ trợ con ôn từ vựng tại nhà mỗi ngày?',
      'Thang điểm 15 khiên Cambridge Starters/Movers có ý nghĩa gì?',
      'Cách liên hệ giáo viên khi con bị ốm cần nghỉ học',
      'Chương trình học tiếng Anh chuẩn quốc tế tại LookEnglish',
    ],
    admin: [
      'Cách tối ưu lịch học cho 15 lớp học của trung tâm',
      'Tiêu chuẩn đánh giá chuyên cần và kỷ luật học đường',
      'Chiến lược tổ chức kỳ thi thử Mock Test định kỳ',
      'Quy trình cấp và lưu trữ chứng chỉ điện tử an toàn',
    ],
  };

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || inputPrompt;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const responseText = await askLookEnglishAI(query, currentRole, userName, messages);
      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'assistant',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai_err_${Date.now()}`,
          sender: 'assistant',
          text: 'Rất tiếc đã có lỗi xảy ra khi xử lý phản hồi. Vui lòng thử lại!',
          timestamp: 'Bây giờ',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white rounded-2xl p-5 sm:p-6 shadow-lg border border-indigo-500/20">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-400/20">
            <Bot className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                LOOK ENGLISH AI Smart Assistant
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                Gemini 2.5 Flash
              </span>
            </div>
            <p className="text-xs sm:text-sm text-indigo-200 mt-0.5">
              Trợ lý thông minh giải đáp tức thì cho Giáo viên, Học viên, Phụ huynh và Ban Quản lý.
            </p>
          </div>
        </div>
      </div>

      {/* Chat Window */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col h-[520px] overflow-hidden">
        {/* Messages scroll area */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/50">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';

            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    isUser
                      ? 'bg-indigo-600 text-white'
                      : 'bg-amber-400 text-slate-950 font-bold'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`max-w-[80%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-2xs ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-tr-xs'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs'
                  }`}
                >
                  <div className="whitespace-pre-line font-normal">{msg.text}</div>
                  <span
                    className={`block text-[10px] mt-1 text-right ${
                      isUser ? 'text-indigo-200' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs p-3.5 text-xs text-slate-500 flex items-center gap-2 shadow-2xs">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-500" />
                <span>LookEnglish AI đang soạn câu trả lời chuyên sâu...</span>
              </div>
            </div>
          )}
        </div>

        {/* Suggestion Chips */}
        <div className="p-3 bg-white border-t border-slate-100 overflow-x-auto">
          <div className="flex items-center gap-1.5 text-[11px] whitespace-nowrap">
            <span className="text-slate-400 font-semibold flex items-center gap-1">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              Gợi ý:
            </span>
            {roleSuggestions[currentRole].map((sug, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSend(sug)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 font-medium transition-colors border border-slate-200"
              >
                {sug}
              </button>
            ))}
          </div>
        </div>

        {/* Input box */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder={`Hỏi LookEnglish AI về phương pháp học, bài tập, thang điểm...`}
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={isLoading || !inputPrompt.trim()}
              className="inline-flex items-center justify-center p-2.5 sm:px-4 sm:py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-95"
            >
              <Send className="w-4 h-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Gửi</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
