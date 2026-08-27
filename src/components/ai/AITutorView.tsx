import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  RefreshCw,
  BookOpen,
  HelpCircle,
  Zap,
  CheckCircle2,
  ChevronRight,
  Calculator,
  Code2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const AITutorView: React.FC = () => {
  const { user, showToast } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello ${user?.name || 'Student'}! 👋 I am your dedicated AI Examination Tutor.\n\nI can break down complex university course theories (like Data Structures, Algorithms, Physics, Calculus) or WAEC examination topics (Mathematics, English, Chemistry, Biology) step by step with authentic formulas, proofs, and practice exercises.\n\nWhat topic or question are you working on today?`,
      timestamp: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [quickPrompts, setQuickPrompts] = useState<string[]>([
    'Explain time complexity of Quicksort vs Mergesort with worst-case examples',
    'How do I calculate bearings and angles of elevation in WAEC Mathematics?',
    'Why must AVL tree balancing factors stay strictly between -1 and +1?',
    'Give me a step-by-step example of solving quadratic equations using the formula method',
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const history = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.content,
      }));

      const resp = await api.tutorChat({
        messages: history,
        user_context: {
          name: user?.name,
          education_type: user?.profile.education_type,
          university: user?.profile.custom_university_name || 'UNILAG',
          courses: user?.profile.selected_courses,
        },
      });

      if (resp.reply) {
        const aiMsg: ChatMessage = {
          id: `ai_${Date.now()}`,
          role: 'assistant',
          content: resp.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, aiMsg]);
        if (resp.quick_prompts && resp.quick_prompts.length > 0) {
          setQuickPrompts(resp.quick_prompts);
        }
      }
    } catch (e: any) {
      showToast(e.message || 'Error connecting to AI Tutor', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-12 h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 backdrop-blur-md">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <span>AI Subject Tutor</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 backdrop-blur-sm">
                Active 24/7
              </span>
            </h1>
            <p className="text-xs text-slate-300">
              Step-by-step explanations, formula walkthroughs, and syllabus breakdowns
            </p>
          </div>
        </div>

        <button
          onClick={() =>
            setMessages([
              {
                id: 'welcome',
                role: 'assistant',
                content: `Chat cleared! What new concept or exam problem would you like to explore?`,
                timestamp: 'Just now',
              },
            ])
          }
          className="p-2.5 rounded-2xl text-xs text-slate-300 hover:text-white hover:bg-white/10 border border-white/10 transition-colors cursor-pointer backdrop-blur-md"
          title="Clear Conversation"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Prompts Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-[11px] font-bold text-[#FFA05C] whitespace-nowrap flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          <span>Suggested:</span>
        </span>
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(p)}
            className="px-3.5 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 hover:text-white border border-white/10 hover:border-[#FF6A00]/40 whitespace-nowrap transition-all flex-shrink-0 backdrop-blur-md cursor-pointer"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 rounded-3xl bg-white/[0.04] backdrop-blur-2xl border border-white/12 space-y-4 shadow-2xl">
        {messages.map(msg => {
          const isAI = msg.role === 'assistant';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isAI ? 'justify-start' : 'justify-end'} animate-in fade-in duration-200`}
            >
              {isAI && (
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-400/30 text-purple-300 flex items-center justify-center flex-shrink-0 mt-1 backdrop-blur-sm">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-2xl p-4 sm:p-5 rounded-3xl text-xs sm:text-sm leading-relaxed space-y-2 backdrop-blur-md ${
                  isAI
                    ? 'bg-white/[0.06] border border-white/10 text-slate-100 rounded-tl-sm'
                    : 'bg-gradient-to-r from-[#FF6A00] to-[#FF7A1A] text-white font-medium rounded-tr-sm shadow-lg shadow-[#FF6A00]/20 border border-white/20'
                }`}
              >
                <div className="whitespace-pre-line leading-relaxed font-sans">{msg.content}</div>
                <div
                  className={`text-[10px] ${
                    isAI ? 'text-slate-400' : 'text-white/80'
                  } text-right pt-1`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {!isAI && (
                <div className="w-8 h-8 rounded-xl bg-[#FF6A00]/30 border border-white/20 text-[#FFA05C] flex items-center justify-center font-bold text-xs flex-shrink-0 mt-1 backdrop-blur-sm">
                  {user?.name.charAt(0) || 'U'}
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 justify-start animate-pulse">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-400/30 text-purple-300 flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.06] border border-white/10 text-xs text-[#FFA05C] flex items-center gap-2 backdrop-blur-md">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>AI Tutor is formulating step-by-step breakdown...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Bar */}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-2 sm:p-2.5 rounded-2xl bg-white/[0.05] backdrop-blur-2xl border border-white/12 flex items-center gap-2 shadow-xl"
      >
        <input
          type="text"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          placeholder="Ask about formulas, proof concepts, or paste a difficult question..."
          className="flex-1 px-4 py-2.5 text-sm bg-transparent text-white placeholder-slate-400 outline-none"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={!inputText.trim() || loading}
          className="p-3 rounded-xl bg-gradient-to-r from-[#FF6A00] to-[#FF7A1A] hover:from-[#FF7A1A] hover:to-[#FF8A3D] text-white disabled:opacity-50 transition-all shadow-md shadow-[#FF6A00]/25 cursor-pointer border border-white/20"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
