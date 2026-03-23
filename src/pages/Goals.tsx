import React, { useEffect, useState } from 'react';
import { useAuth } from '../lib/AuthProvider';
import { db, Goal, OperationType, handleFirestoreError } from '../lib/firebase';
import { collection, query, onSnapshot, orderBy, addDoc, updateDoc, doc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { format, differenceInDays } from 'date-fns';
import { Target, Plus, Save, X, Trash2, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export const Goals = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<Goal>>({
    title: '',
    targetAmount: 0,
    currentAmount: 0,
    deadline: new Date().toISOString().split('T')[0],
    status: 'active',
  });

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'users', user.uid, 'goals'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Goal));
      setGoals(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/goals`);
    });

    return unsubscribe;
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.title || !formData.targetAmount) return;

    try {
      await addDoc(collection(db, 'users', user.uid, 'goals'), {
        ...formData,
        targetAmount: Number(formData.targetAmount),
        currentAmount: Number(formData.currentAmount),
        deadline: Timestamp.fromDate(new Date(formData.deadline as string)),
        createdAt: serverTimestamp(),
      });
      setIsAdding(false);
      setFormData({ title: '', targetAmount: 0, currentAmount: 0, deadline: new Date().toISOString().split('T')[0], status: 'active' });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}/goals`);
    }
  };

  const handleUpdateAmount = async (goalId: string, newAmount: number) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid, 'goals', goalId), {
        currentAmount: newAmount,
        status: newAmount >= goals.find(g => g.id === goalId)!.targetAmount ? 'completed' : 'active',
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}/goals/${goalId}`);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-stone-400 font-bold uppercase tracking-widest text-xs">Loading goals...</div>;

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
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Future Planning</span>
          </div>
          <h2 className="text-4xl font-black text-stone-900 tracking-tight">Savings Goals</h2>
          <p className="text-stone-500 mt-1 font-medium">What are you working towards?</p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="bg-stone-900 text-white px-8 py-4 rounded-[1.5rem] font-black flex items-center shadow-2xl hover:bg-stone-800 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-5 h-5 mr-3" />
            New Goal
          </button>
        )}
      </header>

      <AnimatePresence mode="wait">
        {isAdding ? (
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
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">Goal Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-6 py-5 bg-stone-50 border-none rounded-[1.5rem] focus:ring-2 focus:ring-stone-900 font-bold text-stone-900"
                    placeholder="e.g., Emergency Fund, New Car"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">Target Amount</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.targetAmount || ''}
                    onChange={(e) => setFormData({ ...formData, targetAmount: Number(e.target.value) })}
                    className="w-full px-6 py-5 bg-stone-50 border-none rounded-[1.5rem] focus:ring-2 focus:ring-stone-900 font-bold text-stone-900"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">Current Savings</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.currentAmount || ''}
                    onChange={(e) => setFormData({ ...formData, currentAmount: Number(e.target.value) })}
                    className="w-full px-6 py-5 bg-stone-50 border-none rounded-[1.5rem] focus:ring-2 focus:ring-stone-900 font-bold text-stone-900"
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">Deadline</label>
                  <input
                    type="date"
                    required
                    value={formData.deadline as string}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full px-6 py-5 bg-stone-50 border-none rounded-[1.5rem] focus:ring-2 focus:ring-stone-900 font-bold text-stone-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-stone-900 text-white py-6 rounded-[1.5rem] font-black text-xl hover:bg-stone-800 transition-all flex items-center justify-center shadow-2xl"
              >
                <Save className="w-6 h-6 mr-4" />
                Create Goal
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div 
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {goals.map((goal) => {
              const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
              const deadline = goal.deadline?.toDate ? goal.deadline.toDate() : new Date(goal.deadline);
              const daysLeft = differenceInDays(deadline, new Date());

              return (
                <div key={goal.id} className="bg-white p-10 rounded-[2.5rem] border border-stone-200 shadow-sm space-y-8 hover:shadow-md transition-shadow group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-4 bg-stone-50 rounded-[1.5rem] mr-5 group-hover:bg-amber-50 transition-colors">
                        <Target className="w-8 h-8 text-stone-900 group-hover:text-amber-600 transition-colors" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-stone-900">{goal.title}</h3>
                        <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mt-1">Target: ${goal.targetAmount.toLocaleString()}</p>
                      </div>
                    </div>
                    {goal.status === 'completed' && <CheckCircle className="w-8 h-8 text-emerald-600" />}
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">
                      <span>Progress</span>
                      <span>{progress.toFixed(1)}%</span>
                    </div>
                    <div className="h-4 bg-stone-50 rounded-full overflow-hidden p-1">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(progress, 100)}%` }}
                        className="h-full bg-stone-900 rounded-full shadow-sm"
                      />
                    </div>
                    <div className="flex justify-between text-xs font-bold text-stone-500">
                      <span>${goal.currentAmount.toLocaleString()} saved</span>
                      <span className="text-stone-400">${Math.max(0, goal.targetAmount - goal.currentAmount).toLocaleString()} left</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-8 border-t border-stone-100">
                    <div className={cn(
                      "flex items-center text-[10px] font-black uppercase tracking-[0.2em]",
                      daysLeft > 0 ? "text-stone-400" : "text-rose-600"
                    )}>
                      <AlertCircle className="w-4 h-4 mr-2" />
                      {daysLeft > 0 ? `${daysLeft} days left` : 'Deadline passed'}
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleUpdateAmount(goal.id!, goal.currentAmount + 100)}
                        className="px-6 py-3 bg-stone-50 text-stone-900 text-xs font-black rounded-xl hover:bg-stone-100 transition-colors uppercase tracking-widest"
                      >
                        +$100
                      </button>
                      <button 
                        onClick={() => handleUpdateAmount(goal.id!, goal.targetAmount)}
                        className="px-6 py-3 bg-stone-900 text-white text-xs font-black rounded-xl hover:bg-stone-800 transition-colors uppercase tracking-widest shadow-lg"
                      >
                        Complete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {goals.length === 0 && (
              <div className="col-span-full p-24 bg-white rounded-[3rem] border-4 border-dashed border-stone-100 text-center">
                <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-8">
                  <Target className="w-10 h-10 text-stone-200" />
                </div>
                <p className="text-2xl font-black text-stone-900 mb-2">No goals yet.</p>
                <p className="text-stone-400 font-medium">Set your first savings goal and track your progress.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
