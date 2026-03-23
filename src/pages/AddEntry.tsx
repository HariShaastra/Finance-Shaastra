import React, { useState } from 'react';
import { useAuth } from '../lib/AuthProvider';
import { db, Entry, OperationType, handleFirestoreError } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle, HelpCircle, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

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
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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
  });

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
      await addDoc(collection(db, 'users', user.uid, 'entries'), entryData);
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
          <h2 className="text-3xl font-black text-stone-900 tracking-tight">Add Entry</h2>
        </div>
        <div className="p-2 bg-amber-100 text-amber-600 rounded-xl">
          <Sparkles className="w-6 h-6" />
        </div>
      </header>

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

        {/* Behavioral Tracking (Only for Expenses) */}
        {formData.type === 'expense' && (
          <div className="p-8 bg-stone-50 rounded-[2rem] space-y-8 border border-stone-100">
            <h4 className="text-xs font-black text-stone-900 uppercase tracking-widest flex items-center">
              <AlertCircle className="w-4 h-4 mr-2 text-amber-600" />
              Behavioral Insights
            </h4>
            
            <div className="flex flex-wrap gap-8">
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
                <span className="ml-4 text-sm font-bold text-stone-600 group-hover:text-stone-900 transition-colors">Do you regret this?</span>
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
