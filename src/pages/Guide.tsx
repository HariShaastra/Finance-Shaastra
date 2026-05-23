import React from 'react';
import { BookOpen, Shield, Info, HelpCircle, CheckCircle, AlertTriangle, Sparkles, Bell, Compass, HeartHandshake, ShieldCheck, Flame } from 'lucide-react';
import { motion } from 'motion/react';

export const Guide = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto space-y-16 pb-24 px-6"
    >
      <header className="text-center space-y-4">
        <motion.div 
          initial={{ scale: 0.9, rotate: -3 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="inline-flex p-6 bg-stone-900 text-amber-500 rounded-[2.5rem] mb-4 shadow-xl"
        >
          <BookOpen className="w-10 h-10" />
        </motion.div>
        <div className="space-y-2">
          <div className="flex items-center justify-center space-x-2 text-amber-600 mb-1">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Mindful Heuristics</span>
          </div>
          <h2 className="text-5xl font-black text-stone-900 tracking-tight">The Shaastra Handbook</h2>
          <p className="text-stone-500 text-lg font-medium max-w-2xl mx-auto">Mastering financial judgment and self-restraint through intentional systems design.</p>
        </div>
      </header>

      {/* CORE FRAMEWORK CARDS */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white p-12 rounded-[3rem] border border-stone-200 shadow-sm space-y-12 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50 font-sans" />
        
        <div className="flex items-center space-x-5 relative z-10">
          <div className="p-4 bg-stone-900 text-amber-500 rounded-[1.5rem]">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-stone-900 tracking-tight">How to Drive Shaastra Discipline</h3>
            <p className="text-xs text-stone-400 font-bold uppercase tracking-wider mt-1">Rule-Based Behavioral Integration</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 relative z-10">
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <span className="w-8 h-8 rounded-xl bg-stone-900 text-amber-400 flex items-center justify-center font-black text-xs select-none">1</span>
              <h4 className="text-base font-black text-stone-900">Pause Before Purchase</h4>
            </div>
            <p className="text-xs text-stone-500 font-medium leading-relaxed pl-12">
              Before clicking buy on an expense, enable the <strong>3-Point Pause Module</strong>. Answering simple questions about long-term value delays impulsive dopamine surges.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <span className="w-8 h-8 rounded-xl bg-stone-900 text-amber-400 flex items-center justify-center font-black text-xs select-none">2</span>
              <h4 className="text-base font-black text-stone-900">SMS Local Processing</h4>
            </div>
            <p className="text-xs text-stone-500 font-medium leading-relaxed pl-12">
              Simply paste transaction messages containing UPI alerts or debit receipts. Deterministic parsing reads the transaction amounts without passing data to any cloud.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <span className="w-8 h-8 rounded-xl bg-stone-900 text-amber-400 flex items-center justify-center font-black text-xs select-none">3</span>
              <h4 className="text-base font-black text-stone-900">Log Emotional Spending</h4>
            </div>
            <p className="text-xs text-stone-500 font-medium leading-relaxed pl-12">
              Save transactions with their psychological triggers (Boredom relief, Stress escape, Peer pressure). Our ecological mapping plots patterns in your Insights view!
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <span className="w-8 h-8 rounded-xl bg-stone-900 text-amber-400 flex items-center justify-center font-black text-xs select-none">4</span>
              <h4 className="text-base font-black text-stone-900">Revisit Decision Outcomes</h4>
            </div>
            <p className="text-xs text-stone-500 font-medium leading-relaxed pl-12">
              Log major choices (taking a loan, starting an investment) inside the <strong>Decision Journal</strong>. Revisit weeks later to write down whether expectations matched reality.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <span className="w-8 h-8 rounded-xl bg-stone-900 text-amber-400 flex items-center justify-center font-black text-xs select-none">5</span>
              <h4 className="text-base font-black text-stone-900">Choose Your Focus Mode</h4>
            </div>
            <p className="text-xs text-stone-500 font-medium leading-relaxed pl-12">
              Switch settings to shift app messaging. Options include <strong>Debt Recovery</strong>, <strong>Emergency Rooms</strong>, <strong>Student Consistency</strong>, and <strong>Indian Household Budgets</strong>.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <span className="w-8 h-8 rounded-xl bg-stone-900 text-amber-400 flex items-center justify-center font-black text-xs select-none">6</span>
              <h4 className="text-base font-black text-stone-900">Targeted Smart Nudges</h4>
            </div>
            <p className="text-xs text-stone-500 font-medium leading-relaxed pl-12">
              Our targeted scheduler checks your latest entries. Active, daily users receive ZERO disturbing notifications. We only trigger helpful alerts for people who drift away.
            </p>
          </div>
        </div>
      </motion.section>

      {/* DETAILED FOCUS MODES MANUAL */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-stone-50 p-10 rounded-[2.5rem] border border-stone-200 space-y-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-stone-900 text-white rounded-xl">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-black text-stone-900">Understanding App Focus Settings</h3>
          </div>
          <p className="text-xs text-stone-500 font-medium leading-relaxed">
            By shifting your focus mode inside **Settings**, Finance Shaastra adjusts calculations and dashboard observations dynamically to support you emotionally:
          </p>
          <ul className="space-y-4 pt-2">
            <li className="text-xs text-stone-600 font-semibold flex items-start">
              <span className="mr-3 mt-0.5 text-amber-600 font-black">●</span>
              <div>
                <strong>Debt Recovery:</strong> Focuses scorecard math on regular, intentional micropayments. Reassures minds with calming exercises rather than rigid, scary savings indices.
              </div>
            </li>
            <li className="text-xs text-stone-600 font-semibold flex items-start">
              <span className="mr-3 mt-0.5 text-amber-600 font-black">●</span>
              <div>
                <strong>Student Consistency:</strong> Prioritizes building roots of habit tracking over raw capital generation. Perfect for lower or irregular stipends.
              </div>
            </li>
            <li className="text-xs text-stone-600 font-semibold flex items-start">
              <span className="mr-3 mt-0.5 text-amber-600 font-black">●</span>
              <div>
                <strong>Emergency Room Mode:</strong> Activates safety alerts. Highlights wants, recurring bills, and non-essential transactions for instant revision or cancellation.
              </div>
            </li>
            <li className="text-xs text-stone-600 font-semibold flex items-start">
              <span className="mr-3 mt-0.5 text-amber-600 font-black">●</span>
              <div>
                <strong>Family Responsibility:</strong> Custom allocation target focused on parent health bills, sibling education fees, and Indian family care support.
              </div>
            </li>
          </ul>
        </div>

        <div className="bg-stone-50 p-10 rounded-[2.5rem] border border-stone-200/80 space-y-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-stone-900 text-white rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-black text-stone-900">Decision Journal & Hindsight Auditing</h3>
          </div>
          <p className="text-xs text-stone-500 font-medium leading-relaxed">
            Hindsight bias makes us misremember the logic behind our historical choices once outcomes are revealed. This prevents our brains from learning from financial mistakes.
          </p>
          <div className="p-5 bg-white rounded-2xl border border-stone-150 space-y-4">
            <p className="text-[11px] text-stone-600 font-bold leading-relaxed">
              <strong>Step A: Log Before Taking Risk</strong><br />
              Log major purchases, loans, or investments, specifying amount, category, and what outcome you logically expect. Give your original expectation a written snapshot.
            </p>
            <p className="text-[11px] text-amber-800 font-bold leading-relaxed bg-amber-50 p-3 rounded-xl border border-amber-100">
              <strong>Step B: Execute the Audit</strong><br />
              Weeks later, return to the "Conclude Audit" sandbox to document reality. Compare it side by side with your expectations to track emotional trends and avoid repeating regrets.
            </p>
          </div>
        </div>
      </section>

      {/* TRUST AND POLICY CARDS */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <motion.div 
          className="bg-stone-900 text-white p-10 rounded-[2.5rem] space-y-6 shadow-xl relative overflow-hidden group border border-stone-850"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl" />
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/10 rounded-xl">
              <Shield className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="text-lg font-black tracking-tight leading-none">Strict No-AI<br/>Philosophy</h3>
          </div>
          <p className="text-xs text-stone-400 leading-relaxed font-semibold">
            Finance Shaastra operates completely through rule-based behavioral science. We do not transmit your transactions, descriptions, or choices to external large language models or cloud engines. All analyses are 100% deterministic, private, and fast.
          </p>
        </motion.div>

        <motion.div 
          className="bg-amber-500 text-stone-950 p-10 rounded-[2.5rem] space-y-6 shadow-xl relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl" />
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-stone-900/10 rounded-xl">
              <Bell className="w-6 h-6 text-stone-950" />
            </div>
            <h3 className="text-lg font-black tracking-tight leading-none">Mindful targeted<br/>Alert Heuristics</h3>
          </div>
          <p className="text-xs text-stone-900/80 leading-relaxed font-semibold">
            Alerts check transaction frequency metrics. Users logging transactions at least once every 72 hours are bypassed and receive zero disturbing triggers. We only nudge users whose self-discipline is lagging to help them build long-term streaks.
          </p>
        </motion.div>

        <motion.div 
          className="bg-white p-10 rounded-[2.5rem] border border-stone-200 space-y-6 shadow-sm"
        >
          <div className="flex items-center space-x-4 text-stone-900">
            <div className="p-3 bg-stone-50 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="text-lg font-black tracking-tight leading-none">Educational<br/>Safety</h3>
          </div>
          <p className="text-xs text-stone-500 leading-relaxed font-semibold">
            Finance Shaastra provides psychological templates and diagnostic controls based on basic heuristics. They do not represent, replace, or constitute certified regulatory or professional advisory. Your data remains stored inside your sandboxed space.
          </p>
        </motion.div>
      </section>

      <footer className="text-center pt-12 border-t border-stone-200 select-none">
        <div className="flex items-center justify-center space-x-2 text-stone-400 mb-2">
          <Info className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Finance Shaastra Framework v1.2</span>
        </div>
        <p className="text-stone-400 text-xs font-semibold">Cultivating intentionality and self-directed oversight of wealth assets.</p>
      </footer>
    </motion.div>
  );
};
