import confetti from 'canvas-confetti';
import {
  Award,
  BarChart3,
  BookOpen,
  Bot,
  BrainCircuit,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock,
  Compass,
  FileText,
  Flame,
  Gamepad2,
  HelpCircle,
  Image as ImageIcon,
  Lock,
  MapPin,
  Mic,
  Plus,
  Play,
  RotateCcw,
  Send,
  Sparkles,
  Star,
  Target,
  Terminal,
  Trophy,
  Upload,
  User,
  X,
  Zap,
} from 'lucide-react';
import React, { useState } from 'react';
import { BADGES, ROADMAP_NODES, SAMPLE_DOUBTS, SAMPLE_QUIZZES, SUBJECTS } from '../data/mockData';
import { Badge, Message, QuizQuestion, SubjectModule, UserProfile } from '../types';
import { VormirixLogo } from './VormirixLogo';

interface StudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  initialTab?: string;
  onGainXp: (amount: number) => void;
  onOpenUpgrade: () => void;
}

export const StudioModal: React.FC<StudioModalProps> = ({
  isOpen,
  onClose,
  user,
  initialTab = 'tutor',
  onGainXp,
  onOpenUpgrade,
}) => {
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [selectedSubject, setSelectedSubject] = useState<SubjectModule>(SUBJECTS[0]);

  // AI Tutor state
  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'vormi',
      text: `Hello ${user.name.split(' ')[0]}! I'm Vormi, your personal 24/7 AI tutor. What subject are we mastering today?`,
      timestamp: 'Just now',
      suggestedAnswers: [
        'Practice Quadratic Equations',
        'Debug Python list comprehension',
        'Explain Newton’s second law',
        'Solve chemistry reaction mechanism',
      ],
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Quiz state
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  // Doubt solver state
  const [doubtText, setDoubtText] = useState('');
  const [selectedPresetDoubt, setSelectedPresetDoubt] = useState<any>(SAMPLE_DOUBTS[0]);
  const [isSolvingDoubt, setIsSolvingDoubt] = useState(false);
  const [solvedDoubtResult, setSolvedDoubtResult] = useState<any>(SAMPLE_DOUBTS[0]);

  if (!isOpen) return null;

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#58f5e0', '#2dd8c4', '#ccbdff', '#aac0ff'],
      });
    } catch {
      // ignore
    }
  };

  const handleSendChat = (text: string) => {
    const cleanText = text.trim();
    if (!cleanText) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: cleanText,
      timestamp: 'Just now',
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const lower = cleanText.toLowerCase();

      if (lower.includes('quadratic') || lower.includes('x²')) {
        const aiMsg: Message = {
          id: `v-${Date.now()}`,
          sender: 'vormi',
          text: 'Here is a tailored quadratic challenge to level up your algebra score:',
          mathFormula: '2x² - 8x + 6 = 0',
          timestamp: 'Just now',
          suggestedAnswers: ['x = 1 and x = 3', 'x = 2 and x = 4', 'Give me a hint'],
        };
        setChatMessages((prev) => [...prev, aiMsg]);
      } else if (lower.includes('1') && lower.includes('3')) {
        triggerConfetti();
        onGainXp(60);
        const aiMsg: Message = {
          id: `v-${Date.now()}`,
          sender: 'vormi',
          text: '⭐ Excellent! Divide the equation by 2: x² - 4x + 3 = 0 ⟹ (x - 1)(x - 3) = 0. The roots are x = 1 and x = 3!',
          timestamp: 'Just now',
          xpAwarded: 60,
          suggestedAnswers: ['Next quadratic puzzle', 'Switch to Python', 'View My Roadmap'],
        };
        setChatMessages((prev) => [...prev, aiMsg]);
      } else if (lower.includes('python')) {
        const aiMsg: Message = {
          id: `v-${Date.now()}`,
          sender: 'vormi',
          text: 'Python Practice! What does this dictionary comprehension produce?',
          codeBlock: 'squares = {x: x**2 for x in (2, 4, 6)}\nprint(squares)',
          timestamp: 'Just now',
          suggestedAnswers: ['{2: 4, 4: 16, 6: 36}', '[4, 16, 36]', '{4, 16, 36}'],
        };
        setChatMessages((prev) => [...prev, aiMsg]);
      } else if (lower.includes('{2: 4, 4: 16, 6: 36}')) {
        triggerConfetti();
        onGainXp(60);
        const aiMsg: Message = {
          id: `v-${Date.now()}`,
          sender: 'vormi',
          text: '🎯 Brilliant! Key-value mapping pairs each number with its square.',
          timestamp: 'Just now',
          xpAwarded: 60,
          suggestedAnswers: ['Try Physics Question', 'Explore Daily Quests'],
        };
        setChatMessages((prev) => [...prev, aiMsg]);
      } else {
        const aiMsg: Message = {
          id: `v-${Date.now()}`,
          sender: 'vormi',
          text: `Great query! I've logged this in your ${selectedSubject.title} study ledger. Let's break this concept down with interactive steps:`,
          mathFormula: 'Concept \\rightarrow Derivation \\rightarrow Practice \\rightarrow Mastery',
          timestamp: 'Just now',
          suggestedAnswers: ['Give me a quick puzzle', 'Show step-by-step example', 'Test my knowledge'],
        };
        setChatMessages((prev) => [...prev, aiMsg]);
      }
    }, 600);
  };

  const handleQuizAnswer = (optionIdx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(optionIdx);
    setIsAnswerSubmitted(true);

    const currentQ = SAMPLE_QUIZZES[currentQuizIndex];
    if (optionIdx === currentQ.correctIndex) {
      setQuizScore((prev) => prev + 1);
      onGainXp(50);
      triggerConfetti();
    }
  };

  const handleNextQuiz = () => {
    if (currentQuizIndex + 1 < SAMPLE_QUIZZES.length) {
      setCurrentQuizIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      setQuizFinished(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuizIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setQuizScore(0);
    setQuizFinished(false);
  };

  const handleSolveDoubt = () => {
    setIsSolvingDoubt(true);
    setTimeout(() => {
      setIsSolvingDoubt(false);
      setSolvedDoubtResult({
        id: `custom-${Date.now()}`,
        subject: 'Custom Doubt',
        title: doubtText || 'Calculate instantaneous acceleration and root values',
        latex: 'f(x) = ax^2 + bx + c',
        solutionSteps: [
          'Deconstruct problem statement into given values and target variables.',
          'Identify suitable physical/mathematical theorem: Apply standard formula.',
          'Substitute variables with dimensional consistency checks.',
          'Result verified with zero tolerance error.',
        ],
      });
      onGainXp(40);
      triggerConfetti();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-[#111319] border border-[#3b4a47] w-full max-w-6xl h-[92vh] max-h-[900px] rounded-2xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Studio Topbar */}
        <div className="h-16 border-b border-[#272a30] bg-[#191c21] px-6 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#111319] border border-[#3b4a47] flex items-center justify-center shadow-[0_0_15px_rgba(88,245,224,0.2)]">
              <VormirixLogo size={20} variant="gradient" withGlow />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-['Manrope'] font-extrabold text-lg text-[#e1e2ea]">
                  Vormirix Studio
                </span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-[#2dd8c4]/20 text-[#58f5e0] border border-[#2dd8c4]/40 rounded-full">
                  Interactive App Mode
                </span>
              </div>
            </div>
          </div>

          {/* User stats & close button */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 text-xs font-bold bg-[#1d2025] px-3.5 py-1.5 rounded-full border border-[#3b4a47]">
              <span className="text-[#f59e0b] flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-current" />
                {user.streakDays} Day Streak
              </span>
              <span className="text-[#3b4a47]">|</span>
              <span className="text-[#58f5e0] flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5" />
                {user.currentXp} XP
              </span>
            </div>

            <button
              onClick={onClose}
              className="text-[#bacac6] hover:text-[#e1e2ea] p-2 rounded-lg hover:bg-[#272a30] transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Studio Content Layout */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Sidebar Tabs */}
          <div className="w-full md:w-64 bg-[#191c21]/90 border-r border-[#272a30] p-4 flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible flex-shrink-0">
            <button
              onClick={() => setActiveTab('tutor')}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap md:whitespace-normal cursor-pointer ${
                activeTab === 'tutor'
                  ? 'bg-[#2dd8c4] text-[#005a50] shadow-[0_0_15px_rgba(45,216,196,0.25)]'
                  : 'text-[#bacac6] hover:bg-[#1d2025] hover:text-[#e1e2ea]'
              }`}
            >
              <BrainCircuit className="w-4 h-4 flex-shrink-0" />
              <span>AI Tutor Chat</span>
            </button>

            <button
              onClick={() => setActiveTab('roadmap')}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap md:whitespace-normal cursor-pointer ${
                activeTab === 'roadmap'
                  ? 'bg-[#ccbdff] text-[#1f0060] shadow-[0_0_15px_rgba(204,189,255,0.25)]'
                  : 'text-[#bacac6] hover:bg-[#1d2025] hover:text-[#e1e2ea]'
              }`}
            >
              <Compass className="w-4 h-4 flex-shrink-0" />
              <span>Smart Roadmap</span>
            </button>

            <button
              onClick={() => setActiveTab('doubts')}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap md:whitespace-normal cursor-pointer ${
                activeTab === 'doubts'
                  ? 'bg-[#aac0ff] text-[#001847] shadow-[0_0_15px_rgba(170,192,255,0.25)]'
                  : 'text-[#bacac6] hover:bg-[#1d2025] hover:text-[#e1e2ea]'
              }`}
            >
              <HelpCircle className="w-4 h-4 flex-shrink-0" />
              <span>Instant Doubts</span>
            </button>

            <button
              onClick={() => setActiveTab('quiz')}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap md:whitespace-normal cursor-pointer ${
                activeTab === 'quiz'
                  ? 'bg-[#ffb4ab] text-[#690005] shadow-[0_0_15px_rgba(255,180,171,0.25)]'
                  : 'text-[#bacac6] hover:bg-[#1d2025] hover:text-[#e1e2ea]'
              }`}
            >
              <Zap className="w-4 h-4 flex-shrink-0" />
              <span>Adaptive Quiz</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap md:whitespace-normal cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-[#5efae5] text-[#00201c] shadow-[0_0_15px_rgba(94,250,229,0.25)]'
                  : 'text-[#bacac6] hover:bg-[#1d2025] hover:text-[#e1e2ea]'
              }`}
            >
              <BarChart3 className="w-4 h-4 flex-shrink-0" />
              <span>Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab('gamification')}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap md:whitespace-normal cursor-pointer ${
                activeTab === 'gamification'
                  ? 'bg-[#e7deff] text-[#1f0060] shadow-[0_0_15px_rgba(231,222,255,0.25)]'
                  : 'text-[#bacac6] hover:bg-[#1d2025] hover:text-[#e1e2ea]'
              }`}
            >
              <Trophy className="w-4 h-4 flex-shrink-0" />
              <span>Badges & XP</span>
            </button>

            <div className="mt-auto hidden md:block pt-4 border-t border-[#272a30]">
              <div className="bg-[#1d2025] rounded-xl p-3 border border-[#3b4a47] flex flex-col gap-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#bacac6]">
                  <span>Plan: {user.plan}</span>
                  <span className="text-[#58f5e0]">Active</span>
                </div>
                <button
                  onClick={onOpenUpgrade}
                  className="w-full text-center text-[10px] uppercase tracking-wider font-extrabold bg-[#58f5e0]/20 text-[#58f5e0] hover:bg-[#58f5e0] hover:text-[#003731] py-1.5 rounded-lg border border-[#58f5e0]/40 transition-all cursor-pointer"
                >
                  Upgrade to Pro
                </button>
              </div>
            </div>
          </div>

          {/* Tab 1: AI Tutor Chat */}
          {activeTab === 'tutor' && (
            <div className="flex-1 flex flex-col bg-[#111319] overflow-hidden">
              {/* Subject switcher pills */}
              <div className="p-3 bg-[#191c21] border-b border-[#272a30] flex items-center gap-2 overflow-x-auto">
                <span className="text-xs font-bold text-[#bacac6] uppercase tracking-wider pl-2">
                  Topic:
                </span>
                {SUBJECTS.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => {
                      setSelectedSubject(sub);
                      handleSendChat(`Let's study ${sub.title}: ${sub.subtitle}`);
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      selectedSubject.id === sub.id
                        ? 'bg-[#2dd8c4] text-[#005a50]'
                        : 'bg-[#1d2025] text-[#bacac6] border border-[#3b4a47] hover:border-[#58f5e0]'
                    }`}
                  >
                    <span>{sub.title}</span>
                    <span className="text-[10px] opacity-75">{sub.progress}%</span>
                  </button>
                ))}
              </div>

              {/* Chat messages */}
              <div className="flex-1 p-6 overflow-y-auto chat-scroll flex flex-col gap-4">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 max-w-[85%] ${
                      msg.sender === 'user' ? 'self-end flex-row-reverse' : 'self-start'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center mt-1 ${
                        msg.sender === 'vormi'
                          ? 'bg-[#58f5e0]/20 text-[#58f5e0]'
                          : 'bg-[#4f2db0] text-[#ccbdff]'
                      }`}
                    >
                      {msg.sender === 'vormi' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>
                    <div className="flex flex-col gap-2">
                      <div
                        className={`p-4 rounded-2xl text-[14px] leading-relaxed ${
                          msg.sender === 'user'
                            ? 'bg-[#2dd8c4] text-[#005a50] font-medium rounded-tr-sm'
                            : 'bg-[#1d2025] border border-[#3b4a47] text-[#e1e2ea] rounded-tl-sm'
                        }`}
                      >
                        <p>{msg.text}</p>
                        {msg.mathFormula && (
                          <div className="bg-[#0c0e14] font-mono text-[13px] p-3 rounded-lg mt-2 border border-[#3b4a47]/60 text-[#58f5e0]">
                            <code>{msg.mathFormula}</code>
                          </div>
                        )}
                        {msg.codeBlock && (
                          <pre className="bg-[#0c0e14] font-mono text-[12px] p-3 rounded-lg mt-2 border border-[#3b4a47]/60 text-[#ccbdff] overflow-x-auto">
                            <code>{msg.codeBlock}</code>
                          </pre>
                        )}
                        {msg.xpAwarded && (
                          <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#58f5e0]/20 text-[#58f5e0] text-xs font-bold">
                            <Sparkles className="w-3 h-3" />
                            <span>+{msg.xpAwarded} XP Earned</span>
                          </div>
                        )}
                      </div>

                      {msg.suggestedAnswers && msg.suggestedAnswers.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {msg.suggestedAnswers.map((chip, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSendChat(chip)}
                              className="text-xs bg-[#1d2025] hover:bg-[#272a30] text-[#58f5e0] border border-[#3b4a47] hover:border-[#58f5e0] px-3 py-1 rounded-full transition-all cursor-pointer flex items-center gap-1"
                            >
                              <span>{chip}</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex gap-3 max-w-[85%] self-start">
                    <div className="w-7 h-7 rounded-full bg-[#58f5e0]/20 text-[#58f5e0] flex items-center justify-center">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-[#1d2025] border border-[#3b4a47] rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#58f5e0] animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#58f5e0] animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#58f5e0] animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-4 bg-[#191c21] border-t border-[#272a30] flex items-center gap-2">
                <div className="flex-1 bg-[#111319] border border-[#3b4a47] focus-within:border-[#58f5e0] rounded-full px-4 py-2 flex items-center gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSendChat(chatInput);
                    }}
                    placeholder={`Ask Vormi anything about ${selectedSubject.title}...`}
                    className="w-full bg-transparent text-sm text-[#e1e2ea] placeholder-[#bacac6]/60 focus:outline-none"
                  />
                </div>
                <button
                  onClick={() => handleSendChat(chatInput)}
                  disabled={!chatInput.trim()}
                  className="w-10 h-10 rounded-full bg-[#2dd8c4] text-[#005a50] disabled:opacity-50 flex items-center justify-center hover:scale-105 transition-transform cursor-pointer"
                >
                  <Send className="w-4 h-4 fill-current" />
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Smart Roadmap */}
          {activeTab === 'roadmap' && (
            <div className="flex-1 p-6 bg-[#111319] overflow-y-auto">
              <div className="max-w-4xl mx-auto flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-['Manrope'] text-2xl font-bold text-[#e1e2ea]">
                      Interactive Syllabus Tree
                    </h3>
                    <p className="text-sm text-[#bacac6]">
                      Algebra Mastery Progression • 2 of 5 Milestones Mastered
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#4f2db0] text-[#ccbdff] text-xs font-bold">
                    Target: Class 10/11 Board & JEE Prep
                  </span>
                </div>

                {/* Vertical roadmap node tree */}
                <div className="relative pl-6 border-l-2 border-[#3b4a47] flex flex-col gap-6 my-4">
                  {ROADMAP_NODES.map((node, index) => (
                    <div key={node.id} className="relative">
                      {/* Node circle marker */}
                      <div
                        className={`absolute -left-[31px] top-1.5 w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                          node.status === 'completed'
                            ? 'bg-[#2dd8c4] border-[#58f5e0] text-[#005a50]'
                            : node.status === 'current'
                            ? 'bg-[#4f2db0] border-[#ccbdff] text-[#ccbdff] animate-pulse'
                            : 'bg-[#191c21] border-[#3b4a47] text-[#859490]'
                        }`}
                      >
                        {node.status === 'completed' ? (
                          <CheckCircle2 className="w-4 h-4 fill-current" />
                        ) : node.status === 'current' ? (
                          <Zap className="w-3.5 h-3.5 fill-current" />
                        ) : (
                          <Lock className="w-3 h-3" />
                        )}
                      </div>

                      <div
                        className={`p-5 rounded-xl border transition-all ${
                          node.status === 'current'
                            ? 'bg-[#1d2025] border-[#ccbdff] shadow-[0_0_20px_rgba(204,189,255,0.15)]'
                            : node.status === 'completed'
                            ? 'bg-[#191c21] border-[#3b4a47]'
                            : 'bg-[#111319] border-[#272a30] opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-['Manrope'] font-bold text-base text-[#e1e2ea] flex items-center gap-2">
                            <span>Level {node.level}: {node.title}</span>
                            {node.status === 'current' && (
                              <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 bg-[#ccbdff]/20 text-[#ccbdff] rounded-full border border-[#ccbdff]/40">
                                Current Quest
                              </span>
                            )}
                          </h4>
                          <span className="text-xs font-bold text-[#58f5e0]">
                            +{node.xpReward} XP
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-3">
                          {node.topics.map((t, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2.5 py-1 rounded bg-[#111319] border border-[#3b4a47] text-[#bacac6]"
                            >
                              {t}
                            </span>
                          ))}
                        </div>

                        {node.status === 'current' && (
                          <div className="mt-4 pt-3 border-t border-[#3b4a47] flex items-center justify-between">
                            <span className="text-xs text-[#bacac6] flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" />
                              Est. {node.duration}
                            </span>
                            <button
                              onClick={() => {
                                setActiveTab('tutor');
                                handleSendChat("Let's resume the Quadratic Equations quest!");
                              }}
                              className="text-xs uppercase font-bold bg-[#2dd8c4] text-[#005a50] px-4 py-2 rounded-full hover:scale-95 transition-transform flex items-center gap-1 cursor-pointer"
                            >
                              <span>Play Quest</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Instant Doubts (Snap & Solve) */}
          {activeTab === 'doubts' && (
            <div className="flex-1 p-6 bg-[#111319] overflow-y-auto">
              <div className="max-w-4xl mx-auto flex flex-col gap-6">
                <div>
                  <h3 className="font-['Manrope'] text-2xl font-bold text-[#e1e2ea]">
                    Instant Doubt Resolution (24/7)
                  </h3>
                  <p className="text-sm text-[#bacac6]">
                    Snap homework photo, type equation, or select a preset problem for instant derivation.
                  </p>
                </div>

                {/* Input card */}
                <div className="bg-[#1d2025] border border-[#3b4a47] rounded-xl p-5 flex flex-col gap-4">
                  <textarea
                    value={doubtText}
                    onChange={(e) => setDoubtText(e.target.value)}
                    placeholder="Type or paste your math/science doubt here (e.g. Derive roots for 3x² - 7x + 2 = 0)..."
                    className="w-full h-24 bg-[#111319] border border-[#3b4a47] focus:border-[#58f5e0] rounded-xl p-3.5 text-sm text-[#e1e2ea] placeholder-[#bacac6]/50 focus:outline-none resize-none"
                  />

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setDoubtText('Derive quadratic roots for 3x² - 7x + 2 = 0')}
                        className="text-xs px-3 py-1.5 bg-[#191c21] border border-[#3b4a47] text-[#58f5e0] rounded-lg hover:border-[#58f5e0]"
                      >
                        Sample Math Problem
                      </button>
                      <button
                        onClick={() =>
                          setDoubtText('Calculate work done when a 10 kg mass is lifted 5 meters')
                        }
                        className="text-xs px-3 py-1.5 bg-[#191c21] border border-[#3b4a47] text-[#ccbdff] rounded-lg hover:border-[#ccbdff]"
                      >
                        Sample Physics Problem
                      </button>
                    </div>

                    <button
                      onClick={handleSolveDoubt}
                      disabled={isSolvingDoubt}
                      className="text-xs uppercase tracking-wider font-bold bg-[#2dd8c4] text-[#005a50] px-6 py-2.5 rounded-full hover:scale-95 transition-transform flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      {isSolvingDoubt ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-[#005a50] border-t-transparent rounded-full animate-spin" />
                          <span>Solving with AI...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Resolve Step-by-Step</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Solved Output */}
                {solvedDoubtResult && (
                  <div className="bg-[#1d2025] border border-[#58f5e0]/40 rounded-xl p-6 shadow-xl flex flex-col gap-4">
                    <div className="flex items-center justify-between pb-3 border-b border-[#3b4a47]">
                      <h4 className="font-['Manrope'] font-bold text-lg text-[#58f5e0]">
                        Step-by-Step Resolution
                      </h4>
                      <span className="text-xs font-bold text-[#bacac6] bg-[#111319] px-2.5 py-1 rounded-full border border-[#3b4a47]">
                        Verified by Vormirix Engine
                      </span>
                    </div>

                    <div className="font-semibold text-sm text-[#e1e2ea]">
                      {solvedDoubtResult.title}
                    </div>

                    <div className="flex flex-col gap-3 my-2">
                      {solvedDoubtResult.solutionSteps.map((step: string, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 bg-[#111319] p-3 rounded-lg border border-[#3b4a47]/50"
                        >
                          <div className="w-5 h-5 rounded-full bg-[#58f5e0]/20 text-[#58f5e0] text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                            {idx + 1}
                          </div>
                          <p className="text-xs sm:text-sm text-[#e1e2ea] leading-relaxed">
                            {step}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 4: Adaptive Quiz Arena */}
          {activeTab === 'quiz' && (
            <div className="flex-1 p-6 bg-[#111319] overflow-y-auto">
              <div className="max-w-3xl mx-auto flex flex-col gap-6">
                {!quizFinished ? (
                  <>
                    <div className="flex items-center justify-between pb-4 border-b border-[#272a30]">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-[#ffb4ab]">
                          Question {currentQuizIndex + 1} of {SAMPLE_QUIZZES.length}
                        </span>
                        <h3 className="font-['Manrope'] text-xl font-bold text-[#e1e2ea]">
                          {SAMPLE_QUIZZES[currentQuizIndex].subject}
                        </h3>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-[#ffb4ab]/20 text-[#ffb4ab] text-xs font-bold border border-[#ffb4ab]/30">
                        {SAMPLE_QUIZZES[currentQuizIndex].difficulty}
                      </span>
                    </div>

                    {/* Question prompt */}
                    <div className="bg-[#1d2025] border border-[#3b4a47] rounded-xl p-6">
                      <p className="text-base sm:text-lg font-medium text-[#e1e2ea] mb-3">
                        {SAMPLE_QUIZZES[currentQuizIndex].question}
                      </p>

                      {SAMPLE_QUIZZES[currentQuizIndex].formula && (
                        <div className="bg-[#0c0e14] font-mono text-sm p-3 rounded-lg border border-[#3b4a47]/50 text-[#58f5e0] mb-4">
                          <code>{SAMPLE_QUIZZES[currentQuizIndex].formula}</code>
                        </div>
                      )}

                      {/* Options */}
                      <div className="flex flex-col gap-3">
                        {SAMPLE_QUIZZES[currentQuizIndex].options.map((opt, idx) => {
                          const isCorrect = idx === SAMPLE_QUIZZES[currentQuizIndex].correctIndex;
                          const isSelected = selectedOption === idx;

                          let btnClass = 'bg-[#111319] border-[#3b4a47] text-[#e1e2ea] hover:border-[#58f5e0]';
                          if (isAnswerSubmitted) {
                            if (isCorrect) {
                              btnClass = 'bg-[#2dd8c4]/20 border-[#58f5e0] text-[#58f5e0] font-bold';
                            } else if (isSelected) {
                              btnClass = 'bg-[#93000a]/20 border-[#ffb4ab] text-[#ffb4ab]';
                            }
                          }

                          return (
                            <button
                              key={idx}
                              onClick={() => handleQuizAnswer(idx)}
                              disabled={isAnswerSubmitted}
                              className={`w-full text-left p-4 rounded-xl border text-sm transition-all flex items-center justify-between cursor-pointer ${btnClass}`}
                            >
                              <span>{opt}</span>
                              {isAnswerSubmitted && isCorrect && (
                                <CheckCircle2 className="w-5 h-5 text-[#58f5e0]" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Explanation if answered */}
                    {isAnswerSubmitted && (
                      <div className="bg-[#191c21] border border-[#3b4a47] rounded-xl p-4 flex flex-col gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#58f5e0]">
                          Detailed Explanation
                        </span>
                        <p className="text-xs sm:text-sm text-[#bacac6]">
                          {SAMPLE_QUIZZES[currentQuizIndex].explanation}
                        </p>
                        <div className="flex justify-end mt-2">
                          <button
                            onClick={handleNextQuiz}
                            className="text-xs uppercase tracking-wider font-bold bg-[#2dd8c4] text-[#005a50] px-5 py-2.5 rounded-full hover:scale-95 transition-transform flex items-center gap-1 cursor-pointer"
                          >
                            <span>Next Question</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-[#1d2025] border border-[#3b4a47] rounded-2xl p-8 text-center flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-[#2dd8c4]/20 text-[#58f5e0] flex items-center justify-center border border-[#58f5e0]/50 shadow-lg">
                      <Trophy className="w-8 h-8" />
                    </div>
                    <h3 className="font-['Manrope'] text-2xl font-bold text-[#e1e2ea]">
                      Quiz Completed!
                    </h3>
                    <p className="text-base text-[#bacac6]">
                      You scored {quizScore} out of {SAMPLE_QUIZZES.length} questions correctly.
                    </p>
                    <span className="text-sm font-bold text-[#58f5e0] bg-[#58f5e0]/10 px-4 py-1.5 rounded-full border border-[#58f5e0]/30">
                      +{quizScore * 50} Total XP Earned
                    </span>
                    <button
                      onClick={resetQuiz}
                      className="mt-4 text-xs uppercase tracking-wider font-bold bg-[#2dd8c4] text-[#005a50] px-6 py-3 rounded-full hover:scale-95 transition-transform cursor-pointer"
                    >
                      Retake Arena Quiz
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 5: Analytics */}
          {activeTab === 'analytics' && (
            <div className="flex-1 p-6 bg-[#111319] overflow-y-auto">
              <div className="max-w-4xl mx-auto flex flex-col gap-6">
                <div>
                  <h3 className="font-['Manrope'] text-2xl font-bold text-[#e1e2ea]">
                    Learning Velocity & Mastery
                  </h3>
                  <p className="text-sm text-[#bacac6]">
                    Deep insights tracking study hours, problem accuracy, and topic retention.
                  </p>
                </div>

                {/* 3 Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-[#1d2025] p-5 rounded-xl border border-[#3b4a47]">
                    <span className="text-xs uppercase font-bold text-[#bacac6]">Weekly Accuracy</span>
                    <div className="text-3xl font-extrabold text-[#58f5e0] mt-1 font-['Manrope']">92.4%</div>
                    <span className="text-[11px] text-[#2dd8c4] mt-1 inline-block">+6.2% vs last week</span>
                  </div>

                  <div className="bg-[#1d2025] p-5 rounded-xl border border-[#3b4a47]">
                    <span className="text-xs uppercase font-bold text-[#bacac6]">Problems Solved</span>
                    <div className="text-3xl font-extrabold text-[#ccbdff] mt-1 font-['Manrope']">142</div>
                    <span className="text-[11px] text-[#ccbdff] mt-1 inline-block">38 Algebra • 45 Python</span>
                  </div>

                  <div className="bg-[#1d2025] p-5 rounded-xl border border-[#3b4a47]">
                    <span className="text-xs uppercase font-bold text-[#bacac6]">Current Velocity</span>
                    <div className="text-3xl font-extrabold text-[#aac0ff] mt-1 font-['Manrope']">4.2 hrs/wk</div>
                    <span className="text-[11px] text-[#aac0ff] mt-1 inline-block">Top 5% of learners</span>
                  </div>
                </div>

                {/* Subject Mastery Breakdown */}
                <div className="bg-[#1d2025] p-6 rounded-xl border border-[#3b4a47] flex flex-col gap-4">
                  <h4 className="font-['Manrope'] font-bold text-base text-[#e1e2ea]">
                    Subject Mastery Matrix
                  </h4>
                  {SUBJECTS.map((sub) => (
                    <div key={sub.id} className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-xs font-bold text-[#bacac6]">
                        <span>{sub.title} ({sub.subtitle})</span>
                        <span className="text-[#58f5e0]">{sub.progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-[#111319] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#2dd8c4] rounded-full"
                          style={{ width: `${sub.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 6: Gamification Hub */}
          {activeTab === 'gamification' && (
            <div className="flex-1 p-6 bg-[#111319] overflow-y-auto">
              <div className="max-w-4xl mx-auto flex flex-col gap-6">
                {/* Level status header */}
                <div className="bg-[#1d2025] border border-[#3b4a47] rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#4f2db0] text-[#ccbdff] flex items-center justify-center border border-[#ccbdff]/40 text-xl font-extrabold">
                      Lv.{user.level}
                    </div>
                    <div>
                      <h4 className="font-['Manrope'] text-xl font-bold text-[#e1e2ea]">
                        Quantum Scholar
                      </h4>
                      <p className="text-xs text-[#bacac6]">
                        {user.currentXp} / {user.nextLevelXp} XP to Level {user.level + 1}
                      </p>
                    </div>
                  </div>

                  <div className="w-full sm:w-48 flex flex-col gap-1">
                    <div className="w-full h-2.5 bg-[#111319] rounded-full overflow-hidden border border-[#3b4a47]">
                      <div
                        className="h-full bg-[#2dd8c4] rounded-full"
                        style={{ width: `${(user.currentXp / user.nextLevelXp) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-right text-[#58f5e0] font-bold">
                      {user.nextLevelXp - user.currentXp} XP remaining
                    </span>
                  </div>
                </div>

                {/* Badges Gallery */}
                <div>
                  <h4 className="font-['Manrope'] text-lg font-bold text-[#e1e2ea] mb-3">
                    Unlocked Achievements ({BADGES.filter((b) => b.isUnlocked).length}/{BADGES.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {BADGES.map((badge) => (
                      <div
                        key={badge.id}
                        className={`p-4 rounded-xl border flex items-start gap-3.5 transition-all ${
                          badge.isUnlocked
                            ? 'bg-[#1d2025] border-[#3b4a47] hover:border-[#58f5e0]'
                            : 'bg-[#111319] border-[#272a30] opacity-40'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-lg bg-[#58f5e0]/15 flex items-center justify-center flex-shrink-0 text-[#58f5e0]">
                          <Award className="w-5 h-5" />
                        </div>
                        <div>
                          <h5 className="font-bold text-xs uppercase tracking-wider text-[#e1e2ea]">
                            {badge.name}
                          </h5>
                          <p className="text-[12px] text-[#bacac6] mt-0.5">{badge.description}</p>
                          {badge.unlockedAt && (
                            <span className="text-[10px] text-[#58f5e0] font-semibold mt-1 inline-block">
                              Unlocked {badge.unlockedAt}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
