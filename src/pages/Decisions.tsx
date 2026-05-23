import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthProvider';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, updateDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { BookOpen, HelpCircle, Save, Plus, Clock, CheckCircle2, ChevronRight, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export interface Decision {
  id?: string;
  title: string;
  description: string;
  amount: number;
  category: 'loan' | 'career' | 'purchase' | 'investment' | 'business' | 'other';
  reasoning: string;
  expectedOutcome: string;
  actualOutcome?: string;
  isReviewed?: boolean;
  feelingBefore: string;
  feelingAfter?: string;
  date: string;
}

export const Decisions = () => {
  const { user } = useAuth();
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [reviewingDecision, setReviewingDecision] = useState<Decision | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [category, setCategory] = useState<Decision['category']>('purchase');
  const [reasoning, setReasoning] = useState('');
  const [expectedOutcome, setExpectedOutcome] = useState('');
  const [feelingBefore, setFeelingBefore] = useState('Planned');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Review states
  const [reviewOutcome, setReviewOutcome] = useState('');
  const [feelingAfter, setFeelingAfter] = useState('Satisfied');

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'users', user.uid, 'decisions'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Decision));
      setDecisions(docs);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/decisions`);
    });

    return unsubscribe;
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title) return;

    try {
      const decisionData = {
        title,
        description,
        amount: Number(amount) || 0,
        category,
        reasoning,
        expectedOutcome,
        isReviewed: false,
        feelingBefore,
        date,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'users', user.uid, 'decisions'), decisionData);
      
      // Reset
      setTitle('');
      setDescription('');
      setAmount(0);
      setCategory('purchase');
      setReasoning('');
      setExpectedOutcome('');
      setFeelingBefore('Planned');
      setShowAddForm(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}/decisions`);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !reviewingDecision || !reviewingDecision.id) return;

    try {
      const decisionRef = doc(db, 'users', user.uid, 'decisions', reviewingDecision.id);
      await updateDoc(decisionRef, {
        actualOutcome: reviewOutcome,
        feelingAfter,
        isReviewed: true,
        reviewedAt: serverTimestamp(),
      });

      setReviewOutcome('');
      setReviewingDecision(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}/decisions`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    if (!confirm("Are you sure you want to delete this decision log?")) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'decisions', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${user.uid}/decisions`);
    }
  };

  if (loading) return <div className="flex items-center justify-center p-20 text-stone-400 font-bold tracking-widest text-xs uppercase select-none">Retrieving decision scrolls...</div>;

  const openDecisions = decisions.filter(d => !d.isReviewed);
  const reviewedDecisions = decisions.filter(d => d.isReviewed);

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-24">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center space-x-6">
          <div className="p-4 bg-stone-930 text-amber-500 rounded-3xl shadow-xl flex items-center justify-center">
            <BookOpen className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-stone-900 tracking-tight">Financial Decision Journal</h1>
            <p className="text-stone-500 font-medium italic mt-1">Record the logic and expectations behind major spending & risks.</p>
          </div>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center space-x-3 px-8 py-4 bg-stone-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all select-none"
        >
          {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4 text-amber-400" />}
          <span>{showAddForm ? 'Close Canvas' : 'New Decision'}</span>
        </button>
      </header>

      {/* Decision Prompt Intro */}
      <div className="bg-amber-50 rounded-3xl p-8 border border-amber-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <h3 className="text-lg font-black text-amber-950">Why keep a decision journal?</h3>
          <p className="text-stone-600 font-medium text-sm leading-relaxed">
            Hindsight bias leads us to believe we always knew how a decision would turn out. Logging why you did something and how you felt prevents repeating previous financial regrets and builds true human judgment.
          </p>
        </div>
        <div className="flex items-center space-x-3 text-amber-900 font-black text-[10px] uppercase tracking-widest bg-amber-200/50 px-4 py-2 rounded-full select-none shrink-0 border border-amber-200">
          <HelpCircle className="w-4 h-4" />
          <span>100% Behavioral Reflection</span>
        </div>
      </div>

      {/* Form Overlay Modal/Card */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-white p-10 rounded-[3rem] border border-stone-200 shadow-xl space-y-8 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full -mr-16 -mt-16 blur-2xl" />
            <h3 className="text-2xl font-black tracking-tight text-stone-900">What major choice are you facing?</h3>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-stone-400 uppercase tracking-widest">Decision Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Taking out an Education Loan, Buying Land, Starting Agency"
                    className="w-full px-6 py-4 bg-stone-50 border border-stone-200 rounded-3xl font-bold text-stone-900 placeholder:text-stone-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-stone-400 uppercase tracking-widest">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-6 py-4 bg-stone-50 border border-stone-200 rounded-3xl font-bold text-stone-900 focus:ring-2 focus:ring-amber-500 text-sm"
                  >
                    <option value="purchase">Large Purchases</option>
                    <option value="loan">Loans & Debt Obligations</option>
                    <option value="career">Career Shifts & Income Leaps</option>
                    <option value="investment">Investments & Portfolios</option>
                    <option value="business">Business Risks</option>
                    <option value="other">Other Life Decisions</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-stone-400 uppercase tracking-widest">Amount Engaged ($)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-6 py-4 bg-stone-50 border border-stone-200 rounded-3xl font-bold text-stone-900 text-sm focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-stone-400 uppercase tracking-widest">Money Mood Before</label>
                  <select
                    value={feelingBefore}
                    onChange={(e) => setFeelingBefore(e.target.value)}
                    className="w-full px-6 py-4 bg-stone-50 border border-stone-200 rounded-3xl font-bold text-stone-900 text-sm focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Anxious">Anxious / Stressed</option>
                    <option value="Restless">Restless Spend Appetite</option>
                    <option value="Planned">Planned & Peaceful</option>
                    <option value="Excited">Optimistic / Excited</option>
                    <option value="Social Pressure">Socially Coerced</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-stone-400 uppercase tracking-widest">Decision Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-6 py-4 bg-stone-50 border border-stone-200 rounded-3xl font-bold text-stone-900 text-sm focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-stone-400 uppercase tracking-widest">Primary Logic & Reasoning</label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain exactly why you are taking this risk. What are the key variables?"
                  className="w-full px-6 py-4 bg-stone-50 border border-stone-200 rounded-3xl font-medium text-stone-700 text-sm focus:ring-2 focus:ring-amber-500 min-h-[100px] resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-stone-400 uppercase tracking-widest">What outcome do you specifically expect?</label>
                <textarea
                  required
                  value={expectedOutcome}
                  onChange={(e) => setExpectedOutcome(e.target.value)}
                  placeholder="e.g. 'I expect this to increase my income in 6 months.' or 'It will save me 2 hours daily.'"
                  className="w-full px-6 py-4 bg-stone-50 border border-stone-200 rounded-3xl font-medium text-stone-700 text-sm focus:ring-2 focus:ring-amber-500 min-h-[100px] resize-none"
                />
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-8 py-4 bg-stone-100 text-stone-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-stone-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-10 py-4 bg-stone-900 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg flex items-center space-x-2"
                >
                  <Save className="w-4 h-4 text-amber-400" />
                  <span>Log Decision Space</span>
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Audit Modal overlay for Reviewing */}
      <AnimatePresence>
        {reviewingDecision && (
          <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-2xl w-full bg-white p-10 rounded-[3.5rem] border border-stone-200 shadow-2xl space-y-8 relative"
            >
              <button 
                onClick={() => setReviewingDecision(null)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-stone-100 text-stone-400"
              >
                <X className="w-5 h-5" />
              </button>

              <div>
                <span className="px-3 py-1 bg-amber-100 text-amber-900 text-[10px] font-black uppercase tracking-widest rounded-full">{reviewingDecision.category}</span>
                <h3 className="text-2xl font-black text-stone-900 tracking-tight mt-3">Revisiting: {reviewingDecision.title}</h3>
                <p className="text-stone-400 text-xs font-black uppercase tracking-wider mt-1">Logged on {reviewingDecision.date}</p>
              </div>

              <div className="space-y-4 bg-stone-50 p-6 rounded-2xl border border-stone-100">
                <div>
                  <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Original Logic</h4>
                  <p className="text-sm font-medium text-stone-700 mt-1">{reviewingDecision.description}</p>
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Expected Outcome</h4>
                  <p className="text-sm font-semibold text-amber-950 mt-1">"{reviewingDecision.expectedOutcome}"</p>
                </div>
              </div>

              <form onSubmit={handleReviewSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-amber-900 uppercase tracking-widest">What actually happened? (Constructive Audit)</label>
                  <textarea
                    required
                    value={reviewOutcome}
                    onChange={(e) => setReviewOutcome(e.target.value)}
                    placeholder="Compare actual results to expectation. What did you learn? Did cognitive bias cloud your original logical reasoning?"
                    className="w-full px-6 py-4 bg-stone-50 border border-stone-200 rounded-2xl text-stone-800 text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none min-h-[120px]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-stone-400 uppercase tracking-widest">Current Feeling</label>
                  <select
                    value={feelingAfter}
                    onChange={(e) => setFeelingAfter(e.target.value)}
                    className="w-full px-6 py-4 bg-stone-50 border border-stone-200 rounded-2xl text-stone-900 font-bold text-sm"
                  >
                    <option value="Regret">Regret (Unnecessary spend or mistake)</option>
                    <option value="Averse">Anxious / Mixed</option>
                    <option value="Indifferent">Neutral / Indifferent</option>
                    <option value="Satisfied">Peaceful & Satisfied (Great decision!)</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setReviewingDecision(null)}
                    className="px-6 py-4 bg-stone-100 text-stone-600 rounded-xl text-xs font-black"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-10 py-4 bg-amber-500 text-stone-900 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg flex items-center space-x-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-stone-900" />
                    <span>Conclude Journal Log</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Lists Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Open Decisions Space */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-amber-500 animate-pulse" />
            <h3 className="text-xl font-black text-stone-900">Active Decision Sandbox ({openDecisions.length})</h3>
          </div>

          <div className="space-y-6">
            {openDecisions.map((decision) => (
              <motion.div
                key={decision.id}
                layoutId={`decision-${decision.id}`}
                className="bg-white border border-stone-200 rounded-3xl p-8 shadow-sm space-y-4 hover:shadow-md transition-shadow relative"
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-wider bg-stone-100 text-stone-600 px-3 py-1 rounded-full">{decision.category}</span>
                    <h4 className="text-lg font-black text-stone-900 mt-2">{decision.title}</h4>
                    <p className="text-[10px] font-bold text-stone-400 mt-1 uppercase tracking-widest">Committed on {decision.date} • Amount: ${decision.amount.toLocaleString()}</p>
                  </div>
                  <button 
                    onClick={() => handleDelete(decision.id!)}
                    className="text-stone-300 hover:text-red-500 text-xs font-black transition-colors"
                  >
                    Delete
                  </button>
                </div>

                <div className="p-4 bg-stone-50 rounded-xl border border-stone-100 space-y-2">
                  <p className="text-xs text-stone-500 font-medium">"{decision.description}"</p>
                  <div className="pt-2 border-t border-stone-200/50 flex justify-between items-center text-[10px] uppercase font-black text-stone-400">
                    <span>Mood Before: {decision.feelingBefore}</span>
                  </div>
                </div>

                <button
                  onClick={() => setReviewingDecision(decision)}
                  className="w-full flex items-center justify-between px-6 py-4 bg-amber-50 text-amber-950 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-amber-100 transition-colors"
                >
                  <span>Audit Expectation vs Reality</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            ))}

            {openDecisions.length === 0 && (
              <div className="bg-stone-50 rounded-3xl p-12 text-center text-stone-400 border border-dashed border-stone-200">
                <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-30 text-amber-500" />
                <p className="text-xs font-black uppercase tracking-widest">No active decisions needing audit.</p>
                <p className="text-xs text-stone-400 mt-2">Log major spend risks here to monitor emotional outcomes.</p>
              </div>
            )}
          </div>
        </div>

        {/* Concluded / Reviewed Decisions */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h3 className="text-xl font-black text-stone-900">Reviewed Decision Assets ({reviewedDecisions.length})</h3>
          </div>

          <div className="space-y-6">
            {reviewedDecisions.map((decision) => (
              <motion.div
                key={decision.id}
                className="bg-stone-900 text-white rounded-3xl p-8 border border-stone-800 shadow-sm space-y-4 hover:shadow-md transition-shadow relative"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-wider bg-white/10 text-stone-300 px-3 py-1 rounded-full">{decision.category}</span>
                    <h4 className="text-lg font-black mt-2 text-white">{decision.title}</h4>
                    <p className="text-[10px] font-bold text-stone-500 mt-1 uppercase tracking-widest">Audited Outcome • Amount: ${decision.amount.toLocaleString()}</p>
                  </div>
                  <button 
                    onClick={() => handleDelete(decision.id!)}
                    className="text-stone-600 hover:text-red-400 text-xs font-black transition-colors"
                  >
                    Delete
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-[10px] font-black text-stone-500 tracking-wider uppercase">Expected Outcome</p>
                    <p className="text-xs text-stone-300 font-medium mt-1">"{decision.expectedOutcome}"</p>
                  </div>

                  <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/10">
                    <p className="text-[10px] font-black text-amber-400 tracking-wider uppercase">Actual Reality Outcome</p>
                    <p className="text-xs text-stone-100 font-medium mt-1">"{decision.actualOutcome}"</p>
                  </div>
                </div>

                <div className="pt-2 flex justify-between items-center text-[10px] uppercase font-black tracking-widest text-stone-500 border-t border-white/5 select-none">
                  <span>Expectation Feeling: {decision.feelingBefore}</span>
                  <span className={cn(
                    "px-3 py-1 rounded-md mb-0 text-[10px] font-black",
                    decision.feelingAfter === 'Regret' ? "bg-rose-500/20 text-rose-400" : "bg-emerald-500/20 text-emerald-400"
                  )}>
                    Outcome: {decision.feelingAfter}
                  </span>
                </div>
              </motion.div>
            ))}

            {reviewedDecisions.length === 0 && (
              <div className="bg-stone-50 rounded-3xl p-12 text-center text-stone-400 border border-dashed border-stone-200">
                <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-30 text-stone-300" />
                <p className="text-xs font-black uppercase tracking-widest">No completed logs yet.</p>
                <p className="text-xs text-stone-400 mt-2">Completing audit steps updates and saves them here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
