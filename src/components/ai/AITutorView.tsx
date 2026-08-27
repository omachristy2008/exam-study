import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  RefreshCw,
  Mic,
  MicOff,
  Square,
  Volume2,
  AlertCircle,
  AudioWaveform,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// Support for standard and webkit speech recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const AITutorView: React.FC = () => {
  const { user, showToast } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello ${user?.name || 'Student'}! 👋 I am your dedicated AI Examination Tutor.\n\nI can break down complex university course theories (like Data Structures, Algorithms, Physics, Calculus) or WAEC examination topics (Mathematics, English, Chemistry, Biology) step by step with authentic formulas, proofs, and practice exercises.\n\nYou can type your questions or tap the 🎙️ microphone button below to speak your questions hands-free!`,
      timestamp: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [quickPrompts, setQuickPrompts] = useState<string[]>([
    'Explain time complexity of Quicksort vs Mergesort with worst-case examples',
    'How do I calculate bearings and angles of elevation in WAEC Mathematics?',
    'Why must AVL tree balancing factors stay strictly between -1 and +1?',
    'Give me a step-by-step example of solving quadratic equations using the formula method',
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, interimTranscript]);

  // Check speech recognition capability on mount
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // Ignore cleanup errors
        }
      }
    };
  }, []);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast('Speech recognition is not supported in this browser. Please type your query.', 'warning');
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setInterimTranscript('');
        showToast('Microphone active. Speak your question now...', 'info');
      };

      recognition.onresult = (event: any) => {
        let currentFinal = '';
        let currentInterim = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcriptSegment = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            currentFinal += transcriptSegment;
          } else {
            currentInterim += transcriptSegment;
          }
        }

        if (currentFinal) {
          setInputText(prev => (prev ? `${prev} ${currentFinal.trim()}` : currentFinal.trim()));
        }
        setInterimTranscript(currentInterim);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition status/error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          showToast('Microphone access was denied. Please allow microphone permissions in browser settings.', 'error');
        } else if (event.error === 'no-speech') {
          // No speech detected, silently keep listening or standby
        } else {
          showToast(`Microphone notification: ${event.error}`, 'warning');
        }
        setIsListening(false);
        setInterimTranscript('');
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('Failed to start voice recognition:', err);
      showToast('Could not initialize microphone. Please check device permissions.', 'error');
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsListening(false);
    setInterimTranscript('');
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    // If listening, stop listening first
    if (isListening) {
      stopListening();
    }

    const text = textToSend || (interimTranscript ? `${inputText} ${interimTranscript}`.trim() : inputText);
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setInterimTranscript('');
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
      <div className="flex items-center justify-between border-b border-[#27272C] pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 backdrop-blur-md">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#F5F5F5] flex items-center gap-2">
              <span>AI Subject Tutor</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 backdrop-blur-sm">
                Active 24/7
              </span>
            </h1>
            <p className="text-xs text-[#A1A1AA]">
              Voice & text step-by-step explanations, formula walkthroughs, and syllabus breakdowns
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Clear Conversation Button */}
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
            className="p-2.5 rounded-2xl text-xs text-[#A1A1AA] hover:text-[#F5F5F5] hover:bg-[#1A1A1E] border border-[#27272C] transition-colors cursor-pointer"
            title="Clear Conversation"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
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
            className="px-3.5 py-1.5 rounded-full bg-[#151518] hover:bg-[#1A1A1E] text-[#A1A1AA] hover:text-[#F5F5F5] border border-[#27272C] hover:border-[#FF6A00]/40 whitespace-nowrap transition-all flex-shrink-0 cursor-pointer"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 rounded-3xl bg-[#151518] border border-[#27272C] space-y-4 shadow-2xl">
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
                className={`max-w-2xl p-4 sm:p-5 rounded-3xl text-xs sm:text-sm leading-relaxed space-y-2 ${
                  isAI
                    ? 'bg-[#1A1A1E] border border-[#27272C] text-[#F5F5F5] rounded-tl-sm'
                    : 'bg-gradient-to-r from-[#FF6A00] to-[#FF7A1A] text-white font-medium rounded-tr-sm shadow-lg shadow-[#FF6A00]/20 border border-white/20'
                }`}
              >
                <div className="whitespace-pre-line leading-relaxed font-sans">{msg.content}</div>
                <div
                  className={`text-[10px] ${
                    isAI ? 'text-[#71717A]' : 'text-white/80'
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

        {/* Live Audio Transcription Bubble when listening */}
        {isListening && (
          <div className="flex gap-3 justify-end animate-in fade-in duration-150">
            <div className="max-w-xl p-4 rounded-3xl bg-[#FF6A00]/15 border border-[#FF6A00]/40 text-[#F5F5F5] space-y-2 rounded-tr-sm shadow-xl">
              <div className="flex items-center gap-2 text-xs font-bold text-[#FFA05C]">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                </span>
                <span>Transcribing Speech...</span>
              </div>
              <div className="text-sm font-medium italic text-[#F5F5F5] min-h-[24px]">
                {inputText} {interimTranscript ? <span className="text-[#FFA05C]">{interimTranscript}</span> : <span className="text-[#71717A]">Listening for your voice...</span>}
              </div>
            </div>
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center flex-shrink-0 mt-1 animate-pulse">
              <Mic className="w-4 h-4" />
            </div>
          </div>
        )}

        {loading && (
          <div className="flex gap-3 justify-start animate-pulse">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-400/30 text-purple-300 flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl bg-[#1A1A1E] border border-[#27272C] text-xs text-[#FFA05C] flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>AI Tutor is formulating step-by-step breakdown...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Voice Recognition Active Banner */}
      {isListening && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between gap-3 animate-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-500/20 text-rose-400">
              <span className="w-1.5 h-3 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-5 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-2 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="w-1.5 h-4 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '450ms' }} />
            </div>
            <div>
              <div className="text-xs font-bold text-[#F5F5F5]">Listening to microphone...</div>
              <div className="text-[11px] text-[#A1A1AA]">
                Speak clearly. Tap &quot;Send Question&quot; or stop the mic when done.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={stopListening}
              className="px-3 py-1.5 rounded-xl bg-[#1A1A1E] hover:bg-[#202026] text-[#A1A1AA] hover:text-white border border-[#27272C] text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Square className="w-3 h-3 text-rose-400" />
              <span>Stop Mic</span>
            </button>
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() && !interimTranscript.trim()}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#FF6A00] to-[#FF7A1A] text-white text-xs font-bold shadow-md shadow-[#FF6A00]/25 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all border border-white/20"
            >
              <Send className="w-3 h-3" />
              <span>Send Question</span>
            </button>
          </div>
        </div>
      )}

      {/* Chat Input Bar */}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-2 sm:p-2.5 rounded-2xl bg-[#151518] border border-[#27272C] flex items-center gap-2 shadow-xl relative"
      >
        {/* Hands-free Voice Input Button */}
        <button
          type="button"
          onClick={toggleListening}
          disabled={loading}
          title={
            !speechSupported
              ? 'Voice recognition not supported in this browser'
              : isListening
              ? 'Stop microphone'
              : 'Speak your question (Hands-free voice input)'
          }
          className={`p-3 rounded-xl transition-all cursor-pointer flex items-center justify-center border ${
            isListening
              ? 'bg-rose-500 text-white border-rose-400 shadow-lg shadow-rose-500/30 animate-pulse'
              : 'bg-[#1A1A1E] hover:bg-[#202026] text-[#FFA05C] hover:text-white border-[#27272C] hover:border-[#FF6A00]/40'
          } disabled:opacity-40`}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        <input
          type="text"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          placeholder={
            isListening
              ? 'Listening to your speech...'
              : 'Ask about formulas, proof concepts, or speak your question...'
          }
          className="flex-1 px-3 py-2.5 text-sm bg-transparent text-[#F5F5F5] placeholder-[#71717A] outline-none"
          disabled={loading}
        />

        <button
          type="submit"
          disabled={(!inputText.trim() && !interimTranscript.trim()) || loading}
          className="p-3 rounded-xl bg-gradient-to-r from-[#FF6A00] to-[#FF7A1A] hover:from-[#FF7A1A] hover:to-[#FF8A3D] text-white disabled:opacity-50 transition-all shadow-md shadow-[#FF6A00]/25 cursor-pointer border border-white/20"
          title="Send Question"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
