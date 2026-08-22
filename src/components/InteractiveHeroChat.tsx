import confetti from 'canvas-confetti';
import { ArrowRight, Bot, Check, CheckCircle2, ChevronRight, HelpCircle, Mic, MicOff, MoreHorizontal, PlusCircle, Send, Sparkles, User, Zap } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Message } from '../types';

interface InteractiveHeroChatProps {
  onGainXp?: (amount: number) => void;
  onOpenSubject?: (subjectId: string) => void;
  onOpenQuiz?: () => void;
}

export const InteractiveHeroChat: React.FC<InteractiveHeroChatProps> = ({
  onGainXp,
  onOpenSubject,
  onOpenQuiz,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'vormi',
      text: "Hi! Let's tackle Quadratic Equations today. Are you ready for a quick puzzle?",
      timestamp: 'Just now',
    },
    {
      id: 'm2',
      sender: 'user',
      text: "Bring it on! I've been practicing the formula.",
      timestamp: 'Just now',
    },
    {
      id: 'm3',
      sender: 'vormi',
      text: 'Awesome. Find the roots for:',
      mathFormula: 'x² - 5x + 6 = 0',
      timestamp: 'Just now',
      suggestedAnswers: ['x = 2 and x = 3', 'x = -2 and x = -3', 'Need a hint', 'Show formula'],
    },
  ]);

  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activeTopic, setActiveTopic] = useState<'quadratic' | 'python' | 'physics'>('quadratic');
  const [scoreCount, setScoreCount] = useState(0);
  const [xpNotification, setXpNotification] = useState<number | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#58f5e0', '#2dd8c4', '#ccbdff', '#aac0ff'],
      });
    } catch {
      // fallback
    }
  };

  const handleSend = (userText: string) => {
    const textToSend = userText.trim();
    if (!textToSend) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const lower = textToSend.toLowerCase();

      // Evaluate answer or respond contextually
      if (lower.includes('2') && lower.includes('3') && !lower.includes('-')) {
        // Correct quadratic answer!
        triggerConfetti();
        onGainXp?.(50);
        setXpNotification(50);
        setTimeout(() => setXpNotification(null), 3000);
        setScoreCount((prev) => prev + 1);

        const aiMsg: Message = {
          id: `vormi-${Date.now()}`,
          sender: 'vormi',
          text: '🎉 Spot on! Factoring gives (x - 2)(x - 3) = 0, so x = 2 and x = 3.',
          mathFormula: '(x - 2)(x - 3) = 0 ⟹ x = 2, 3',
          timestamp: 'Just now',
          xpAwarded: 50,
          suggestedAnswers: [
            'Try another math puzzle',
            'Switch to Python Basics',
            'Explain the discriminant Δ',
          ],
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else if (lower.includes('hint')) {
        const aiMsg: Message = {
          id: `vormi-${Date.now()}`,
          sender: 'vormi',
          text: '💡 Hint: Find two numbers that multiply to give +6 and add up to -5. Think of -2 and -3!',
          timestamp: 'Just now',
          suggestedAnswers: ['x = 2 and x = 3', 'x = 1 and 6'],
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else if (lower.includes('formula') || lower.includes('discriminant')) {
        const aiMsg: Message = {
          id: `vormi-${Date.now()}`,
          sender: 'vormi',
          text: 'Here is the universal Quadratic Formula:',
          mathFormula: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
          timestamp: 'Just now',
          suggestedAnswers: ['Calculate for a=1, b=-5, c=6', 'Try another problem'],
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else if (lower.includes('python')) {
        setActiveTopic('python');
        const aiMsg: Message = {
          id: `vormi-${Date.now()}`,
          sender: 'vormi',
          text: "Let's code! What will this list comprehension return in Python?",
          codeBlock: 'evens = [x * 2 for x in range(5) if x % 2 == 0]\nprint(evens)',
          timestamp: 'Just now',
          suggestedAnswers: ['[0, 4, 8]', '[0, 2, 4]', '[2, 4, 6]'],
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else if (lower.includes('[0, 4, 8]')) {
        triggerConfetti();
        onGainXp?.(50);
        setXpNotification(50);
        setTimeout(() => setXpNotification(null), 3000);

        const aiMsg: Message = {
          id: `vormi-${Date.now()}`,
          sender: 'vormi',
          text: '🔥 Correct! Even numbers under 5 are 0, 2, 4. Multiplied by 2: 0, 4, 8.',
          codeBlock: '# Output: [0, 4, 8]',
          timestamp: 'Just now',
          xpAwarded: 50,
          suggestedAnswers: ['Launch Adaptive Quiz', 'Try Physics Puzzle', 'Reset Chat'],
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else if (lower.includes('physics')) {
        setActiveTopic('physics');
        const aiMsg: Message = {
          id: `vormi-${Date.now()}`,
          sender: 'vormi',
          text: '🚀 Physics Challenge! A 4 kg drone accelerates at 5 m/s². What net force is required?',
          mathFormula: 'F = m \\cdot a',
          timestamp: 'Just now',
          suggestedAnswers: ['20 N', '9 N', '1.25 N'],
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else if (lower.includes('20') || lower.includes('20 n')) {
        triggerConfetti();
        onGainXp?.(50);
        setXpNotification(50);
        setTimeout(() => setXpNotification(null), 3000);

        const aiMsg: Message = {
          id: `vormi-${Date.now()}`,
          sender: 'vormi',
          text: '🎯 Newton would be proud! Force = 4 kg × 5 m/s² = 20 Newtons.',
          timestamp: 'Just now',
          xpAwarded: 50,
          suggestedAnswers: ['Try Quadratic Equations', 'Open AI Tutor Studio', 'Start Adaptive Quiz'],
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else if (lower.includes('reset')) {
        setMessages([
          {
            id: 'm1',
            sender: 'vormi',
            text: "Hi! Let's tackle Quadratic Equations today. Are you ready for a quick puzzle?",
            timestamp: 'Just now',
          },
          {
            id: 'm2',
            sender: 'user',
            text: "Bring it on! I've been practicing the formula.",
            timestamp: 'Just now',
          },
          {
            id: 'm3',
            sender: 'vormi',
            text: 'Awesome. Find the roots for:',
            mathFormula: 'x² - 5x + 6 = 0',
            timestamp: 'Just now',
            suggestedAnswers: ['x = 2 and x = 3', 'x = -2 and x = -3', 'Need a hint', 'Show formula'],
          },
        ]);
      } else {
        // Generic smart tutor reply
        const aiMsg: Message = {
          id: `vormi-${Date.now()}`,
          sender: 'vormi',
          text: `Great thought! In ${activeTopic === 'quadratic' ? 'Algebra' : activeTopic === 'python' ? 'Python' : 'Physics'}, breaking problems into atomic steps is key. Would you like me to guide you to the exact solution or test another topic?`,
          timestamp: 'Just now',
          suggestedAnswers: ['x = 2 and x = 3', 'Give me a hint', 'Try Python puzzle', 'Try Physics puzzle'],
        };
        setMessages((prev) => [...prev, aiMsg]);
      }
    }, 700);
  };

  const handleVoiceToggle = () => {
    setIsListening(!isListening);
    if (!isListening) {
      setInputValue('x = 2 and x = 3');
      setTimeout(() => {
        setIsListening(false);
      }, 1800);
    }
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto h-[600px] mt-8 select-none">
      {/* Floating Card 1 (Math) - Top Left */}
      <div
        onClick={() => onOpenSubject?.('math')}
        className="hidden md:flex absolute left-2 lg:left-4 top-12 lg:top-20 bg-[#1d2025]/95 border border-[#3b4a47] hover:border-[#58f5e0] rounded-xl p-4 w-64 shadow-2xl z-30 flex-col gap-3 animate-float-1 transition-all duration-300 cursor-pointer hover:scale-105 group backdrop-blur-md"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#ccbdff]/15 flex items-center justify-center group-hover:bg-[#ccbdff]/25 transition-colors">
            <span className="font-mono text-[#ccbdff] font-bold text-lg">∑</span >
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-wider font-bold text-[#e1e2ea] group-hover:text-[#58f5e0] transition-colors">
              Mathematics
            </h4>
            <p className="text-[12px] text-[#bacac6]">Algebra Mastery</p>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-[11px] mb-1.5 font-bold uppercase tracking-wider text-[#bacac6]">
            <span>Progress</span>
            <span className="text-[#58f5e0]">78%</span>
          </div>
          <div className="w-full h-1.5 bg-[#32353b] rounded-full overflow-hidden">
            <div className="w-[78%] h-full bg-[#2dd8c4] rounded-full relative shadow-[0_0_10px_#2dd8c4]">
              <div className="absolute right-0 top-0 bottom-0 w-3 bg-white/40 blur-[2px]" />
            </div>
          </div>
        </div>
      </div>

      {/* Floating Card 2 (Coding) - Bottom Right */}
      <div
        onClick={() => onOpenSubject?.('coding')}
        className="hidden md:flex absolute right-2 lg:right-4 bottom-24 lg:bottom-32 bg-[#1d2025]/95 border border-[#3b4a47] hover:border-[#58f5e0] rounded-xl p-4 w-64 shadow-2xl z-30 flex-col gap-3 animate-float-2 transition-all duration-300 cursor-pointer hover:scale-105 group backdrop-blur-md"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#58f5e0]/15 flex items-center justify-center group-hover:bg-[#58f5e0]/25 transition-colors">
            <Bot className="w-5 h-5 text-[#58f5e0]" />
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-wider font-bold text-[#e1e2ea] group-hover:text-[#58f5e0] transition-colors">
              Coding Fundamentals
            </h4>
            <p className="text-[12px] text-[#bacac6]">Python Basics</p>
          </div>
        </div>
        <div className="flex gap-2">
          <span className="px-2 py-0.5 border border-[#3b4a47] rounded text-[10px] uppercase font-bold text-[#bacac6] group-hover:border-[#58f5e0]/50">
            Functions
          </span>
          <span className="px-2 py-0.5 border border-[#3b4a47] rounded text-[10px] uppercase font-bold text-[#bacac6] group-hover:border-[#58f5e0]/50">
            Loops
          </span>
        </div>
      </div>

      {/* Floating Card 3 (Science Quiz Ace) - Bottom Left */}
      <div
        onClick={onOpenQuiz}
        className="hidden lg:flex absolute left-20 bottom-8 bg-[#1d2025]/95 border border-[#3b4a47] hover:border-[#58f5e0] rounded-xl p-3.5 shadow-xl z-10 items-center gap-3 animate-float-3 transition-all duration-300 cursor-pointer hover:scale-105 group backdrop-blur-md"
      >
        <div className="w-8 h-8 rounded-full bg-[#aac0ff]/15 flex items-center justify-center group-hover:bg-[#aac0ff]/30 transition-colors">
          <Zap className="w-4 h-4 text-[#aac0ff]" />
        </div>
        <span className="text-xs uppercase tracking-wider font-bold text-[#e1e2ea] pr-2 group-hover:text-[#58f5e0] transition-colors flex items-center gap-1.5">
          Physics Quiz Ace!
          <ChevronRight className="w-3.5 h-3.5 text-[#bacac6] group-hover:translate-x-0.5 transition-transform" />
        </span>
      </div>

      {/* Main Chat Interface Widget */}
      <div className="absolute left-1/2 -translate-x-1/2 top-0 w-full max-w-xl h-[520px] bg-[#1d2025] rounded-xl border border-[#3b4a47] flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden z-20">
        {/* Chat Header */}
        <div className="h-14 border-b border-[#3b4a47] bg-[#272a30] flex items-center px-4 justify-between select-none">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#58f5e0]/20 flex items-center justify-center border border-[#58f5e0]/30">
              <Bot className="w-4 h-4 text-[#58f5e0]" />
            </div>
            <div>
              <h3 className="text-xs uppercase tracking-wider font-bold text-[#e1e2ea] flex items-center gap-2">
                VORMI
                <span className="w-2 h-2 rounded-full bg-[#58f5e0] animate-pulse" />
              </h3>
              <p className="text-[10px] text-[#bacac6] uppercase tracking-wider">Online • Ready to Assist</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {scoreCount > 0 && (
              <span className="text-xs font-bold text-[#58f5e0] bg-[#58f5e0]/10 px-2 py-0.5 rounded-full border border-[#58f5e0]/30">
                +{scoreCount * 50} XP
              </span>
            )}
            <button
              onClick={() => handleSend('reset')}
              className="text-[#bacac6] hover:text-[#58f5e0] p-1.5 rounded-lg hover:bg-[#1d2025] transition-colors"
              title="Reset conversation"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* XP Floating Toast */}
        {xpNotification && (
          <div className="absolute top-16 right-4 z-40 bg-[#2dd8c4] text-[#005a50] px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1 shadow-lg animate-bounce">
            <Sparkles className="w-3.5 h-3.5" />
            <span>+{xpNotification} XP Earned!</span>
          </div>
        )}

        {/* Chat Body */}
        <div className="flex-1 p-5 flex flex-col gap-3.5 overflow-y-auto chat-scroll bg-[#111319]/90">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[88%] ${
                msg.sender === 'user' ? 'self-end flex-row-reverse' : 'self-start'
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center mt-1 ${
                  msg.sender === 'vormi'
                    ? 'bg-[#58f5e0]/20 text-[#58f5e0]'
                    : 'bg-[#4f2db0] text-[#ccbdff]'
                }`}
              >
                {msg.sender === 'vormi' ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
              </div>

              {/* Bubble */}
              <div className="flex flex-col gap-1.5">
                <div
                  className={`p-3.5 text-[14px] leading-relaxed rounded-2xl ${
                    msg.sender === 'user'
                      ? 'bg-[#2dd8c4] text-[#005a50] font-medium rounded-tr-sm shadow-[0_0_15px_rgba(45,216,196,0.15)]'
                      : 'bg-[#32353b] border border-[#3b4a47] text-[#e1e2ea] rounded-tl-sm'
                  }`}
                >
                  <p>{msg.text}</p>

                  {/* Math Formula Highlight */}
                  {msg.mathFormula && (
                    <div className="bg-[#0c0e14] font-mono text-[13px] p-2.5 rounded-lg mt-2 border border-[#3b4a47]/60 text-[#58f5e0] flex items-center justify-between">
                      <code>{msg.mathFormula}</code>
                      <span className="text-[10px] uppercase font-bold text-[#bacac6] bg-[#1d2025] px-1.5 py-0.5 rounded">
                        Formula
                      </span>
                    </div>
                  )}

                  {/* Code Block Highlight */}
                  {msg.codeBlock && (
                    <pre className="bg-[#0c0e14] font-mono text-[12px] p-2.5 rounded-lg mt-2 border border-[#3b4a47]/60 text-[#ccbdff] overflow-x-auto">
                      <code>{msg.codeBlock}</code>
                    </pre>
                  )}
                </div>

                {/* Suggested Fast Answer Chips */}
                {msg.suggestedAnswers && msg.suggestedAnswers.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {msg.suggestedAnswers.map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(chip)}
                        className="text-[11px] bg-[#1d2025] hover:bg-[#272a30] text-[#58f5e0] hover:text-[#5efae5] border border-[#3b4a47] hover:border-[#58f5e0] px-2.5 py-1 rounded-full transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                      >
                        <span>{chip}</span>
                        <ArrowRight className="w-2.5 h-2.5 opacity-60" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex gap-3 max-w-[85%] self-start">
              <div className="w-6 h-6 rounded-full bg-[#58f5e0]/20 flex-shrink-0 flex items-center justify-center mt-1">
                <Bot className="w-3.5 h-3.5 text-[#58f5e0]" />
              </div>
              <div className="bg-[#32353b] border border-[#3b4a47] rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#58f5e0] animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[#58f5e0] animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[#58f5e0] animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Chat Input Area */}
        <div className="p-3.5 bg-[#272a30] border-t border-[#3b4a47] flex items-center gap-2">
          <div className="flex-1 bg-[#111319] border border-[#3b4a47] focus-within:border-[#58f5e0] rounded-full px-3.5 py-1.5 flex items-center gap-2 transition-colors">
            <button
              onClick={() => handleSend('Show formula')}
              className="text-[#bacac6] hover:text-[#58f5e0] transition-colors p-1"
              title="Insert formula preset"
            >
              <PlusCircle className="w-4 h-4" />
            </button>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend(inputValue);
              }}
              placeholder={isListening ? 'Listening to speech...' : 'Type your answer (e.g. x = 2 and x = 3)...'}
              className="w-full bg-transparent text-sm text-[#e1e2ea] placeholder-[#bacac6]/60 focus:outline-none"
            />
            <button
              onClick={handleVoiceToggle}
              className={`p-1 rounded-full transition-colors ${
                isListening ? 'text-[#58f5e0] bg-[#58f5e0]/20 animate-pulse' : 'text-[#bacac6] hover:text-[#58f5e0]'
              }`}
              title="Voice Speech Input"
            >
              {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>
          </div>

          <button
            onClick={() => handleSend(inputValue)}
            disabled={!inputValue.trim() && !isTyping}
            className="w-9 h-9 rounded-full bg-[#2dd8c4] text-[#005a50] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-[0_0_15px_rgba(45,216,196,0.25)] cursor-pointer"
          >
            <Send className="w-4 h-4 fill-current" />
          </button>
        </div>
      </div>
    </div>
  );
};
