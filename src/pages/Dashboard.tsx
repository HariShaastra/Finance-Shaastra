import React, { useEffect, useState } from 'react';
import { useAuth } from '../lib/AuthProvider';
import { db, Entry, OperationType, handleFirestoreError } from '../lib/firebase';
import { collection, query, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { ArrowUpCircle, ArrowDownCircle, Wallet, Percent, TrendingUp, AlertCircle, Sparkles, BookOpen, Target, PlusCircle, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { checkIrregularUsage } from '../lib/notificationService';

const COLORS = ['#d97706', '#059669', '#2563eb', '#7c3aed', '#db2777'];

export const Dashboard = () => {
  const { user, profile } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    if (profile) {
      checkIrregularUsage(user.uid, profile);
    }

    const q = query(
      collection(db, 'users', user.uid, 'entries'),
      orderBy('date', 'desc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const entriesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Entry));
      setEntries(entriesData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/entries`);
    });

    return unsubscribe;
  }, [user]);

  const currentMonth = new Date();
  const start = startOfMonth(currentMonth);
  const end = endOfMonth(currentMonth);

  const monthEntries = entries.filter(e => {
    const d = e.date?.toDate ? e.date.toDate() : new Date(e.date);
    return d >= start && d <= end;
  });

  const income = monthEntries.filter(e => e.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const expenses = monthEntries.filter(e => e.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const savings = monthEntries.filter(e => e.type === 'savings' || e.type === 'investment').reduce((acc, curr) => acc + curr.amount, 0);
  
  const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;

  // Scorecard Logic
  const loggingConsistency = entries.length > 0 ? Math.min(100, (entries.length / 30) * 100) : 0;
  const savingsConsistency = savingsRate > 20 ? 100 : (savingsRate / 20) * 100;
  const expenseControl = income > 0 
    ? (expenses < income * 0.7 ? 100 : Math.max(0, 100 - ((expenses / income) - 0.7) * 200))
    : 0;
  
  const overallScore = (loggingConsistency + savingsConsistency + expenseControl) / 3;

  const categoryData = monthEntries
    .filter(e => e.type === 'expense')
    .reduce((acc: any[], curr) => {
      const existing = acc.find(a => a.name === curr.category);
      if (existing) {
        existing.value += curr.amount;
      } else {
        acc.push({ name: curr.category, value: curr.amount });
      }
      return acc;
    }, []);

  const groupData = [
    { name: 'Needs', value: monthEntries.filter(e => e.group === 'needs').reduce((acc, curr) => acc + curr.amount, 0) },
    { name: 'Wants', value: monthEntries.filter(e => e.group === 'wants').reduce((acc, curr) => acc + curr.amount, 0) },
    { name: 'Growth', value: monthEntries.filter(e => e.group === 'growth').reduce((acc, curr) => acc + curr.amount, 0) },
  ].filter(g => g.value > 0);

  if (loading) return <div className="flex items-center justify-center h-64 text-stone-400 font-bold uppercase tracking-widest text-xs">Gathering your Shaastra...</div>;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-12"
    >
      <motion.header variants={item} className="flex items-end justify-between">
        <div>
          <div className="flex items-center space-x-2 text-amber-600 mb-2">
            <Sparkles className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Financial Awareness</span>
          </div>
          <h2 className="text-4xl font-black text-stone-900 tracking-tight">Welcome, {profile?.displayName?.split(' ')[0]}</h2>
          <p className="text-stone-600 mt-2 text-sm font-bold leading-relaxed max-w-xl">
            Finance Shaastra is a direct, rule-based mindfulness system that maps financial behavior indices.<br />
            It replaces algorithmic predictions with self-reporting, reflection audits, and active goal alignment.
          </p>
          <p className="text-stone-450 mt-2 font-medium text-xs italic underline decoration-amber-500/30">Your financial story for {format(currentMonth, 'MMMM yyyy')}</p>
        </div>
      </motion.header>

      {/* Recovery / App Focus Mode Notifications */}
      {profile?.recoveryMode && profile.recoveryMode !== 'standard' && (
        <motion.div
          variants={item}
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cn(
            "p-8 rounded-[2rem] border relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6",
            profile.recoveryMode === 'debt' ? "bg-amber-50 border-amber-200 text-amber-950" :
            profile.recoveryMode === 'emergency' ? "bg-red-50 border-red-200 text-red-950" :
            profile.recoveryMode === 'student' ? "bg-blue-50 border-blue-200 text-blue-900" :
            profile.recoveryMode === 'rebuilding' ? "bg-emerald-50 border-emerald-200 text-emerald-950" :
            "bg-amber-50 border-amber-250 text-amber-950" // family
          )}
        >
          <div className="space-y-2 max-w-3xl">
            <h3 className="text-sm font-black uppercase tracking-widest flex items-center">
              <span className="mr-2">🛡️</span>
              App Focus Active: {
                profile.recoveryMode === 'debt' ? 'Debt Recovery Mode' :
                profile.recoveryMode === 'emergency' ? 'Emergency Preservation Mode' :
                profile.recoveryMode === 'student' ? 'Student Discipline Mode' :
                profile.recoveryMode === 'rebuilding' ? 'Rebuilding Phase Mode' :
                'Family Care & Responsibility Mode'
              }
            </h3>
            <p className="text-xs font-semibold leading-relaxed opacity-95">
              {profile.recoveryMode === 'debt' && "Take a deep breath. Your path is focused on structural balance and paying off core liabilities. Celebrate every payment you make—all steps are historical victories."}
              {profile.recoveryMode === 'emergency' && "EMERGENCY PRESERVATION STATUS ACTIVE. Focus strictly on essential 'Needs'. All secondary subscriptions and discretionary impulse wants are flagged for removal. Conserve liquid capital."}
              {profile.recoveryMode === 'student' && "We emphasize logging consistency, learning routines and building good habits rather than raw high savings rates. Keep your streak alive today."}
              {profile.recoveryMode === 'rebuilding' && "Welcome back after disruption. Your score celebrates micro-wins and the resumption of routine tracking. Focus is on incremental streak recovery."}
              {profile.recoveryMode === 'family' && `Indian Joint-Family Budgets Active. Shared family allocation goal: $${profile.familyBudgetGoal || 0}. Dependents & Parents supported: ${profile.familyMembersCount || 1}. Priority is placed on medication, parenting bills, and shared security.`}
            </p>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest px-4 py-2 bg-stone-900 text-white rounded-full shrink-0 border border-stone-800">
            {profile.recoveryMode}
          </span>
        </motion.div>
      )}

      {/* Stats Grid */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Income" value={income} icon={ArrowUpCircle} color="text-amber-600" bgColor="bg-amber-50" />
        <StatCard title="Total Expenses" value={expenses} icon={ArrowDownCircle} color="text-rose-600" bgColor="bg-rose-50" />
        <StatCard title="Total Savings" value={savings} icon={Wallet} color="text-emerald-600" bgColor="bg-emerald-50" />
        <StatCard title="Savings Rate" value={`${savingsRate.toFixed(1)}%`} icon={Percent} color="text-blue-600" bgColor="bg-blue-50" />
      </motion.div>

      {/* Scorecard Section */}
      <motion.div 
        variants={item}
        whileHover={{ scale: 1.01 }}
        className="bg-stone-900 text-white p-10 rounded-[3rem] shadow-2xl overflow-hidden relative group transition-all"
      >
        <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:opacity-20 transition-opacity">
          <TrendingUp className="w-64 h-64" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-3xl font-black tracking-tight">Behavioral Scorecard</h3>
              <p className="text-stone-400 text-sm font-medium">A measure of your financial discipline</p>
            </div>
            <div className="text-right">
              <p className="text-6xl font-black text-amber-400">{Math.round(overallScore)}</p>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-500 mt-1">Overall Score</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <ScoreItem label="Discipline" score={loggingConsistency} description="Logging consistency" />
            <ScoreItem label="Consistency" score={savingsConsistency} description="Savings behavior" />
            <ScoreItem label="Awareness" score={expenseControl} description="Expense control" />
          </div>
        </div>
      </motion.div>

      {/* Action Center - Integration Hub */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ActionCard 
          title="Daily Reflection" 
          description="Build awareness of your spending emotions."
          icon={BookOpen}
          link="/reflections"
          buttonText="Reflect Now"
          color="bg-amber-100 text-amber-900"
        />
        <ActionCard 
          title="Track Progress" 
          description="See how close you are to your growth goals."
          icon={Target}
          link="/goals"
          buttonText="View Goals"
          color="bg-stone-900 text-white"
        />
        <ActionCard 
          title="Quick Log" 
          description="Record a new transaction in seconds."
          icon={PlusCircle}
          link="/add"
          buttonText="Add Entry"
          color="bg-amber-500 text-white"
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Breakdown */}
        <motion.div variants={item} className="bg-white p-10 rounded-[2.5rem] border border-stone-200 shadow-sm">
          <h3 className="text-xl font-black text-stone-900 mb-8">Spending Breakdown</h3>
          <div className="h-72">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-stone-300">
                <AlertCircle className="w-16 h-16 mb-4 opacity-20" />
                <p className="font-bold uppercase tracking-widest text-xs">No data this month</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Group Breakdown */}
        <motion.div variants={item} className="bg-white p-10 rounded-[2.5rem] border border-stone-200 shadow-sm">
          <h3 className="text-xl font-black text-stone-900 mb-8">Allocation Strategy</h3>
          <div className="h-72">
            {groupData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={groupData}>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#78716c', fontWeight: 'bold', fontSize: 12 }} 
                  />
                  <YAxis hide />
                  <Tooltip 
                    cursor={{ fill: '#f5f5f4' }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" fill="#1c1917" radius={[12, 12, 12, 12]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-stone-300">
                <AlertCircle className="w-16 h-16 mb-4 opacity-20" />
                <p className="font-bold uppercase tracking-widest text-xs">No data available</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div variants={item} className="bg-white rounded-[2.5rem] border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-10 border-b border-stone-100 flex items-center justify-between">
          <h3 className="text-xl font-black text-stone-900">Recent Activity</h3>
          <button className="text-xs font-black text-stone-400 uppercase tracking-widest hover:text-stone-900 transition-colors">View History</button>
        </div>
        <div className="divide-y divide-stone-50">
          {entries.slice(0, 5).map((entry) => (
            <div key={entry.id} className="p-8 flex items-center justify-between hover:bg-stone-50 transition-all group">
              <div className="flex items-center">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center mr-5 transition-transform group-hover:scale-110",
                  entry.type === 'income' ? "bg-emerald-50 text-emerald-600" : 
                  entry.type === 'expense' ? "bg-rose-50 text-rose-600" : "bg-blue-50 text-blue-600"
                )}>
                  {entry.type === 'income' ? <ArrowUpCircle className="w-6 h-6" /> : 
                   entry.type === 'expense' ? <ArrowDownCircle className="w-6 h-6" /> : <Wallet className="w-6 h-6" />}
                </div>
                <div>
                  <p className="text-base font-black text-stone-900">{entry.category}</p>
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{format(entry.date?.toDate ? entry.date.toDate() : new Date(entry.date), 'MMM dd, yyyy')}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={cn(
                  "text-lg font-black",
                  entry.type === 'income' ? "text-emerald-600" : "text-stone-900"
                )}>
                  {entry.type === 'income' ? '+' : '-'}${entry.amount.toLocaleString()}
                </p>
                <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">{entry.group}</p>
              </div>
            </div>
          ))}
          {entries.length === 0 && (
            <div className="p-20 text-center text-stone-400">
              <p className="font-bold uppercase tracking-widest text-xs">Your financial journey starts here.</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

const StatCard = ({ title, value, icon: Icon, color, bgColor }: any) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-stone-200 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-6">
      <div className={cn("p-3 rounded-2xl", bgColor, color)}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
    <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">{title}</p>
    <p className="text-3xl font-black text-stone-900 mt-1">
      {typeof value === 'number' ? `$${value.toLocaleString()}` : value}
    </p>
  </div>
);

const ActionCard = ({ title, description, icon: Icon, link, buttonText, color }: any) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-stone-200 shadow-sm flex flex-col justify-between group hover:shadow-md transition-all">
    <div className="space-y-4">
      <div className={cn("inline-flex p-3 rounded-2xl", color.includes('bg-stone-900') ? "bg-stone-100 text-stone-900" : color)}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h4 className="text-lg font-black text-stone-900">{title}</h4>
        <p className="text-stone-500 text-sm font-medium mt-1 leading-relaxed">{description}</p>
      </div>
    </div>
    <Link 
      to={link}
      className={cn(
        "mt-8 flex items-center justify-between px-6 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all",
        color
      )}
    >
      {buttonText}
      <ArrowRight className="w-4 h-4" />
    </Link>
  </div>
);

const ScoreItem = ({ label, score, description }: any) => (
  <div className="space-y-4">
    <div className="flex justify-between items-end">
      <div>
        <p className="text-[10px] font-black text-stone-500 uppercase tracking-[0.2em]">{label}</p>
        <p className="text-xs text-stone-400 font-medium">{description}</p>
      </div>
      <p className="text-2xl font-black text-white">{Math.round(score)}</p>
    </div>
    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className={cn(
          "h-full",
          score > 70 ? "bg-emerald-400" : score > 40 ? "bg-amber-400" : "bg-rose-400"
        )}
      />
    </div>
  </div>
);
