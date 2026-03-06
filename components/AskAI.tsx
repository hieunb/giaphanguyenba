'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, BookOpen, AlertCircle, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: { id: string; title: string }[];
  isError?: boolean;
}

const SUGGESTIONS = [
  'Dòng họ tôi có nguồn gốc từ đâu?',
  'Ai là tổ tiên đời đầu tiên?',
  'Có bao nhiêu thế hệ trong gia phả?',
  'Kể về những sự kiện lịch sử của dòng họ',
];

export default function AskAI() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (question: string) => {
    if (!question.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: question };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `Lỗi: ${data.error || 'Không thể kết nối AI'}`,
          isError: true,
        }]);
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.answer,
          sources: data.sources,
        }]);
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Không thể kết nối đến máy chủ. Vui lòng thử lại.',
        isError: true,
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="flex flex-col h-full max-h-[70vh] min-h-[400px]">
      {/* Message area */}
      <div className="flex-1 overflow-y-auto space-y-4 px-1 py-2">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="size-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-200">
              <Bot size={32} className="text-amber-600" />
            </div>
            <h3 className="font-semibold text-gray-700 mb-1">Trợ lý Gia phả AI</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
              Hỏi bất kỳ điều gì về gia phả dòng họ. Tôi sẽ tìm kiếm trong kho tài liệu và trả lời bạn.
            </p>
            <div className="grid gap-2 max-w-sm mx-auto">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-left text-sm px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {/* Avatar */}
              <div className={`flex-shrink-0 size-8 rounded-full flex items-center justify-center ${
                msg.role === 'user'
                  ? 'bg-amber-100 text-amber-700'
                  : msg.isError
                    ? 'bg-red-100 text-red-600'
                    : 'bg-gray-100 text-gray-600'
              }`}>
                {msg.role === 'user' ? <User size={16} /> : msg.isError ? <AlertCircle size={16} /> : <Bot size={16} />}
              </div>

              {/* Bubble */}
              <div className={`flex-1 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-amber-600 text-white rounded-tr-sm'
                    : msg.isError
                      ? 'bg-red-50 text-red-700 border border-red-200 rounded-tl-sm'
                      : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm'
                }`}>
                  {msg.content}
                </div>
                {/* Sources */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {msg.sources.map((src) => (
                      <span key={src.id} className="flex items-center gap-1 text-xs px-2 py-0.5 bg-gray-50 border border-gray-200 rounded-full text-gray-500">
                        <BookOpen size={10} />
                        {src.title}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 size-8 rounded-full bg-gray-100 flex items-center justify-center">
              <Bot size={16} className="text-gray-600" />
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white border border-gray-200 shadow-sm">
              <Loader2 size={16} className="animate-spin text-amber-600" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Hỏi về gia phả dòng họ..."
          disabled={isLoading}
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="px-4 py-2.5 bg-amber-600 text-white rounded-xl hover:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
