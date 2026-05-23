import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthProvider';
import { db, Entry, Subscription, Goal, OperationType, handleFirestoreError } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, Timestamp, query, orderBy, limit, getDocs, updateDoc, doc, increment, where } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle, HelpCircle, Sparkles, Clock, Calendar, Target, PlusCircle, MessageSquare, ScanText, Trash, HeartHandshake } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { parseTransactionSMS, TransactionSuggestion } from '../lib/smsParser';

const CATEGORIES = {
  income: ['Salary', 'Freelance', 'Gift', 'Investment Returns', 'Other'],
  expense: ['Rent', 'Groceries', 'Dining Out', 'Transport', 'Entertainment', 'Shopping', 'Health', 'Education', 'Other'],
  savings: ['Emergency Fund', 'Travel', 'House', 'Car', 'Other'],
  investment: ['Stocks', 'Mutual Funds', 'Crypto', 'Real Estate', 'Other'],
};

const GROUPS = [
  { id: 'needs', label: 'Needs', description: 'Essential for survival (Rent, Groceries)' },
  { id: 'wants', label: 'Wants', description: 'Optional for enjoyment (Dining, Shopping)' },
  { id: 'growth', label: 'Growth', description: 'Future-focused (Savings, Investment)' },
  { id: 'income', label: 'Income', description: 'Money coming in' },
  { id: 'other', label: 'Other', description: 'Miscellaneous' },
];

export const AddEntry = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [recentTemplates, setRecentTemplates] = useState<Partial<Entry>[]>([]);
  const [activeSubscriptions, setActiveSubscriptions] = useState<Subscription[]>([]);
  const [activeGoals, setActiveGoals] = useState<Goal[]>([]);
  const [selectedGoalId, setSelectedGoalId] = useState<string>('');
  const [smsInput, setSmsInput] = useState('');
  const [smsSuggestion, setSmsSuggestion] = useState<TransactionSuggestion | null>(null);

  // Regret Memory System & Pause Before Purchase States
  const [pastRegrets, setPastRegrets] = useState<string[]>([]);
  const [showPauseReflection, setShowPauseReflection] = useState(false);
  const [reflectionAnswers, setReflectionAnswers] = useState({
    q1: '', // will it matter in 30 days
    q2: '', // emotional or intentional
    q3: '', // delays important goal
    q4: ''  // regret similar
  });

  const [formData, setFormData] = useState<Partial<Entry>>({
    type: 'expense',
    amount: 0,
    category: 'Rent',
    group: 'needs',
    date: new Date().toISOString().split('T')[0],
    note: '',
    isRegret: false,
    isImpulse: false,
    impulseReason: '',
    feeling: 'Planned'
  });

  const handleSmsPaste = (text: string) => {
    setSmsInput(text);
    const suggestion = parseTransactionSMS(text);
    setSmsSuggestion(suggestion);
  };

  const applySmsSuggestion = () => {
    if (smsSuggestion) {
      setFormData(prev => ({
        ...prev,
        type: smsSuggestion.type,
        amount: smsSuggestion.amount,
        category: smsSuggestion.category,
        note: smsSuggestion.note,
        date: new Date().toISOString().split('T')[0]
      }));
      setSmsSuggestion(null);
      setSmsInput('');
    }
  };

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        // Fetch recent unique entries for templates
        const entriesQ = query(collection(db, 'users', user.uid, 'entries'), orderBy('createdAt', 'desc'), limit(50));
        const entriesSnap = await getDocs(entriesQ);
        const uniqueTemplates: Partial<Entry>[] = [];
        const seenKeys = new Set<string>();

        entriesSnap.docs.forEach(doc => {
          const data = doc.data() as Entry;
          const key = `${data.type}-${data.category}-${data.group}`;
          if (!seenKeys.has(key) && uniqueTemplates.length < 5) {
            seenKeys.add(key);
            uniqueTemplates.push({
              type: data.type,
              category: data.category,
              group: data.group,
              amount: data.amount,
              note: data.note
            });
          }
        });
        setRecentTemplates(uniqueTemplates);

        // Fetch subscriptions
        const subsSnap = await getDocs(collection(db, 'users', user.uid, 'subscriptions'));
        setActiveSubscriptions(subsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Subscription)));

        // Fetch goals
        const goalsSnap = await getDocs(collection(db, 'users', user.uid, 'goals'));
        setActiveGoals(goalsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Goal)).filter(g => g.status === 'active'));

        // Fetch past regrets categories
        const regretsQ = query(collection(db, 'users', user.uid, 'entries'), where('isRegret', '==', true));
        const regretsSnap = await getDocs(regretsQ);
        const uniqueRegrets = Array.from(new Set(regretsSnap.docs.map(doc => (doc.data() as Entry).category)));
        setPastRegrets(uniqueRegrets);

      } catch (error) {
        console.error("Error pre-filling data:", error);
      }
    };

    fetchData();
  }, [user]);

  const applyTemplate = (template: Partial<Entry>) => {
    setFormData(prev => ({
      ...prev,
      ...template,
      date: prev.date // Keep current date
    }));
  };

  const applySubscription = (sub: Subscription) => {
    setFormData(prev => ({
      ...prev,
      type: 'expense',
      category: sub.category || 'Other',
      amount: sub.amount,
      note: `Recurring: ${sub.name}`,
      group: 'needs', // Default subscriptions to needs
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.amount || !formData.category) return;

    setLoading(true);
    try {
      const entryData = {
        ...formData,
        amount: Number(formData.amount),
        date: Timestamp.fromDate(new Date(formData.date as string)),
        createdAt: serverTimestamp(),
      };
      
      const docRef = await addDoc(collection(db, 'users', user.uid, 'entries'), entryData);

      // If a goal is selected and it's a growth entry, update the goal
      if (selectedGoalId && (formData.type === 'savings' || formData.type === 'investment')) {
        const goalRef = doc(db, 'users', user.uid, 'goals', selectedGoalId);
        await updateDoc(goalRef, {
          currentAmount: increment(Number(formData.amount))
        });
      }

      navigate('/');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}/entries`);
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = (type: Entry['type']) => {
    let group: Entry['group'] = 'other';
    if (type === 'income') group = 'income';
    if (type === 'expense') group = 'needs';
    if (type === 'savings' || type === 'investment') group = 'growth';

    setFormData({
      ...formData,
      type,
      group,
      category: CATEGORIES[type][0],
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-8"
    >
      <header className="flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="mr-4 p-2 hover:bg-stone-100 rounded-full text-stone-400">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-3xl font-black text-stone-900 tracking-tight">Add Entry</h2>
        </div>
        <div className="p-2 bg-amber-100 text-amber-600 rounded-xl">
          <Sparkles className="w-6 h-6" />
        </div>
      </header>

      {/* SMS Parsing Section */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-stone-900 text-white p-8 rounded-[2.5rem] shadow-2xl space-y-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full -mr-16 -mt-16 blur-2xl" />
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white/10 rounded-2xl">
              <MessageSquare className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">SMS Sync</h3>
              <p className="text-stone-400 text-[10px] font-bold uppercase tracking-widest">Mobile Assistant</p>
            </div>
          </div>
          {profile?.smsParsingEnabled ? (
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-black rounded-full uppercase tracking-widest">Active</span>
          ) : (
            <span className="px-3 py-1 bg-stone-800 text-stone-500 text-[10px] font-black rounded-full uppercase tracking-widest">Disabled</span>
          )}
        </div>

        <div className="space-y-4 relative z-10">
          <p className="text-xs text-stone-400 font-medium italic">Paste a banking SMS or UPI transaction message to auto-fill this entry.</p>
          <div className="relative">
            <textarea
              value={smsInput}
              onChange={(e) => handleSmsPaste(e.target.value)}
              placeholder="Paste SMS here (e.g. Debited by ₹500 at Amazon...)"
              className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-amber-500 text-sm font-medium text-white placeholder:text-stone-600 min-h-[80px] resize-none"
            />
            {smsInput && (
              <button 
                type="button"
                onClick={() => { setSmsInput(''); setSmsSuggestion(null); }}
                className="absolute top-3 right-3 p-2 hover:bg-white/10 rounded-full text-stone-500"
              >
                <Trash className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <AnimatePresence>
            {smsSuggestion && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-amber-500 p-6 rounded-2xl flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <ScanText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-amber-900 uppercase tracking-widest">Suggestion Found</p>
                    <p className="text-sm font-black text-stone-900">{smsSuggestion.type === 'expense' ? 'Expense' : 'Income'}: ${smsSuggestion.amount}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={applySmsSuggestion}
                  className="px-6 py-3 bg-stone-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-transform"
                >
                  Apply
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
        {(recentTemplates.length > 0 || activeSubscriptions.length > 0) && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {recentTemplates.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-[10px] font-black text-stone-400 uppercase tracking-widest pl-2">
                  <Clock className="w-3 h-3" />
                  <span>Recent Templates</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentTemplates.map((t, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => applyTemplate(t)}
                      className="px-4 py-2 bg-white border border-stone-100 rounded-2xl text-[10px] font-bold text-stone-600 hover:border-amber-400 hover:text-amber-600 transition-all shadow-sm"
                    >
                      {t.category} (${t.amount})
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeSubscriptions.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-[10px] font-black text-stone-400 uppercase tracking-widest pl-2">
                  <Calendar className="w-3 h-3" />
                  <span>Log Subscription</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {activeSubscriptions.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => applySubscription(s)}
                      className="px-4 py-2 bg-amber-50 border border-amber-100 rounded-2xl text-[10px] font-bold text-amber-700 hover:bg-amber-100 transition-all shadow-sm flex items-center"
                    >
                      <PlusCircle className="w-3 h-3 mr-1.5" />
                      {s.name} (${s.amount})
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

      <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[2.5rem] border border-stone-200 shadow-sm space-y-10">
        {/* Type Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {['income', 'expense', 'savings', 'investment'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => handleTypeChange(type as Entry['type'])}
              className={cn(
                "py-4 px-4 rounded-2xl text-xs font-black capitalize transition-all tracking-widest",
                formData.type === type 
                  ? "bg-stone-900 text-white shadow-xl scale-105" 
                  : "bg-stone-50 text-stone-500 hover:bg-stone-100"
              )}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Amount */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">Amount</label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300 font-black text-xl">$</span>
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                value={formData.amount || ''}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                className="w-full pl-10 pr-6 py-5 bg-stone-50 border-none rounded-[1.5rem] focus:ring-2 focus:ring-stone-900 font-black text-2xl text-stone-900"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Date */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">Date</label>
            <input
              type="date"
              required
              value={formData.date as string}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-6 py-5 bg-stone-50 border-none rounded-[1.5rem] focus:ring-2 focus:ring-stone-900 font-bold text-stone-900"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Category */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-6 py-5 bg-stone-50 border-none rounded-[1.5rem] focus:ring-2 focus:ring-stone-900 font-bold text-stone-900 appearance-none"
            >
              {CATEGORIES[formData.type as keyof typeof CATEGORIES].map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Group */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] flex items-center">
              Group
              <div className="group relative ml-2">
                <HelpCircle className="w-4 h-4 text-stone-300 cursor-help" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-56 p-4 bg-stone-900 text-white text-[10px] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-2xl">
                  {GROUPS.find(g => g.id === formData.group)?.description}
                </div>
              </div>
            </label>
            <select
              value={formData.group}
              onChange={(e) => setFormData({ ...formData, group: e.target.value as Entry['group'] })}
              className="w-full px-6 py-5 bg-stone-50 border-none rounded-[1.5rem] focus:ring-2 focus:ring-stone-900 font-bold text-stone-900 appearance-none"
            >
              {GROUPS.map((group) => (
                <option key={group.id} value={group.id}>{group.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Goal Linkage (Only for Growth/Savings/Investment) */}
        {(formData.type === 'savings' || formData.type === 'investment') && activeGoals.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 bg-amber-50 rounded-[2rem] border border-amber-100 space-y-4"
          >
            <div className="flex items-center space-x-2 text-amber-800">
              <Target className="w-5 h-5" />
              <h4 className="font-black text-sm uppercase tracking-widest">Link to Goal</h4>
            </div>
            <p className="text-xs text-amber-700 font-medium italic">Allocate this entry towards one of your active goals to track progress automatically.</p>
            <select
              value={selectedGoalId}
              onChange={(e) => setSelectedGoalId(e.target.value)}
              className="w-full px-6 py-4 bg-white border border-amber-200 rounded-2xl focus:ring-2 focus:ring-amber-500 font-bold text-stone-900"
            >
              <option value="">Do not link to a goal</option>
              {activeGoals.map(goal => (
                <option key={goal.id} value={goal.id}>{goal.title} (Target: ${goal.targetAmount})</option>
              ))}
            </select>
          </motion.div>
        )}

        {/* Behavioral Tracking (Only for Expenses) */}
        {formData.type === 'expense' && (
          <div className="space-y-8">
            {formData.category && pastRegrets.some(r => r.toLowerCase() === formData.category?.toLowerCase()) && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-red-50 border border-red-100 rounded-3xl flex items-start space-x-4 text-stone-800 text-xs"
              >
                <AlertCircle className="w-6 h-6 text-red-650 shrink-0 mt-0.5" />
                <div>
                  <p className="font-black uppercase tracking-wider text-[10px] text-red-900">🚨 Smart Regret Memory Trigger</p>
                  <p className="mt-1 leading-relaxed font-semibold text-stone-700">
                    You previously marked a transaction in <strong>"{formData.category}"</strong> as a spending regret. Take a mindful breath. Are we repeating a stressful spending cycle?
                  </p>
                </div>
              </motion.div>
            )}

            <div className="p-8 bg-stone-50 rounded-[2rem] space-y-8 border border-stone-100">
              <h4 className="text-xs font-black text-stone-900 uppercase tracking-widest flex items-center">
                <AlertCircle className="w-5 h-5 mr-3 text-amber-600 animate-pulse" />
                Behavioral Insights & Emotional Spend State
              </h4>
              
              {/* Feelings State checkboxes */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">How were you feeling before this spend?</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { value: 'Planned', label: '🌻 Balanced / Planned' },
                    { value: 'Stress', label: '⚡ Stress escape' },
                    { value: 'Boredom', label: '☁️ Boredom relief' },
                    { value: 'Social', label: '🤝 Peer pressure' },
                    { value: 'Convenience', label: '🚗 Fast convenience' },
                    { value: 'Reward', label: '🎉 Emotional reward' }
                  ].map(feeling => (
                    <button
                      key={feeling.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, feeling: feeling.value }))}
                      className={cn(
                        "py-3.5 px-3 rounded-2xl text-[11px] font-black tracking-wider transition-all border text-left flex items-center justify-between",
                        formData.feeling === feeling.value
                          ? "bg-stone-900 text-white border-stone-900 shadow-lg scale-[1.03]"
                          : "bg-white text-stone-600 border-stone-200/60 hover:bg-stone-50"
                      )}
                    >
                      <span>{feeling.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-8 pt-2">
                <label className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.isImpulse}
                    onChange={(e) => setFormData({ ...formData, isImpulse: e.target.checked })}
                    className="w-6 h-6 rounded-lg border-stone-300 text-stone-900 focus:ring-stone-900"
                  />
                  <span className="ml-4 text-sm font-bold text-stone-600 group-hover:text-stone-900 transition-colors">Impulse Purchase?</span>
                </label>

                <label className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.isRegret}
                    onChange={(e) => setFormData({ ...formData, isRegret: e.target.checked })}
                    className="w-6 h-6 rounded-lg border-stone-300 text-stone-900 focus:ring-stone-900"
                  />
                  <span className="ml-4 text-sm font-bold text-stone-600 group-hover:text-stone-900 transition-colors">Do you regret this already?</span>
                </label>
              </div>

              {formData.isImpulse && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-3"
                >
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">Why did you buy this?</label>
                  <input
                    type="text"
                    value={formData.impulseReason}
                    onChange={(e) => setFormData({ ...formData, impulseReason: e.target.value })}
                    placeholder="e.g., Boredom, Sale, Peer pressure"
                    className="w-full px-6 py-4 bg-white border border-stone-200 rounded-2xl focus:ring-2 focus:ring-stone-900 text-sm font-bold text-stone-900"
                  />
                </motion.div>
              )}

              {/* Pause Before Purchase interactive reflection questions */}
              <div className="pt-6 border-t border-stone-200/60">
                <button
                  type="button"
                  onClick={() => setShowPauseReflection(!showPauseReflection)}
                  className="w-full py-4 px-6 bg-amber-50 hover:bg-amber-100/85 text-amber-950 font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-between transition-colors border border-amber-150"
                >
                  <span className="flex items-center gap-2">
                    <HeartHandshake className="w-4 h-4 text-amber-600" />
                    <span>{showPauseReflection ? 'Close Pause & Reflect Module' : 'Run 3-Point Pause Before Purchase'}</span>
                  </span>
                  <span className="text-[10px] bg-amber-200 text-amber-900 px-3 py-1 rounded-full border border-amber-300/40">{showPauseReflection ? 'Running' : 'Ready'}</span>
                </button>

                <AnimatePresence>
                  {showPauseReflection && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-6 p-6 bg-amber-50/20 rounded-2xl border border-amber-100/50 space-y-6 overflow-hidden"
                    >
                      <p className="text-[11px] text-stone-500 font-bold leading-relaxed italic">
                        By spending 15 seconds to answer these options, you delay automatic dopamine spending loops:
                      </p>

                      <div className="space-y-5">
                        {/* Q1 */}
                        <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-wider text-stone-500">1. Will this purchase matter to you in 30 days?</p>
                          <div className="flex flex-wrap gap-2">
                            {['No, temporary thrill', 'Barely', 'Yes, long-term asset'].map(opt => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => {
                                  setReflectionAnswers(prev => ({ ...prev, q1: opt }));
                                  if (opt.includes('No') || opt.includes('Barely')) {
                                    setFormData(prev => ({ ...prev, group: 'wants', isImpulse: true }));
                                  }
                                }}
                                className={cn(
                                  "px-4 py-2 text-[10px] font-bold rounded-xl border transition-all",
                                  reflectionAnswers.q1 === opt ? "bg-stone-900 text-white border-stone-900" : "bg-white text-stone-600 border-stone-200"
                                )}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Q2 */}
                        <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-wider text-stone-500">2. Is it triggered by an impulse emotion (boredom, social pressure, fear of missing out)?</p>
                          <div className="flex flex-wrap gap-2">
                            {['Yes (Emotional)', 'No (Planned/Logical)'].map(opt => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => {
                                  setReflectionAnswers(prev => ({ ...prev, q2: opt }));
                                  if (opt.includes('Yes')) {
                                    setFormData(prev => ({ ...prev, feeling: 'Stress', isImpulse: true }));
                                  }
                                }}
                                className={cn(
                                  "px-4 py-2 text-[10px] font-bold rounded-xl border transition-all",
                                  reflectionAnswers.q2 === opt ? "bg-stone-900 text-white border-stone-900" : "bg-white text-stone-600 border-stone-200"
                                )}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Q3 */}
                        <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-wider text-stone-500">3. Does this purchase delay any active goals you have loaded?</p>
                          <div className="flex flex-wrap gap-2">
                            {['Yes, delays savings path', 'No impact'].map(opt => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => setReflectionAnswers(prev => ({ ...prev, q3: opt }))}
                                className={cn(
                                  "px-4 py-2 text-[10px] font-bold rounded-xl border transition-all",
                                  reflectionAnswers.q3 === opt ? "bg-stone-900 text-white border-stone-900" : "bg-white text-stone-600 border-stone-200"
                                )}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {reflectionAnswers.q1 && reflectionAnswers.q2 && (
                        <div className="p-5 bg-amber-50 rounded-xl border border-amber-200/50 text-xs font-semibold text-stone-800 leading-relaxed">
                          🛡️ <strong>Shaastra Reflection Guidance:</strong> {
                            reflectionAnswers.q1.includes('No') || reflectionAnswers.q2.includes('Yes') 
                              ? "This is classified as a short-term impulse or emotional loop. The app has flagged this as 'Wants' & 'Impulse Spend'. We strongly suggest waiting 24 hours."
                              : "This spending behaves with strong alignment to family or core necessity. If it is clear, feel free to proceed!"
                          }
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        )}

        {/* Note */}
        <div className="space-y-3">
          <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">Note (Optional)</label>
          <textarea
            value={formData.note}
            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            className="w-full px-6 py-5 bg-stone-50 border-none rounded-[1.5rem] focus:ring-2 focus:ring-stone-900 font-bold text-stone-900 min-h-[120px]"
            placeholder="What was this for?"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-stone-900 text-white py-6 rounded-[1.5rem] font-black text-xl hover:bg-stone-800 transition-all flex items-center justify-center shadow-2xl disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
        >
          {loading ? 'Saving...' : (
            <>
              <Save className="w-6 h-6 mr-4" />
              Save Entry
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
};
