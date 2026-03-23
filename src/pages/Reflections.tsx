import React, { useEffect, useState } from 'react';
import { useAuth } from '../lib/AuthProvider';
import { db, Reflection, OperationType, handleFirestoreError } from '../lib/firebase';
import { collection, query, onSnapshot, orderBy, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { format, startOfToday, startOfWeek, startOfMonth } from 'date-fns';
import { BookOpen, Calendar, Save, History, Plus, X, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const QUESTIONS = {
  daily: [
    'Was this expense worth it?',
    'Any unnecessary spending?',
    'What will you change tomorrow?',
  ],
  weekly: [
    'Where did you overspend?',
    'What went well?',
    'What will you change next week?',
  ],
  monthly: [
    'Biggest expense this month?',
    'Best financial decision?',
    'Key learning this month?',
  ],
};

export const Reflections = () => {
  const { user } = useAuth();
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [formData, setFormData] = useState({ q1: '', q2: '', q3: '' });

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'users', user.uid, 'reflections'),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reflection));
      setReflections(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/reflections`);
    });

    return unsubscribe;
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      let date = startOfToday();
      if (period === 'weekly') date = startOfWeek(new Date());
      if (period === 'monthly') date = startOfMonth(new Date());

      await addDoc(collection(db, 'users', user.uid, 'reflections'), {
        period,
        date: Timestamp.fromDate(date),
        ...formData,
        createdAt: serverTimestamp(),
      });
      setIsAdding(false);
      setFormData({ q1: '', q2: '', q3: '' });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}/reflections`);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-stone-400 font-bold uppercase tracking-widest text-xs">Loading reflections...</div>;

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
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Mindful Finance</span>
          </div>
          <h2 className="text-4xl font-black text-stone-900 tracking-tight">Reflections</h2>
          <p className="text-stone-500 mt-1 font-medium italic">"Your money is your teacher."</p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="bg-stone-900 text-white px-8 py-4 rounded-[1.5rem] font-black flex items-center shadow-2xl hover:bg-stone-800 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-5 h-5 mr-3" />
            New Reflection
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
              <div className="flex gap-3">
                {['daily', 'weekly', 'monthly'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPeriod(p as any)}
                    className={cn(
                      "px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all",
                      period === p ? "bg-stone-900 text-white shadow-lg" : "bg-stone-50 text-stone-400 hover:bg-stone-100"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <div className="space-y-8">
                {QUESTIONS[period].map((q, i) => (
                  <div key={i} className="space-y-3">
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">{q}</label>
                    <textarea
                      required
                      value={(formData as any)[`q${i+1}`]}
                      onChange={(e) => setFormData({ ...formData, [`q${i+1}`]: e.target.value })}
                      className="w-full px-6 py-5 bg-stone-50 border-none rounded-[1.5rem] focus:ring-2 focus:ring-stone-900 font-bold text-stone-900 min-h-[120px]"
                      placeholder="Reflect here..."
                    />
                  </div>
                ))}
              </div>

              <button
                type="submit"
                className="w-full bg-stone-900 text-white py-6 rounded-[1.5rem] font-black text-xl hover:bg-stone-800 transition-all flex items-center justify-center shadow-2xl"
              >
                <Save className="w-6 h-6 mr-4" />
                Save Reflection
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
            {reflections.map((ref) => (
              <div key={ref.id} className="bg-white p-10 rounded-[2.5rem] border border-stone-200 shadow-sm space-y-8 hover:shadow-md transition-shadow group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-4 bg-stone-50 rounded-[1.5rem] mr-5 group-hover:bg-amber-50 transition-colors">
                      <BookOpen className="w-8 h-8 text-stone-900 group-hover:text-amber-600 transition-colors" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-stone-900 capitalize">{ref.period} Reflection</h3>
                      <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mt-1">
                        {format(ref.date?.toDate ? ref.date.toDate() : new Date(ref.date), 'MMMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {QUESTIONS[ref.period].map((q, i) => (
                    <div key={i} className="space-y-2">
                      <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">{q}</p>
                      <p className="text-sm text-stone-600 font-bold italic leading-relaxed">"{(ref as any)[`q${i+1}`]}"</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {reflections.length === 0 && (
              <div className="col-span-full p-24 bg-white rounded-[3rem] border-4 border-dashed border-stone-100 text-center">
                <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-8">
                  <History className="w-10 h-10 text-stone-200" />
                </div>
                <p className="text-2xl font-black text-stone-900 mb-2">No reflections yet.</p>
                <p className="text-stone-400 font-medium">Start reflecting on your financial journey today.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
