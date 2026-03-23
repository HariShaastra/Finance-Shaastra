import React, { useEffect, useState } from 'react';
import { useAuth } from '../lib/AuthProvider';
import { db, Subscription, OperationType, handleFirestoreError } from '../lib/firebase';
import { collection, query, onSnapshot, orderBy, addDoc, deleteDoc, doc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { CreditCard, Plus, Trash2, X, Save, Calendar, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export const Subscriptions = () => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<Subscription>>({
    name: '',
    amount: 0,
    frequency: 'monthly',
    category: 'Entertainment',
  });

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'users', user.uid, 'subscriptions'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subscription));
      setSubscriptions(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/subscriptions`);
    });

    return unsubscribe;
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.name || !formData.amount) return;

    try {
      await addDoc(collection(db, 'users', user.uid, 'subscriptions'), {
        ...formData,
        amount: Number(formData.amount),
        createdAt: serverTimestamp(),
      });
      setIsAdding(false);
      setFormData({ name: '', amount: 0, frequency: 'monthly', category: 'Entertainment' });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}/subscriptions`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'subscriptions', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${user.uid}/subscriptions/${id}`);
    }
  };

  const monthlyTotal = subscriptions.reduce((acc, curr) => {
    return acc + (curr.frequency === 'monthly' ? curr.amount : curr.amount / 12);
  }, 0);

  if (loading) return <div className="flex items-center justify-center h-64 text-stone-400 font-bold uppercase tracking-widest text-xs">Loading subscriptions...</div>;

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
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Recurring Expenses</span>
          </div>
          <h2 className="text-4xl font-black text-stone-900 tracking-tight">Subscriptions</h2>
          <p className="text-stone-500 mt-1 font-medium">Track your recurring payments.</p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="bg-stone-900 text-white px-8 py-4 rounded-[1.5rem] font-black flex items-center shadow-2xl hover:bg-stone-800 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-5 h-5 mr-3" />
            Add Subscription
          </button>
        )}
      </header>

      <motion.div 
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="bg-stone-900 text-white p-10 rounded-[2.5rem] shadow-2xl flex items-center justify-between overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="relative z-10">
          <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">Monthly Commitment</p>
          <p className="text-5xl font-black mt-3 tracking-tight">${monthlyTotal.toFixed(2)}</p>
        </div>
        <div className="p-6 bg-white/10 rounded-[1.5rem] backdrop-blur-md relative z-10">
          <CreditCard className="w-10 h-10 text-amber-400" />
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {isAdding && (
          <motion.div 
            key="form"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white p-10 rounded-[2.5rem] border border-stone-200 shadow-2xl relative"
          >
            <button 
              onClick={() => setIsAdding(false)}
              className="absolute top-8 right-8 p-3 hover:bg-stone-50 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-stone-400" />
            </button>

            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">Service Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-6 py-5 bg-stone-50 border-none rounded-[1.5rem] focus:ring-2 focus:ring-stone-900 font-bold text-stone-900"
                    placeholder="e.g., Netflix, Spotify"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">Amount</label>
                  <input
                    type="number"
                    required
                    min="0.01"
                    step="0.01"
                    value={formData.amount || ''}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="w-full px-6 py-5 bg-stone-50 border-none rounded-[1.5rem] focus:ring-2 focus:ring-stone-900 font-bold text-stone-900"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">Frequency</label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
                    className="w-full px-6 py-5 bg-stone-50 border-none rounded-[1.5rem] focus:ring-2 focus:ring-stone-900 font-bold text-stone-900 appearance-none"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-6 py-5 bg-stone-50 border-none rounded-[1.5rem] focus:ring-2 focus:ring-stone-900 font-bold text-stone-900"
                    placeholder="e.g., Entertainment, Software"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-stone-900 text-white py-6 rounded-[1.5rem] font-black text-xl hover:bg-stone-800 transition-all flex items-center justify-center shadow-2xl"
              >
                <Save className="w-6 h-6 mr-4" />
                Save Subscription
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {subscriptions.map((sub) => (
          <motion.div 
            layout
            key={sub.id} 
            className="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-sm flex items-center justify-between group hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="p-4 bg-stone-50 rounded-[1.25rem] mr-5 group-hover:bg-amber-50 transition-colors">
                <Calendar className="w-6 h-6 text-stone-900 group-hover:text-amber-600 transition-colors" />
              </div>
              <div>
                <h3 className="text-sm font-black text-stone-900">{sub.name}</h3>
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-1">{sub.frequency} • {sub.category}</p>
              </div>
            </div>
            <div className="text-right flex items-center">
              <div className="mr-4">
                <p className="text-sm font-black text-stone-900">${sub.amount.toFixed(2)}</p>
                <p className="text-[10px] text-stone-400 uppercase font-black tracking-widest">{sub.frequency === 'monthly' ? '/ mo' : '/ yr'}</p>
              </div>
              <button 
                onClick={() => handleDelete(sub.id!)}
                className="p-3 text-stone-200 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}

        {subscriptions.length === 0 && (
          <div className="col-span-full p-24 bg-white rounded-[3rem] border-4 border-dashed border-stone-100 text-center">
            <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-8">
              <CreditCard className="w-10 h-10 text-stone-200" />
            </div>
            <p className="text-2xl font-black text-stone-900 mb-2">No subscriptions tracked yet.</p>
            <p className="text-stone-400 font-medium">Start tracking your recurring payments to get a better view of your commitments.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
