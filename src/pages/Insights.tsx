import React, { useEffect, useState } from 'react';
import { useAuth } from '../lib/AuthProvider';
import { db, Entry, OperationType, handleFirestoreError } from '../lib/firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { TrendingUp, AlertCircle, BookOpen, Target, Percent, Wallet, Info, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

const CONCEPTS = [
  {
    id: 'savings-rate',
    title: 'Savings Rate',
    explanation: 'The percentage of your income that you save. A higher savings rate accelerates your path to financial freedom.',
    formula: '(Income - Expenses) / Income * 100',
  },
  {
    id: 'burn-rate',
    title: 'Burn Rate',
    explanation: 'The rate at which you spend money. Knowing your daily or monthly burn rate helps you plan your emergency fund.',
    formula: 'Total Expenses / Number of Days',
  },
  {
    id: 'lifestyle-inflation',
    title: 'Lifestyle Inflation',
    explanation: 'When your spending increases as your income increases. Avoiding this allows you to build wealth faster.',
    formula: 'Compare monthly expenses over time as income grows.',
  },
  {
    id: 'opportunity-cost',
    title: 'Opportunity Cost',
    explanation: 'The potential benefit you miss out on when choosing one alternative over another. Every dollar spent on a "want" is a dollar not invested.',
    formula: 'Amount Spent * (1 + Expected Return)^Time',
  },
];

export const Insights = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'users', user.uid, 'entries'),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Entry));
      setEntries(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/entries`);
    });

    return unsubscribe;
  }, [user]);

  const currentMonth = new Date();
  const lastMonth = subMonths(currentMonth, 1);

  const getMonthData = (date: Date) => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    const monthEntries = entries.filter(e => {
      const d = e.date?.toDate ? e.date.toDate() : new Date(e.date);
      return d >= start && d <= end;
    });

    const income = monthEntries.filter(e => e.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
    const expenses = monthEntries.filter(e => e.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
    const savings = monthEntries.filter(e => e.type === 'savings' || e.type === 'investment').reduce((acc, curr) => acc + curr.amount, 0);
    
    return { income, expenses, savings, entries: monthEntries };
  };

  const current = getMonthData(currentMonth);
  const previous = getMonthData(lastMonth);

  const savingsRate = current.income > 0 ? ((current.income - current.expenses) / current.income) * 100 : 0;
  const burnRate = current.expenses / (currentMonth.getDate());

  const highestCategory = current.entries
    .filter(e => e.type === 'expense')
    .reduce((acc: any, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {});

  const topCategory = Object.entries(highestCategory).sort((a: any, b: any) => b[1] - a[1])[0];

  const impulseCount = current.entries.filter(e => e.isImpulse).length;
  const regretCount = current.entries.filter(e => e.isRegret).length;

  if (loading) return <div className="flex items-center justify-center h-64 text-stone-400 font-bold uppercase tracking-widest text-xs">Analyzing your behavior...</div>;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12 pb-20"
    >
      <header className="flex items-end justify-between">
        <div>
          <div className="flex items-center space-x-2 text-amber-600 mb-2">
            <Sparkles className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Behavioral Analysis</span>
          </div>
          <h2 className="text-4xl font-black text-stone-900 tracking-tight">Insights</h2>
          <p className="text-stone-500 mt-1 font-medium">Rule-based analysis of your financial habits.</p>
        </div>
      </header>

      {/* Behavioral Scorecards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <InsightCard 
          title="Financial Mindfulness" 
          value={entries.length > 0 ? `${Math.round((entries.filter(e => {
            const d = e.date?.toDate ? e.date.toDate() : new Date(e.date);
            return d > subMonths(new Date(), 1);
          }).length / 30) * 100)}%` : '0%'}
          description="Your logging frequency over the last 30 days. High consistency reduces the need for notifications."
          icon={BookOpen}
          color="text-stone-900"
          bgColor="bg-stone-100"
        />
        <InsightCard 
          title="Spending Discipline" 
          value={impulseCount === 0 ? 'Perfect' : `${impulseCount} Impulse Purchases`}
          description={impulseCount > 0 ? "You're making unplanned decisions. Reflect on the 'why'." : "Great job staying intentional!"}
          icon={Target}
          color={impulseCount > 0 ? "text-amber-600" : "text-emerald-600"}
          bgColor={impulseCount > 0 ? "bg-amber-50" : "bg-emerald-50"}
        />
        <InsightCard 
          title="Emotional Value" 
          value={regretCount === 0 ? 'High' : `${regretCount} Regrets`}
          description={regretCount > 0 ? "Some expenses didn't bring value. Learn from these." : "Every dollar spent brought you value."}
          icon={TrendingUp}
          color={regretCount > 0 ? "text-rose-600" : "text-emerald-600"}
          bgColor={regretCount > 0 ? "bg-rose-50" : "bg-emerald-50"}
        />
        <InsightCard 
          title="Savings Consistency" 
          value={`${savingsRate.toFixed(1)}%`}
          description={savingsRate > 20 ? "You're building wealth effectively." : "Try to increase your savings rate to 20%."}
          icon={Percent}
          color={savingsRate > 20 ? "text-emerald-600" : "text-blue-600"}
          bgColor={savingsRate > 20 ? "bg-emerald-50" : "bg-blue-50"}
        />
      </div>

      {/* Key Findings */}
      <div className="bg-white p-10 rounded-[2.5rem] border border-stone-200 shadow-sm space-y-10">
        <h3 className="text-xl font-black text-stone-900 flex items-center">
          <AlertCircle className="w-6 h-6 mr-3 text-amber-600" />
          Key Findings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div className="p-8 bg-stone-50 rounded-[2rem]">
              <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">Highest Spending Category</p>
              <p className="text-2xl font-black text-stone-900 mt-2">
                {topCategory ? `${topCategory[0]} ($${(topCategory[1] as number).toFixed(2)})` : 'N/A'}
              </p>
              <p className="text-sm text-stone-500 mt-3 font-medium">This is where most of your money is going this month.</p>
            </div>
            <div className="p-8 bg-stone-50 rounded-[2rem]">
              <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">Daily Burn Rate</p>
              <p className="text-2xl font-black text-stone-900 mt-2">${burnRate.toFixed(2)} / day</p>
              <p className="text-sm text-stone-500 mt-3 font-medium">On average, you spend this much every single day.</p>
            </div>
          </div>
          <div className="space-y-6">
            <div className="p-8 bg-stone-50 rounded-[2rem]">
              <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">Monthly Comparison</p>
              <p className="text-2xl font-black text-stone-900 mt-2">
                {current.expenses > previous.expenses ? 'Spending is UP' : 'Spending is DOWN'}
              </p>
              <p className="text-sm text-stone-500 mt-3 font-medium">
                Compared to last month, your expenses have {current.expenses > previous.expenses ? 'increased' : 'decreased'} by 
                ${Math.abs(current.expenses - previous.expenses).toFixed(2)}.
              </p>
            </div>
            <div className="p-8 bg-stone-50 rounded-[2rem]">
              <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">Opportunity Cost</p>
              <p className="text-2xl font-black text-stone-900 mt-2">
                ${(current.expenses * 0.07 / 12).toFixed(2)} / month
              </p>
              <p className="text-sm text-stone-500 mt-3 font-medium">If your monthly expenses were invested at 7% return, this is what you'd earn in interest alone.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Concept Learning */}
      <div className="space-y-10">
        <h3 className="text-xl font-black text-stone-900 flex items-center">
          <BookOpen className="w-6 h-6 mr-3 text-amber-600" />
          Learn from your data
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {CONCEPTS.map((concept) => (
            <div key={concept.id} className="bg-white p-10 rounded-[2.5rem] border border-stone-200 shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-xl font-black text-stone-900">{concept.title}</h4>
                <div className="p-2 bg-stone-50 rounded-xl group-hover:bg-amber-100 transition-colors">
                  <Info className="w-5 h-5 text-stone-400 group-hover:text-amber-600" />
                </div>
              </div>
              <p className="text-sm text-stone-500 leading-relaxed mb-8 font-medium">{concept.explanation}</p>
              <div className="p-6 bg-stone-50 rounded-[1.5rem] border border-stone-100">
                <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-3">Your Real Data Example</p>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-black text-stone-900">
                    {concept.id === 'savings-rate' && `Your rate: ${savingsRate.toFixed(1)}%`}
                    {concept.id === 'burn-rate' && `Your burn: $${burnRate.toFixed(2)}/day`}
                    {concept.id === 'lifestyle-inflation' && `Monthly trend: ${current.expenses > previous.expenses ? 'Increasing' : 'Stable'}`}
                    {concept.id === 'opportunity-cost' && `Potential: $${(current.expenses * 0.07).toFixed(2)}/year`}
                  </p>
                  <p className="text-[10px] font-mono text-stone-400 font-bold">{concept.formula}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const InsightCard = ({ title, value, description, icon: Icon, color, bgColor }: any) => (
  <div className="bg-white p-10 rounded-[2.5rem] border border-stone-200 shadow-sm hover:shadow-md transition-shadow">
    <div className={cn("inline-flex p-4 rounded-2xl mb-8", bgColor, color)}>
      <Icon className="w-8 h-8" />
    </div>
    <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-2">{title}</h4>
    <p className="text-3xl font-black text-stone-900 mb-3">{value}</p>
    <p className="text-sm text-stone-500 leading-relaxed font-medium">{description}</p>
  </div>
);
