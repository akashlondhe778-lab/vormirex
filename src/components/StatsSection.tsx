import { Activity, Bot, Flame, Sparkles, TrendingUp, Trophy, Users } from 'lucide-react';
import React from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const PLATFORM_XP_CHART = [
  { day: 'Mon', activeLearners: 12400, xpEarned: 380000 },
  { day: 'Tue', activeLearners: 15600, xpEarned: 490000 },
  { day: 'Wed', activeLearners: 18200, xpEarned: 580000 },
  { day: 'Thu', activeLearners: 21400, xpEarned: 690000 },
  { day: 'Fri', activeLearners: 26800, xpEarned: 840000 },
  { day: 'Sat', activeLearners: 34200, xpEarned: 1120000 },
  { day: 'Sun', activeLearners: 39500, xpEarned: 1350000 },
];

export const StatsSection: React.FC = () => {
  return (
    <section className="border-y border-[#3b4a47]/30 bg-[#0c0e14] py-12 select-none">
      <div className="max-w-7xl mx-auto px-6 space-y-10">
        {/* Top 4 KPI Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-y md:divide-y-0 md:divide-x divide-[#3b4a47]/30">
          <div className="flex flex-col items-center text-center px-4 pt-4 md:pt-0">
            <span className="font-['Manrope'] text-3xl md:text-4xl font-extrabold text-[#58f5e0] mb-1.5 tracking-tight">
              50K+
            </span>
            <span className="text-xs uppercase tracking-wider font-bold text-[#bacac6]">
              Active Learners
            </span>
          </div>

          <div className="flex flex-col items-center text-center px-4 pt-4 md:pt-0">
            <span className="font-['Manrope'] text-3xl md:text-4xl font-extrabold text-[#58f5e0] mb-1.5 tracking-tight">
              500+
            </span>
            <span className="text-xs uppercase tracking-wider font-bold text-[#bacac6]">
              Interactive Courses & Reels
            </span>
          </div>

          <div className="flex flex-col items-center text-center px-4 pt-4 md:pt-0">
            <span className="font-['Manrope'] text-3xl md:text-4xl font-extrabold text-[#58f5e0] mb-1.5 tracking-tight">
              98.6%
            </span>
            <span className="text-xs uppercase tracking-wider font-bold text-[#bacac6]">
              Exam Score Boost
            </span>
          </div>

          <div className="flex flex-col items-center text-center px-4 pt-4 md:pt-0">
            <span className="font-['Manrope'] text-3xl md:text-4xl font-extrabold text-[#58f5e0] mb-1.5 tracking-tight">
              24/7
            </span>
            <span className="text-xs uppercase tracking-wider font-bold text-[#bacac6]">
              Real-time AI Doubts
            </span>
          </div>
        </div>

        {/* Real-time Global XP Velocity Chart (Recharts) */}
        <div className="bg-[#111319] border border-[#272a30] rounded-3xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#58f5e0] animate-pulse" />
                <span className="text-xs uppercase font-bold tracking-wider text-[#58f5e0]">
                  Global Learning Arena Velocity
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">
                Weekly Student Study Streaks & XP Distribution
              </h3>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5 text-[#58f5e0]">
                <div className="w-3 h-1 bg-[#58f5e0] rounded-full" />
                <span>Daily XP Earned</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#ccbdff]">
                <div className="w-3 h-1 bg-[#ccbdff] rounded-full" />
                <span>Active Coders & Learners</span>
              </div>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={PLATFORM_XP_CHART}>
                <defs>
                  <linearGradient id="glowXp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#58f5e0" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#58f5e0" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1d2025" vertical={false} />
                <XAxis dataKey="day" stroke="#bacac6" tick={{ fontSize: 11 }} />
                <YAxis
                  stroke="#bacac6"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => `${v / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#191c21',
                    border: '1px solid #3b4a47',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    color: '#e1e2ea',
                  }}
                  formatter={(val: any, name: any) => [
                    name === 'xpEarned' ? `${val.toLocaleString()} XP` : `${val.toLocaleString()} students`,
                    name === 'xpEarned' ? 'Total XP Distributed' : 'Active Students',
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="xpEarned"
                  stroke="#58f5e0"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#glowXp)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
};
