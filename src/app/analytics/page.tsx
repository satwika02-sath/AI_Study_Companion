'use client';

import { PageTransition } from '@/components/page-transition';
import { motion } from 'framer-motion';
import { BarChart2, MessageSquare, BrainCircuit, Layers, UploadCloud, TrendingUp } from 'lucide-react';
import { useAnalytics } from '@/context/analytics-context';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

function StatCard({
  title, value, icon: Icon, color, bg, delay
}: {
  title: string; value: number; icon: React.ElementType; color: string; bg: string; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -4, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
      className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_16px_40px_rgb(0,0,0,0.10)] transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bg}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
      <p className="text-3xl font-black text-slate-900 mb-1">{value.toLocaleString()}</p>
      <p className="text-sm font-semibold text-slate-500">{title}</p>
    </motion.div>
  );
}

export default function AnalyticsPage() {
  const { totalQuestions, totalQuizzes, totalFlashcards, totalUploads, weeklyData } = useAnalytics();

  const stats = [
    { title: 'Notes Uploaded', value: totalUploads, icon: UploadCloud, color: 'text-blue-600', bg: 'bg-blue-100', delay: 0 },
    { title: 'AI Questions Asked', value: totalQuestions, icon: MessageSquare, color: 'text-purple-600', bg: 'bg-purple-100', delay: 0.1 },
    { title: 'Quizzes Generated', value: totalQuizzes, icon: BrainCircuit, color: 'text-green-600', bg: 'bg-green-100', delay: 0.2 },
    { title: 'Flashcard Sets', value: totalFlashcards, icon: Layers, color: 'text-orange-600', bg: 'bg-orange-100', delay: 0.3 },
  ];

  return (
    <PageTransition className="p-6 md:p-12 max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex flex-col gap-2 pt-4">
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold tracking-tight text-slate-900 flex items-center gap-3"
        >
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center">
            <BarChart2 className="w-6 h-6 text-indigo-600" />
          </div>
          Analytics
        </motion.h2>
        <p className="text-lg text-slate-600 font-medium">Your platform usage at a glance.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {stats.map((s) => <StatCard key={s.title} {...s} />)}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Daily AI Usage */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-purple-500" />
            <h3 className="font-bold text-slate-800 text-base">Daily AI Usage (7 days)</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={weeklyData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: 12 }}
                cursor={{ stroke: '#e2e8f0' }}
              />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="questions" name="Questions" stroke="#8b5cf6" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="quizzes" name="Quizzes" stroke="#10b981" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Quizzes & Flashcards Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <BarChart2 className="w-5 h-5 text-green-500" />
            <h3 className="font-bold text-slate-800 text-base">Quizzes & Flashcards (7 days)</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: 12 }}
                cursor={{ fill: '#f8fafc' }}
              />
              <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="quizzes" name="Quizzes" fill="#10b981" radius={[6, 6, 0, 0]} />
              <Bar dataKey="flashcards" name="Flashcards" fill="#f59e0b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </PageTransition>
  );
}
